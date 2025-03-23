import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME, AuthServiceClient, LoginDto, LoginOauthDto, RegisterDto } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly client:ClientGrpc
  ){}
  async login(loginDto:LoginDto){
    const source= this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME).login(loginDto)
    const user= await lastValueFrom(source)
    return user
  }
  async register(registerDto:RegisterDto){
    const source= this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME).register(registerDto)
    const user= await lastValueFrom(source)
    return user
  }
  async loginWithOauth(loginOauthDto:LoginOauthDto){
    const source= this.client.getService<AuthService>(AUTH_SERVICE_NAME).loginWithOauth(loginOauthDto)
    const user= await lastValueFrom(source)
    console.log(user)
    return user
  }
}
