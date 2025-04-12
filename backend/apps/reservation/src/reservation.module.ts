import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  imports: [],
  controllers: [ReservationController],
  providers: [ReservationService,PrismaService],
})
export class ReservationModule {}
