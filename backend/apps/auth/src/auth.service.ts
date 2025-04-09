import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { LoginDto, LoginOauthDto, Payload, RegisterDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcryptjs';
import cleanUser from '@app/common/functions/cleanUser';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService,
     private readonly configService:ConfigService,
     private readonly jwtService:JwtService,
    ) {}
  async login(loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Email and password are required!',
      });
    }
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        accounts: true,
      },
    });
    if (!existingUser) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Invalid credentials!',
      });
    }
    const isCorrectPassword = await bcrypt.compare(
      loginDto.password,
      existingUser.hashedPassword!,
    );
    if (!isCorrectPassword) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Invalid credentails!',
      });
    }
    const payload={
      email:existingUser.email!,
      sub:{
        userId:existingUser.id
      }
    }
    const {accessToken,refreshToken,expiresIn}=await this.issueToken(payload)

    return {user:cleanUser(existingUser),tokens:{accessToken,refreshToken,expiresIn}};
  }
  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    if (!email || !name || !password) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Email, name, and password are required!',
      });
    }

    // Check if the user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        details: 'User with this email already exists!',
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await this.prismaService.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // Return the cleaned user data
    return cleanUser(newUser);
  }
  async loginWithOauth(loginOauthDto: LoginOauthDto) {
    const {
      email,
      name,
      provider,
      providerAccountId,
      image,
      accessToken:oauthAccessToken,
      refreshToken:oauthRefreshToken,
      expiresAt,
      scope,
      tokenType,
    } = loginOauthDto;
    if (!email || !provider || !providerAccountId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Missing required OAuth login fields',
      });
    }
    try{
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          accounts: true,
        },
      });
      if (existingUser) {
        const payload={
          email:existingUser.email!,
          sub:{
            userId:existingUser.id
          }
        }
        const {accessToken,refreshToken,expiresIn}=await this.issueToken(payload)
        const existingAccount = existingUser.accounts.find(
          (account) =>
            account.provider === provider &&
            account.providerAccountId === providerAccountId
        );
        if(existingAccount){
          await this.prismaService.account.update({
            where: { id: existingAccount?.id },
            data: {
              access_token: oauthAccessToken,
              refresh_token: oauthRefreshToken,
              token_type: tokenType,
              expires_at: expiresAt,
              scope,
            },
          });
        }
        else {
          await this.prismaService.account.create({
            data: {
              userId: existingUser.id,
              provider,
              providerAccountId,
              access_token: oauthAccessToken,
              refresh_token: oauthRefreshToken,
              token_type: tokenType,
              type: 'oauth',
              scope,
            },
          });
        }
        let updatedUser=existingUser
        if(
          name!==existingUser.name||image!==existingUser.image
        ){
          updatedUser=await this.prismaService.user.update({
            where: { id: existingUser.id },
            data: {
              name: name || existingUser.name,
              image: image || existingUser.image,
            },
            include:{
              accounts:true
            }
          });
        }
        return {user:cleanUser(updatedUser),tokens:{accessToken,refreshToken,expiresIn}};
      }
      const newUser = await this.prismaService.user.create({
        data: {
          email,
          name,
          image,
          accounts: {
            create: {
              provider,
              providerAccountId,
              access_token: oauthAccessToken,
              refresh_token: oauthRefreshToken,
              token_type: tokenType,
              expires_at: expiresAt,
              type: 'oauth',
              scope,
            },
          },
        },
        include: {
          accounts: true,
        },
      });
      const payload={
        email:newUser.email!,
        sub:{
          userId:newUser.id
        }
      }
      const {accessToken,refreshToken,expiresIn}=await this.issueToken(payload)
  
      return {user:cleanUser(newUser),tokens:{accessToken,refreshToken,expiresIn}};
    }catch(error){
      if (error instanceof RpcException) {
        throw error; // Propagate the original NOT_FOUND error
      }
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error fetching user',
      });
    }
  }
  async refreshToken(payload:Payload){
    if(!payload){
      throw new RpcException({
        code:status.INVALID_ARGUMENT,
        details:"Payload not provided!"
      })
    }
    const {accessToken,refreshToken,expiresIn}=await this.issueToken(payload)
    return {accessToken,refreshToken,expiresIn}
  }

  private async issueToken (payload:Payload){
    const accessTokenExpiresInSec = 60 * 60; // 1 hour
    const refreshTokenExpiresInSec = 60 * 60 * 24 * 7; 
    const now=Math.floor(Date.now()/1000)
    const accessToken=await this.jwtService.signAsync(payload,{
      expiresIn:accessTokenExpiresInSec,
      secret:this.configService.get<string>('JWT_ACCESS_SECRET')
    })
    const refreshToken=await this.jwtService.signAsync(payload,{
      expiresIn:refreshTokenExpiresInSec,
      secret:this.configService.get<string>('JWT_REFRESH_SECRET')
    })
    return {
      accessToken,
      refreshToken,
      expiresIn:((now+accessTokenExpiresInSec)*1000).toString(),
    }
  }
}
