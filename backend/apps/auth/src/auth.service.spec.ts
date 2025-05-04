import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/PrismaService';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcryptjs';
import cleanUser from '@app/common/functions/cleanUser';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  account: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mockReturningToken'),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
    if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw if email or password is missing', async () => {
      try {
        await service.login({ email: '', password: '' });
      } catch (e) {
        expect(e).toBeInstanceOf(RpcException);
        expect(e.getError().details).toBe('Email and password are required!');
        expect(e.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should throw if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      try {
        await service.login({ email: 'test@example.com', password: '123456' });
      } catch (e) {
        expect(e.getError().details).toBe('Invalid credentials!');
        expect(e.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should throw if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        hashedPassword: 'hashed',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      try {
        await service.login({ email: 'test@example.com', password: 'wrong' });
      } catch (e) {
        expect(e.getError().details).toBe('Invalid credentails!');
        expect(e.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should return tokens if credentials are valid', async () => {
      const user = {
        id: 'u1',
        email: 'test@example.com',
        hashedPassword: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login({
        email: user.email,
        password: '123456',
      });
      console.log(result);
      expect(result.user).toEqual(cleanUser(user));
      expect(result.tokens.accessToken).toBe('mockReturningToken');
    });
  });

  describe('register', () => {
    it('should throw if fields are missing', async () => {
      try {
        await service.register({ email: '', name: '', password: '' });
      } catch (e) {
        expect(e.getError().details).toBe(
          'Email, name, and password are required!',
        );
        expect(e.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should throw if user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'test@example.com',
      });
      try {
        await service.register({
          email: 'test@example.com',
          name: 'User',
          password: '123456',
        });
      } catch (e) {
        expect(e.getError().details).toBe(
          'User with this email already exists!',
        );
        expect(e.getError().code).toBe(status.ALREADY_EXISTS);
      }
    });

    it('should create a new user if valid', async () => {
      const mockUser = {
        id: 'u1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        name: 'User',
        password: '123456',
      });
      console.log({ registerUser: result });
      expect(result).toEqual(cleanUser(mockUser));
    });
  });
});
