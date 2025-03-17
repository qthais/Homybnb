import { CreateUserDto, UpdateUserDto, User } from '@app/common/types/auth';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/auth/prisma/PrismaService';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto){
    const hashedPassword = await bcrypt.hash(createUserDto.password!, 10);
    try {
      const user = await this.prismaService.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          hashedPassword: hashedPassword,
        },
        include: { accounts: true },
      });
      return this.cleanUser(user);
    } catch (err) {
      console.log(err.message);
    }
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      include: { accounts: true },
    });

    return { users: users.map(this.cleanUser) };
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { accounts: true },
    });

    return this.cleanUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
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
  }

  async remove(id: string) {
    const deletedUser = await this.prismaService.user.delete({
      where: { id },
      include: { accounts: true },
    });

    return this.cleanUser(deletedUser);
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
