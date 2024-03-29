import { Body, Controller, Post } from '@nestjs/common';
import { ReqResolverService } from './req-resolver.service';

@Controller('req-resolver')
export class ReqResolverController {
  constructor(private readonly resolverService: ReqResolverService) { }

  @Post()
  resolveQuery(@Body() body) {
    console.log('body: ', body);
    return this.resolverService.resolveQuery(body);
  }
}
