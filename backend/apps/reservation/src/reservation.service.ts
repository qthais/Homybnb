import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import {
  AUTH_PACKAGE_NAME,
  CreateReservationDto,
  DeleteOptionDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingServiceClient,
  ReservationIdDto,
  ReservationOptionDto,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import cleanReservation from '@app/common/functions/cleanReservation';
import { lastValueFrom } from 'rxjs';
import { Reservation } from '../prisma/generated';
import { format } from 'date-fns';
import { EmailService } from './email/email.service';

@Injectable()
export class ReservationService {
  private listingClient: ListingServiceClient;
  private userClient: UserServiceClient;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    @Inject(LISTING_PACKAGE_NAME) private readonly client: ClientGrpc,
    @Inject(AUTH_PACKAGE_NAME) private readonly client2: ClientGrpc,
  ) {}
  onModuleInit() {
    this.listingClient =
      this.client.getService<ListingServiceClient>(LISTING_SERVICE_NAME);
    this.userClient =
      this.client2.getService<UserServiceClient>(USER_SERVICE_NAME);
  }
  async createReservation(createReservationDto: CreateReservationDto) {
    if (!createReservationDto.listingId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Listing ID is required!',
      });
    }
    const $listing= this.listingClient.getListingById({listingId:createReservationDto.listingId})
    const listing = await lastValueFrom($listing)
    if(!listing){
      throw new RpcException({
        code: status.NOT_FOUND,
        details: "Listing no longer exist"
      })
    }
    const $nameSrc = this.userClient.findUserByEmail({
      email: createReservationDto.userEmail!,
    });
    const user = await lastValueFrom($nameSrc);
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
      this.emailService.sendConfirmationEmail({
        email: createReservationDto.userEmail!,
        name: user.name!,
        propertyName: listing.title,
        reservationNumber: reservation.id,
        checkInDate: format(new Date(reservation.startDate), 'MMM dd, yyyy'),
        checkOutDate: format(new Date(reservation.endDate), 'MMM dd, yyyy'),
        totalPrice: reservation.totalPrice,
      });

      return cleanReservation(reservation);
    } catch (error) {
      console.error('Create Reservation Error:', error);
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to book this property!',
      });
    }
  }
  async getReservationById(reservationIdDto: ReservationIdDto) {
    try {
      if (!reservationIdDto.reservationId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'Reservation ID is required!',
        });
      }
      const reservation = await this.prismaService.reservation.findUnique({
        where: { id: reservationIdDto.reservationId },
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
        details: 'Failed to get reservation',
      });
    }
  }
  async deleteReservationById(reservationIdDto: ReservationIdDto) {
    try {
      if (!reservationIdDto.reservationId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'No Reservation ID provided',
        });
      }
      const deleteReservation = await this.prismaService.reservation.delete({
        where: {
          id: reservationIdDto.reservationId,
        },
      });
      const $user = this.userClient.findOneUser({
        id: deleteReservation.userId,
      });
      const user = await lastValueFrom($user);
      await this.emailService.sendCancellationEmail({
        email: user.email!,
        name: user.name!,
        reservationNumber: deleteReservation.id,
        checkInDate: format(
          new Date(deleteReservation.startDate),
          'MMM dd, yyyy',
        ),
        checkOutDate: format(
          new Date(deleteReservation.endDate),
          'MMM dd, yyyy',
        ),
        propertyName: 'Test',
        totalPrice: deleteReservation.totalPrice,
      });
      return { message: 'Cancel successfully' };
    } catch (error) {
      console.log(error);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'No reservation found to delete',
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to delete reservation',
      });
    }
  }
  async deleteReservationsByOption(deleteOptionDto: DeleteOptionDto) {
    try {
      const { reservationId, userId } = deleteOptionDto;

      const deleteReservation = await this.prismaService.reservation.findUnique(
        {
          where: {
            id: reservationId,
          },
        },
      );
      if (!deleteReservation) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'No reservation found to delete',
        });
      }
      const $listing = this.listingClient.getListingById({
        listingId: deleteReservation?.listingId,
      });
      const listingData = await lastValueFrom($listing);
      if (listingData.userId == userId || userId == deleteReservation.userId) {
        await this.prismaService.reservation.delete({
          where: {
            id: reservationId,
          },
        });
        const $user = this.userClient.findOneUser({
          id: deleteReservation.userId,
        });
        const user = await lastValueFrom($user);
        console.log(user.email);
        await this.emailService.sendCancellationEmail({
          email: user.email!,
          name: user.name!,
          reservationNumber: deleteReservation.id,
          checkInDate: format(
            new Date(deleteReservation.startDate),
            'MMM dd, yyyy',
          ),
          checkOutDate: format(
            new Date(deleteReservation.endDate),
            'MMM dd, yyyy',
          ),
          propertyName: listingData.title,
          totalPrice: deleteReservation.totalPrice,
        });
        return {
          message: 'Cancel successfully!',
        };
      }
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        details: 'You do not have permission for this action!',
      });
    } catch (error) {
      console.error('Deleting Reservation Error:', error);
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to delete reservation',
      });
    }
  }
  async getReservationsByOption(reservationOptionDto: ReservationOptionDto) {
    try {
      const { listing, userId, listingId } = reservationOptionDto;
      const includeListing = reservationOptionDto.include?.listing;
      if (!userId && !listingId && !listing) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'UserID parameters provided !',
        });
      }
      const authorId = listing?.userId;
      const whereCondition: any = {};

      if (authorId) {
        let reservations: Reservation[];
        if (listingId) {
          reservations = await this.prismaService.reservation.findMany({
            where: { listingId },
            orderBy: {
              createdAt: 'desc',
            },
          });
        } else {
          reservations = await this.prismaService.reservation.findMany({
            orderBy: {
              createdAt: 'desc',
            },
          });
        }
        const reservationsWithListing = await Promise.all(
          reservations.map(async (reservation) => {
            const $listing = this.listingClient.getListingById({
              listingId: reservation.listingId,
            });
            const listingData = await lastValueFrom($listing);
            const cleanedReservation = cleanReservation(reservation);
            return {
              ...cleanedReservation,
              listing: listingData,
            };
          }),
        );
        return reservationsWithListing.filter(
          (reservation) => reservation.listing.userId == authorId,
        );
      }
      if (userId) {
        whereCondition.userId = userId;
      }
      if (listingId) {
        whereCondition.listingId = listingId;
      }
      const reservations = await this.prismaService.reservation.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (includeListing) {
        const reservationsWithListing = await Promise.all(
          reservations.map(async (reservation) => {
            const $listing = this.listingClient.getListingById({
              listingId: reservation.listingId,
            });
            const listingData = await lastValueFrom($listing);
            const cleanedReservation = cleanReservation(reservation);
            return {
              ...cleanedReservation,
              listing: listingData,
            };
          }),
        );
        return reservationsWithListing;
      }
      const cleanedReservations = reservations.map((reservation) =>
        cleanReservation(reservation),
      );
      return cleanedReservations;
    } catch (error) {
      console.error('Getting Reservations Error:', error);
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to retrieve reservation',
      });
    }
  }
}
