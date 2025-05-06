import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  LoginOauthDto,
  Payload,
} from '@app/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    loginWithOauth: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should call login on service with correct payload', async () => {
    const dto: LoginDto = { email: 'test@test.com', password: 'pass' };
    const expected = { user: {}, tokens: {} };
    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);
    expect(result).toEqual(expected);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('should call register on service with correct payload', async () => {
    const dto: RegisterDto = { email: 'test@test.com', password: 'pass', name: 'Test' };
    const expected = { id: 'u1', email: dto.email };
    mockAuthService.register.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toEqual(expected);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('should call loginWithOauth on service with correct payload', async () => {
    const dto: LoginOauthDto = {
      email: 'test@test.com',
      name: 'Test',
      provider: 'google',
      providerAccountId: '123',
      image: '',
      userId:'abc',
      type:'test',
      accessToken: 'abc',
      refreshToken: 'xyz',
      expiresAt: 1234,
      scope: 'openid',
      tokenType: 'Bearer',
    };
    const expected = { user: {}, tokens: {} };
    mockAuthService.loginWithOauth.mockResolvedValue(expected);

    const result = await controller.loginWithOauth(dto);
    expect(result).toEqual(expected);
    expect(service.loginWithOauth).toHaveBeenCalledWith(dto);
  });
  it('should call refreshToken on service with correct payload', async () => {
    const payload: Payload = {
      email: 'test@test.com',
      sub: { userId: 'u1' },
    };
    const expected = { accessToken: 'abc', refreshToken: 'xyz',expiresIn:'123' };
    mockAuthService.refreshToken.mockResolvedValue(expected);

    const result = await controller.refreshToken(payload);
    expect(result).toEqual(expected);
    expect(service.refreshToken).toHaveBeenCalledWith(payload);
  });
});
