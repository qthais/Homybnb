import { AuthServiceController, AuthServiceControllerMethods, LoginDto, LoginOauthDto, LoginResponseDto, Payload, RegisterDto, Tokens, User } from '@app/common';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
    constructor(private readonly authService:AuthService){}
    async loginWithOauth(loginOauthDto: LoginOauthDto): Promise<LoginResponseDto> {
        try{
            const res:LoginResponseDto=await this.authService.loginWithOauth(loginOauthDto)
            return res
        }catch(err){
            throw (err)
        }
    }
    async login(loginDto: LoginDto):Promise<LoginResponseDto>{
        try{
            const res:LoginResponseDto=await this.authService.login(loginDto)
            return res
        }catch(err){
            throw (err)
        }
    }
    async register(registerDto:RegisterDto):Promise<User>{
        try{
            const user = await this.authService.register(registerDto)
            return user
        }catch(err){
            throw err
        }
    }
    async refreshToken(payload: Payload): Promise<Tokens>  {
        try{
            return await this.authService.refreshToken(payload)
        }catch(err){
            throw(err)
        }
    }
    
}
