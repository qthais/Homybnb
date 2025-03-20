import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'apps/auth/prisma/PrismaService';

@Module({
  controllers: [UsersController],
  providers: [UsersService,PrismaService],
  exports:[UsersService,PrismaService]
})
export class UsersModule {}
