import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH } from '@app/common';
import { GrpcExceptionInterceptor } from './interceptors/grpc-exception.interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.GRPC,
    options: {
      package: AUTH,
      protoPath: join(__dirname, '../auth.proto'),
    },
  });
  app.useGlobalInterceptors(new GrpcExceptionInterceptor());
  await app.listen()
  
}
bootstrap();
