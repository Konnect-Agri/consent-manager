import { Body, Controller, Post } from '@nestjs/common';
import { ReqCheckerService } from './req-checker.service';

@Controller('req-checker')
export class ReqCheckerController {
  constructor(private readonly reqCheckerService: ReqCheckerService) { }

  @Post()
  async reqChecker(@Body() body) {
    console.log('body: ', body);
    console.log('consentArtifact: ', body.consentArtifact);
    console.log('requestType: ', body.requestType)
    console.log('gql: ', body.gql)
    console.log('queryObject: ', body.queryObject)
    return this.reqCheckerService.reqChecker(body);
  }
}
