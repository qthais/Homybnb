import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LISTING_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: LISTING_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: LISTING_PACKAGE_NAME,
          protoPath: join(__dirname, '../listing.proto'),
          url: process.env.LISTING_GRPC_URL||'0.0.0.0:50052',
        },
      }
    ]),
  ],
  controllers: [ListingController],
  providers: [ListingService, JwtService],
})
export class ListingModule {}
