import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth-jwt.guard';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CA } from './dto/ca.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/verify')
  @UseGuards(JwtAuthGuard)
  hadleAuth(@Body() body: AuthDto) {
    return this.authService.handleAuth(body);
  }

  @Post('/register')
  @UseGuards(JwtAuthGuard)
  handleRegister(@Body() ca: CA) {
    return this.authService.handleRegister(ca);
  }

  @Patch('/:caId/accept')
  @UseGuards(JwtAuthGuard)
  handleAccept(@Param('caId') caId: string) {
    return this.authService.handleConsent(caId, 'accept');
  }

  @Patch('/:caId/reject')
  @UseGuards(JwtAuthGuard)
  handleReject(@Param('caId') caId: string) {
    return this.authService.handleConsent(caId, 'reject');
  }

  @Patch('/:caId/revoke')
  @UseGuards(JwtAuthGuard)
  handleRevoke(@Param('caId') caId: string) {
    return this.authService.handleConsent(caId, 'revoke');
  }
}
