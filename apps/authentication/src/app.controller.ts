import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
    private healthCheckService: HealthCheckService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/health')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Health Check Status' })
  @ApiResponse({
    status: 200,
    description: 'Result Report for All the Health Check Services',
  })
  async checkHealth() {
    return this.healthCheckService.check([
      async () =>
        this.http.pingCheck(
          'Basic Check',
          `http://localhost:${
            this.configService.get<number>('PORT') || 6000
          }/api`,
        ),
    ]);
  }
  @Post()
  getPostHello(): string {
    return this.appService.getHello();
  }
}
