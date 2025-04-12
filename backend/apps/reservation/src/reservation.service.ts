import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { CreateReservationDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prismaService:PrismaService
  ){}
  async createReservation(createReservationDto:CreateReservationDto){
    if(!createReservationDto.listingId){
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: "Listing ID is required!"
      })
    }

    try {
      const reservation = await this.prismaService.reservation.create({
        data: {
          userId: createReservationDto.userId,
          listingId: createReservationDto.listingId,
          startDate: new Date(createReservationDto.startDate),
          endDate: new Date(createReservationDto.endDate),
          totalPrice: createReservationDto.totalPrice,
        },
      });

      return {
        id: reservation.id,
        userId: reservation.userId,
        listingId: reservation.listingId,
        startDate: reservation.startDate.toISOString(),
        endDate: reservation.endDate.toISOString(),
        totalPrice: reservation.totalPrice,
        createdAt: reservation.createdAt.toISOString(),
      };
    } catch (error) {
      console.error('Create Reservation Error:', error);
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to create reservation',
      });
    }
  }
}
