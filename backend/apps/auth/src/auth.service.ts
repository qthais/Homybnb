import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { LoginDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcryptjs';
import cleanUser from '@app/common/constants/cleanUser';
@Injectable()
export class AuthService {
    constructor(private readonly prismaService:PrismaService){}
    async login(loginDto:LoginDto){
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
}
