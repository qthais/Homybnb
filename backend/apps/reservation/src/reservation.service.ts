import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import {
  CreateReservationDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingServiceClient,
  ReservationOptionDto,
} from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import cleanReservation from '@app/common/functions/cleanReservation';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReservationService {
  private listingClient: ListingServiceClient;
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(LISTING_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.listingClient = this.client.getService<ListingServiceClient>(LISTING_SERVICE_NAME);
  }
  async createReservation(createReservationDto: CreateReservationDto) {
    if (!createReservationDto.listingId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Listing ID is required!',
      });
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

      return cleanReservation(reservation);
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
  async getReservationById(reservationId: number) {
    try {
      if (!reservationId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'Reservation ID is required!',
        });
      }
      const reservation = await this.prismaService.reservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'No reservation found!',
        });
      }
      return cleanReservation(reservation);
    } catch (error) {
      console.error('Fetching Reservation Error:', error);
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to create reservation',
      });
    }
  }
  async getReservationsByOption(reservationOptionDto: ReservationOptionDto) {
    const { listing, userId, listingId } = reservationOptionDto;
    if (!userId ) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'UserID is required !',
      });
    }
    const authorId=listing?.userId
    const whereCondition: any = {
      userId,
    };
  
    if (listingId) {
      whereCondition.listingId = listingId;
    }
    const reservations = await this.prismaService.reservation.findMany({
      where: whereCondition
    });
    const reservationsWithListing=await Promise.all(
      reservations.map(async(reservation)=>{
        const $listing= this.listingClient.getListingById({listingId:reservation.listingId})
        const listingData= await lastValueFrom($listing)
        const cleanedReservation = cleanReservation(reservation);
        return{
          ...cleanedReservation,
          listing:listingData
        }
      })
    ) 
    if(!authorId){
      return reservationsWithListing
    }else{
      return reservationsWithListing.filter((reservation)=>reservation.listing.userId===authorId)
    }
  }
}
