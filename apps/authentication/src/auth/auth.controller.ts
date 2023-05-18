import { HttpService } from '@nestjs/axios';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth-jwt.guard';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  hadleAuth(@Body() body: AuthDto) {
    return this.authService.handleAuth(body);
  }
}
