import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.GRPC,
    options: {
      package: AUTH,
      protoPath: join(__dirname, '../auth.proto'),
      url: process.env.AUTH_GRPC_URL||'0.0.0.0:50051',
    },
  });
  await app.listen()
  
}
bootstrap();
