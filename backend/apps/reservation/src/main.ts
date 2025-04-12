import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReservationModule } from './reservation.module';
import { RESERVATION_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ReservationModule, {
    transport: Transport.GRPC,
    options: {
      package: RESERVATION_PACKAGE_NAME,
      protoPath: join(__dirname, '../reservation.proto'),
      url: '0.0.0.0:50053',
    },
  });
  await app.listen()
  
}
bootstrap();
