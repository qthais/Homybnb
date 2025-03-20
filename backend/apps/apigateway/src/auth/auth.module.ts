import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH, AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

@Module({
    imports: [
      ClientsModule.register([
        {
          name: AUTH,
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../auth.proto'),
          },
        },
      ]),
    ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
