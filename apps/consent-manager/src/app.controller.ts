import { HttpService } from '@nestjs/axios';
import { Body, CACHE_MANAGER, Controller, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Res } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RedisOptions, Transport } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiskHealthIndicator, HealthCheck, HealthCheckService, HttpHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../prisma/prisma.health';
import { CAObject, CAStates, ConsentAction, GetCAResponse, RequestBody, WebhookRequest } from './app.interface';
import { AppService } from './app.service';
import { ConsentArtifact, TheProofSchema } from './types/consentArtifact';
import { CARequests } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private http: HttpHealthIndicator,
    private prismaIndicator: PrismaHealthIndicator,
    private healthCheckService: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly redis: Cache,
    @Inject('CLICK_SERVICE') private clickServiceClient: ClientProxy
  ) { }

  @Get('/health')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Health Check Status' })
  @ApiResponse({ status: 200, description: 'Result Report for All the Health Check Services' })
  async checkHealth() {
    return this.healthCheckService.check([
      async () => this.http.pingCheck('Basic Check', `http://localhost:${this.configService.get<number>('PORT') || 3333}/api`),
      async () => this.prismaIndicator.isHealthy('Db'),
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
      async () => this.microservice.pingCheck('RabbitMq', {
        transport: Transport.RMQ,
        options: {
          host: this.configService.get<string>('RMQ_HOST'),
          port: this.configService.get<number>('RMQ_PORT')
        },
      }),
      async () => this.microservice.pingCheck<RedisOptions>('Redis', {
        transport: Transport.REDIS,
        options: {
          host: this.configService.get<string>('REDIS_HOST'),
          port: this.configService.get<number>('REDIS_PORT')
        },
      }),
    ])
  }

  @ApiOperation({ summary: 'Verify CA' })
  @ApiResponse({ type: GetCAResponse, status: 200, description: 'Get CA details' })
  @Post('verify/')
  async verifyCA(@Body() caRequest: object): Promise<any> {
    const ca: CARequests = await this.appService.getCA(caRequest["caId"]);
    const status = await this.appService.updateFrequency(ca);
    if (status === 200) {
      return ca;
    } else if (status === 403) {
      throw new HttpException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Consent has been revoked for this artifact',
        message: 'Consent has been revoked for this artifact',
      }, 403);
    } else if (status === 410) {
      throw new HttpException({
        statusCode: HttpStatus.GONE,
        error: 'Requested Consent Artifact has expired',
        message: 'Requested Consent Artifact has expired',
      }, 410);
    } else if (status === 429) {
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded.',
      }, 429);
    } else if (status === 404) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Consent Artifact not Found',
        message: 'Consent Artifact not Found.',
      }, 404);
    } else {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Inernal Server Error',
        message: 'Internal Server Error.',
      }, 404);
    }
  }

  @ApiOperation({ summary: 'Revoke CA' })
  @ApiResponse({ type: CAObject, status: 200, description: 'Revoke a CA' })
  @Patch('/:caId/revoke')
  revokeCA(@Param('caId') caId: string): Promise<any> {
    return this.appService.updateCaStatus(caId, CAStates.REVOKED);
  }

  @ApiOperation({ summary: 'Accept CA' })
  @ApiResponse({ type: ConsentAction, status: 200, description: 'Approve a CA Request' })
  @Patch('/:caId/accept')
  async approveCA(@Param('caId') caId: string): Promise<CARequests> {
    const caRequest: CARequests = await this.appService.updateCaStatus(caId, CAStates.ACCEPT);
    const payload = this.appService.tokenizeRequest(caRequest.consent_artifact as ConsentArtifact);
    const body: ConsentArtifact = { ...caRequest.consent_artifact as ConsentArtifact, proof: payload };
    const updatedCARequest: CARequests = await this.appService.updateProof(caId, body, CAStates.ACCEPT);
    return updatedCARequest;
  }

  @ApiOperation({ summary: 'Decline CA' })
  @ApiResponse({ type: ConsentAction, status: 200, description: 'Reject a CA Request' })
  @Patch('/:caId/decline')
  async rejectCA(@Param('caId') caId: string): Promise<CARequests> {
    const caRequest = await this.appService.updateCaStatus(caId, CAStates.DECLINE);
    return caRequest;
  }

  @ApiOperation({ summary: 'Register CA' })
  @ApiResponse({ type: CAObject, status: 200, description: 'Create a new CA Request entry' })
  @Post('/register')
  register(@Body() ca: ConsentArtifact): Promise<CARequests> {
    return this.appService.register(ca, ca.user.id, ca.consumer.url);
  }
}
