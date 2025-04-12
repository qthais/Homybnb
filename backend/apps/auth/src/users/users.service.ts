import cleanUser from '@app/common/functions/cleanUser';
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
      });

      return cleanUser(user);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error creating user',
      });
    }
  }
  async findAll() {
    try {
      const users = await this.prismaService.user.findMany({});

      return { users: users.map(cleanUser) };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error fetching users',
      });
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'ID is not provided!',
      });
    }
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'User not found',
        });
      }

      return cleanUser(user);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Propagate the original NOT_FOUND error
      }
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Error fetching user',
      });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto.favoriteIds)
    try {
      const data: any = {};

      if (updateUserDto.name !== undefined) {
        data.name = updateUserDto.name;
      }

      if (updateUserDto.email) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'Can not change email!',
        });
      }

      if (updateUserDto.password !== undefined) {
        data.hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (updateUserDto.favoriteIds !== undefined) {
        data.favoriteIds = updateUserDto.favoriteIds;
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data,
      });
      return cleanUser(updatedUser);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Propagate the original NOT_FOUND error
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
      });

      return cleanUser(deletedUser);
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
}
