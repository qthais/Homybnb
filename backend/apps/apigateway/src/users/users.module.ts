import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH } from '@app/common';
import { AUTH_PACKAGE_NAME } from '@app/common/types/auth';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../auth.proto'),
          url: process.env.AUTH_GRPC_URL||'0.0.0.0:50051',
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService,JwtService,ConfigService],
})
export class UsersModule {}
