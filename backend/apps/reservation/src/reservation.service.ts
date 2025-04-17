import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import {
  CreateReservationDto,
  DeleteOptionDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingServiceClient,
  ReservationOptionDto,
} from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import cleanReservation from '@app/common/functions/cleanReservation';
import { lastValueFrom } from 'rxjs';
import { Reservation } from '../prisma/generated';

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
  async deleteReservationById(reservationId:number){
    try{
      if(!reservationId){
        throw new RpcException({
          code:status.INVALID_ARGUMENT,
          details:"No Reservation ID provided"
        })
      }
      await this.prismaService.reservation.delete({
        where:{
          id:reservationId
        }
      })
      return {message:"Cancel successfully"}
    }catch(error){
      console.log(error)
      if (error instanceof RpcException) {
        throw error;
      }
      if(error.code==='P2025'){
        throw new RpcException({
          code:status.NOT_FOUND,
          details:"No reservation found to delete"
        })
      }
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to create reservation',
      });
    }
  }
  async deleteReservationsByOption(deleteOptionDto:DeleteOptionDto){
    try{

      const {reservationId,userId}=deleteOptionDto
  
      const deleteReservation= await this.prismaService.reservation.findUnique({
        where:{
          id:reservationId
        }
      })
      if(!deleteReservation){
        throw new RpcException({
          code:status.NOT_FOUND,
          details:"No reservation found to delete"
        })
      }
      const $listing= this.listingClient.getListingById({listingId:deleteReservation?.listingId})
      const listingData= await lastValueFrom($listing) 
      if(listingData.userId==userId||userId==deleteReservation.userId){
        await this.prismaService.reservation.delete({
          where:{
            id:reservationId
          }
        })
        return {
          message:"Cancel successfully!"
        }
      }
      throw new RpcException({
        code:status.PERMISSION_DENIED,
        details: "You do not have permission for this action!"
      })
    }catch(error){
      console.error('Deleting Reservation Error:', error);
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
    try{
      const { listing, userId, listingId } = reservationOptionDto;
      const includeListing=reservationOptionDto.include?.listing
      if (!userId &&!listingId&&! listing) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'UserID parameters provided !',
        });
      }
      const authorId=listing?.userId
      const whereCondition: any ={}

      if(authorId){
        let reservations:Reservation[];
        if(listingId){
          reservations=await this.prismaService.reservation.findMany({
            where:{listingId},
            orderBy:{
              createdAt:'desc'
            }
          })
        }else{
          reservations=await this.prismaService.reservation.findMany({
            orderBy:{
              createdAt:'desc'
            }
          })
        }
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
        return reservationsWithListing.filter((reservation)=>reservation.listing.userId==authorId)
      }
      if(userId){
        whereCondition.userId=userId
      }
      if (listingId) {
        whereCondition.listingId = listingId;
      }
      const reservations = await this.prismaService.reservation.findMany({
        where: whereCondition,
        orderBy:{
          createdAt:'desc'
        }
      });
      if(includeListing){
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
        return reservationsWithListing
      }
      const cleanedReservations=reservations.map((reservation)=>cleanReservation(reservation))
      return cleanedReservations
    }catch(error){
      console.error('Getting Reservations Error:', error);
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
