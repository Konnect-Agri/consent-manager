import { Body, Controller, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) { }

  @Get('/:email')
  getUserDetails(@Param('email') email: string) {
    return this.userService.getUserDetails(email);
  }

  @Patch('/updateUserCaIds')
  updateUserCaIds(@Body() data, @Request() req) {
    return this.userService.updateUserCaIds(data, req?.headers?.authorization)
  }

  @Post('/checkPermission')
  checkPermission(@Body() data, @Request() req) {
    return this.userService.checkPermission(data, req?.headers?.authorization)
  }
}
