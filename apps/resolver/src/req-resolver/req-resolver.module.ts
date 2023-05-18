import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReqResolverController } from './req-resolver.controller';
import { ReqResolverService } from './req-resolver.service';

@Module({
  imports: [HttpModule],
  providers: [ReqResolverService],
  controllers: [ReqResolverController],
})
export class ReqResolverModule { }
