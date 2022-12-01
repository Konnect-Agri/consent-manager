import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import redisStore from 'cache-manager-redis-store';
import { PrismaHealthIndicator } from 'prisma/prisma.health';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule.register({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'CLICK_SERVICE',
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RMQ_URL')],
            queue: config.get<string>('RMQ_QUEUE'),
            queueOptions: {
              durable: config.get<boolean>('RMQ_QUEUE_DURABLE'),
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    TerminusModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, PrismaHealthIndicator],
})
export class AppModule { }
