import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReqCheckerModule } from './req-checker/req-checker.module';

@Module({
  imports: [
    ReqCheckerModule,
    ThrottlerModule.forRoot({
      ttl: 120,
      limit: 2,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
