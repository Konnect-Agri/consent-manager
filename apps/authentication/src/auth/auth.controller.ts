import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { parseJwt } from '../helpers/decodeToken';
import { JwtAuthGuard } from './auth-jwt.guard';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CA } from './dto/ca.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/verify')
  @UseGuards(JwtAuthGuard)
  hadleAuth(@Body() body: AuthDto, @Request() req) {
    return this.authService.handleAuth(body, req?.headers?.authorization);
  }

  @Post('/register')
  @UseGuards(JwtAuthGuard)
  handleRegister(@Body() ca: CA, @Request() req) {
    return this.authService.handleRegister(ca, req?.headers?.authorization);
  }

  @Patch('/:caId/accept')
  @UseGuards(JwtAuthGuard)
  handleAccept(@Param('caId') caId: string, @Request() req) {
    return this.authService.handleConsent(caId, 'accept', req?.headers?.authorization);
  }

  @Patch('/:caId/reject')
  @UseGuards(JwtAuthGuard)
  handleReject(@Param('caId') caId: string, @Request() req) {
    return this.authService.handleConsent(caId, 'reject', req?.headers?.authorization);
  }

  @Patch('/:caId/revoke')
  @UseGuards(JwtAuthGuard)
  handleRevoke(@Param('caId') caId: string, @Request() req) {
    return this.authService.handleConsent(caId, 'revoke', req?.headers?.authorization);
  }
}
