import { CreateUserDto, UpdateUserDto, User } from '@app/common/types/auth';
import { status } from '@grpc/grpc-js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from 'apps/auth/prisma/PrismaService';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        details: 'Email already in use',
      }); 
    }

    const hashedPassword = await bcrypt.hash(password!, 10);

    try {
      const user = await this.prismaService.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
        include: { accounts: true },
      });

      return this.cleanUser(user);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error creating user',
      });
    }
  }
  async findAll() {
    try {
      const users = await this.prismaService.user.findMany({
        include: { accounts: true },
      });

      return { users: users.map(this.cleanUser) };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error fetching users',
      });
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        include: { accounts: true },
      });

      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'User not found',
        });
      }

      return this.cleanUser(user);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error fetching user',
      });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const data: any = {
        name: updateUserDto.name,
        email: updateUserDto.email,
        ...(updateUserDto.password && {
          hashedPassword: await bcrypt.hash(updateUserDto.password, 10),
        }),
      };

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data,
        include: { accounts: true },
      });

      return this.cleanUser(updatedUser);
    } catch (error) {

      if (error.code === 'P2025') {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'User not found',
        });
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error updating user',
      });
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.prismaService.user.delete({
        where: { id },
        include: { accounts: true },
      });

      return this.cleanUser(deletedUser);
    } catch (error) {

      if (error.code === 'P2025') {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'User not found',
        });
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error deleting user',
      });
    }
  }
  private cleanUser(user: any): User {
    return {
      ...user,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      image: user.image ?? undefined,
      hashedPassword: user.hashedPassword ?? undefined,
    };
  }
}
