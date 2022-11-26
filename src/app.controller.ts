import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Controller, Get, HttpException, HttpStatus, Inject, Param, Patch, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RedisOptions, Transport } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiskHealthIndicator, HealthCheck, HealthCheckService, HttpHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from 'prisma/prisma.health';
import { CAObject, CAStates, ConsentAction, GetCAResponse, RequestBody, WebhookRequest } from './app.interface';
import { AppService } from './app.service';

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

  @ApiOperation({ summary: 'Get CA' })
  @ApiResponse({ type: GetCAResponse, status: 200, description: 'Get CA details' })
  @Get('/:caId')
  getCA(@Param('caId') caId: string): Promise<any> {
    // TODO: can implement ttl check here
    const ca = this.appService.getCA(caId);
    if (ca != null) {
      const count = this.appService.getQueryCountByKey(ca['caId']);
      ca['query_count'] = count;
      return ca;
    }
    else {
      throw new HttpException("Error: No Consent Artifact Found", HttpStatus.BAD_REQUEST);
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
  approveCA(@Param('caId') caId: string): any {
    const caRequest = this.appService.updateCaStatus(caId, CAStates.ACCEPT);
    const payload = this.appService.tokenizeRequest(caRequest.consent_artifact);
    const body: ConsentAction = { status: CAStates.ACCEPT, payload: payload };
    if (caRequest.webhook_url.options == null) {
      this.httpService.post(caRequest.webhook_url.url, body);
    }
    else {
      this.httpService.post(caRequest.webhook_url.url, body, caRequest.webhook_url.options);
    }
  }

  @ApiOperation({ summary: 'Decline CA' })
  @ApiResponse({ type: ConsentAction, status: 200, description: 'Reject a CA Request' })
  @Patch('/:caId/decline')
  rejectCA(@Param('caId') caId: string): any {
    const caRequest = this.appService.updateCaStatus(caId, CAStates.DECLINE);
    const body: ConsentAction = { status: CAStates.DECLINE, payload: null };
    if (caRequest.webhook_url.options == null) {
      this.httpService.post(caRequest.webhook_url.url, body);
    }
    else {
      this.httpService.post(caRequest.webhook_url.url, body, caRequest.webhook_url.options);
    }
  }

  @ApiOperation({ summary: 'Register CA' })
  @ApiResponse({ type: CAObject, status: 200, description: 'Create a new CA Request entry' })
  @ApiBody({ type: RequestBody })
  @Post('/register')
  register(ca: any, userId: string, webhookUrl: WebhookRequest): any {
    return this.appService.register(ca, userId, webhookUrl);
  }
}
