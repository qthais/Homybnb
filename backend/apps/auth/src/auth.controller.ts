import {
  AuthServiceController,
  AuthServiceControllerMethods,
  LoginDto,
  LoginOauthDto,
  LoginResponseDto,
  Payload,
  RegisterDto,
  Tokens,
  User,
} from '@app/common';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}
  async loginWithOauth(
    loginOauthDto: LoginOauthDto,
  ): Promise<LoginResponseDto> {
    const res: LoginResponseDto =
      await this.authService.loginWithOauth(loginOauthDto);
    return res;
  }
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const res: LoginResponseDto = await this.authService.login(loginDto);
    return res;
  }
  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.authService.register(registerDto);
    return user;
  }
  async refreshToken(payload: Payload): Promise<Tokens> {
    return await this.authService.refreshToken(payload);
  }
}
