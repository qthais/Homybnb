import { AuthServiceController, AuthServiceControllerMethods, LoginDto, RegisterDto, User } from '@app/common';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
    constructor(private readonly authService:AuthService){}
    async login(loginDto: LoginDto):Promise<User>{
        try{
            const user=await this.authService.login(loginDto)
            return user
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
    
}
