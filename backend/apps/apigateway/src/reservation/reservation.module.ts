import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RESERVATION_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[
    ClientsModule.register([
      {
        name:RESERVATION_PACKAGE_NAME,
        transport:Transport.GRPC,
        options:{
          package:RESERVATION_PACKAGE_NAME,
          protoPath: join(__dirname,'../reservation.proto'),
          url: '0.0.0.0:50053',
        }
      }
    ])
  ],
  controllers: [ReservationController],
  providers: [ReservationService,JwtService],
})
export class ReservationModule {}
