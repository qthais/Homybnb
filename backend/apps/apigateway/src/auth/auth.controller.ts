import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@app/common';
import { ResponseDto } from '../utils/types/HttpResponse';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto:LoginDto){
    const user=await this.authService.login(loginDto)
    return new ResponseDto(HttpStatus.OK, 'Login successfully', {user});
  }
  @Post('/register')
  @HttpCode(201)
  async register(@Body() registerDto:RegisterDto){
    const user=await this.authService.register(registerDto)
    return new ResponseDto(HttpStatus.OK, 'Register successfully', {user});
  }
}
