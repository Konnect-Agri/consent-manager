import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ReqCheckerController } from './req-checker.controller';
import { ReqCheckerService } from './req-checker.service';

@Module({
  imports: [HttpModule],
  providers: [
    ReqCheckerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [ReqCheckerController],
})
export class ReqCheckerModule { }
