import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { LoginDto, RegisterDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcryptjs';
import cleanUser from '@app/common/constants/cleanUser';
@Injectable()
export class AuthService {
    constructor(private readonly prismaService:PrismaService){}
    async login(loginDto:LoginDto){
        if(!loginDto.email||!loginDto.password){
            throw new RpcException({
                code:status.INVALID_ARGUMENT,
                details:'Email and password are required!'
            })
        }
        const exsistingUser=await this.prismaService.user.findUnique({
            where:{
                email:loginDto.email
            },
            include:{
                accounts:true
            }
        })
        if(!exsistingUser){
            throw new RpcException({
                code:status.INVALID_ARGUMENT,
                details:'Invalid credentials!'
            })
        }
        const isCorrectPassword= await bcrypt.compare(loginDto.password,exsistingUser.hashedPassword!)
        if(!isCorrectPassword){
            throw new RpcException({
                code:status.INVALID_ARGUMENT,
                details:"Invalid credentails!"
            })
        }
        
        return cleanUser(exsistingUser)
    }
    async register(registerDto:RegisterDto){
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
}
