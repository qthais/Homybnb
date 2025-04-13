import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/PrismaService';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LISTING_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: LISTING_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: LISTING_PACKAGE_NAME,
          protoPath: join(__dirname, '../listing.proto'),
          url: '0.0.0.0:50052',
        },
      },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService],
})
export class ReservationModule {}
