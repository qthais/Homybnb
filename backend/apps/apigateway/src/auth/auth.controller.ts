import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginOauthDto, Payload, RegisterDto } from '@app/common';
import { ResponseDto } from '../utils/types/HttpResponse';
import { RefreshJwtGuard } from '../guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto:LoginDto){
    const res=await this.authService.login(loginDto)
    return new ResponseDto(HttpStatus.OK, 'Login successfully', {...res});
  }

  @Post('/login/oauth')
  @HttpCode(200)
  async loginWithOauth(@Body() loginOauthDto:LoginOauthDto){
    const res=await this.authService.loginWithOauth(loginOauthDto)
    return new ResponseDto(HttpStatus.OK, 'Login successfully', {...res});
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() registerDto:RegisterDto){
    const user=await this.authService.register(registerDto)
    return new ResponseDto(HttpStatus.OK, 'Register successfully', {user});
  }

  @UseGuards(RefreshJwtGuard)
  @Post('/refresh')
  @HttpCode(200)
  async refreshToken(@Request() req){
    const res=await this.authService.refreshToken(req.user)
    return new ResponseDto(HttpStatus.OK,"Refresh token successfully",{tokens:res})
  }
}
