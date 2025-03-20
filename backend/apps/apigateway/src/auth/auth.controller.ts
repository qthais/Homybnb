import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '@app/common';
import { ResponseDto } from '../utils/types/HttpResponse';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto:LoginDto){
    const user=await this.authService.login(loginDto)
    return new ResponseDto(HttpStatus.OK, 'Login successful', {user});
  }
}
