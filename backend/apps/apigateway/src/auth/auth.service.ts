import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME, AuthServiceClient, LoginDto, LoginOauthDto, Payload, RegisterDto } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService:AuthServiceClient
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly client:ClientGrpc
  ){}
  onModuleInit() {
    this.authService=this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME)
  }
  async login(loginDto:LoginDto){
    const $source= this.authService.login(loginDto)
    const res= await lastValueFrom($source)
    console.log(res.user)
    return res
  }
  async register(registerDto:RegisterDto){
    const $source= this.authService.register(registerDto)
    const user= await lastValueFrom($source)
    return user
  }
  async loginWithOauth(loginOauthDto:LoginOauthDto){
    const $source= this.authService.loginWithOauth(loginOauthDto)
    const res= await lastValueFrom($source)
    return res
  }
  async refreshToken(payload:Payload){
    const $source= this.client.getService<AuthService>(AUTH_SERVICE_NAME).refreshToken(payload)
    const res= await lastValueFrom($source)
    return res
  }
}
