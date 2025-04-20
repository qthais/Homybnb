import { NestFactory } from '@nestjs/core';
import { ListingModule } from './listing.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { LISTING_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ListingModule, {
    transport: Transport.GRPC,
    options: {
      package: LISTING_PACKAGE_NAME,
      protoPath: join(__dirname, '../listing.proto'),
      url: process.env.LISTING_GRPC_URL||'0.0.0.0:50052',
    },
  });
  await app.listen()
}
bootstrap();
