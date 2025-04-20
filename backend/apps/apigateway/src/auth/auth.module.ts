import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH, AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';

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
  controllers: [AuthController],
  providers: [AuthService,JwtService],
})
export class AuthModule {}
