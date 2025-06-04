import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import {
  AUTH_PACKAGE_NAME,
  CreateListingDto,
  DeleteListingDto,
  GetFavoritesDto,
  GetListingsByOptionDto,
  GetListingsResponseDto,
  ListingIdDto,
  RESERVATION_PACKAGE_NAME,
  RESERVATION_SERVICE_NAME,
  ReservationServiceClient,
  UpdateListingDto,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import cleanListing from '@app/common/functions/cleanListing';
import { lastValueFrom } from 'rxjs';
import { Prisma } from '../prisma/generated';

@Injectable()
export class ListingService implements OnModuleInit {
  private userService: UserServiceClient;
  private reservationService: ReservationServiceClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly userClient: ClientGrpc,
    @Inject(RESERVATION_PACKAGE_NAME)
    private readonly reservationClient: ClientGrpc,
    private readonly prismaService: PrismaService,
  ) {}
  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>(USER_SERVICE_NAME);
    this.reservationService =
      this.reservationClient.getService<ReservationServiceClient>(
        RESERVATION_SERVICE_NAME,
      );
  }
  async createListing(createListingDto: CreateListingDto) {
    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      locationValue,
      userId,
      price,
    } = createListingDto;
    if (!title) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Title is required',
      });
    }
    // Validate description
    if (!description) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Description is required',
      });
    }

    // Validate imageSrc
    if (!imageSrc) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Image source is required',
      });
    }

    // Validate category
    if (!category) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Category is required',
      });
    }

    // Validate roomCount (should be a positive integer)
    if (roomCount <= 0 || !Number.isInteger(roomCount)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Room count must be a positive integer',
      });
    }

    // Validate bathroomCount (should be a positive integer)
    if (bathroomCount <= 0 || !Number.isInteger(bathroomCount)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Bathroom count must be a positive integer',
      });
    }

    // Validate guestCount (should be a positive integer)
    if (guestCount <= 0 || !Number.isInteger(guestCount)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Guest count must be a positive integer',
      });
    }

    // Validate locationValue
    if (!locationValue) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Location is required',
      });
    }
    if (price <= 0 || isNaN(price)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        details: 'Price must be a positive number',
      });
    }
    // Validate userId
    if (!userId) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        details: 'User ID is required',
      });
    }
    const existingListing = await this.prismaService.listing.findFirst({
      where: {
        title: title,
        locationValue: locationValue,
      },
    });

    if (existingListing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        details: 'A listing with the same title and location already exists',
      });
    }
    const newListing = await this.prismaService.listing.create({
      data: {
        title,
        description,
        imageSrc,
        category,
        roomCount,
        bathroomCount,
        guestCount,
        locationValue,
        userId,
        price,
      },
    });
    return cleanListing(newListing);
  }
  async getListingsOfUser(userId: string) {
    try {
      const listings = await this.prismaService.listing.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Check if listings were found
      if (!listings || listings.length === 0) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'No listings found for this user',
        });
      }

      return listings.map((listing) => cleanListing(listing));
    } catch (error) {
      // Handle Prisma errors
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to retrieve listings',
      });
    }
  }

  async getListingById(listingIdDto: ListingIdDto) {
    const listingId = listingIdDto.listingId;
    const includeUser = listingIdDto.include?.user || false;
    const includeReservations = listingIdDto.include?.reservations || false;
    try {
      const listing = await this.prismaService.listing.findUnique({
        where: {
          id: listingId,
        },
      });

      // Check if listing were found
      if (!listing) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'No listing found',
        });
      }
      const finalListing = cleanListing(listing);
      if (includeUser && includeReservations) {
        const user$ = this.userService.findOneUser({ id: finalListing.userId });
        const user = await lastValueFrom(user$);
        const $reservationsSource =
          this.reservationService.getReservationByOption({
            listingId,
          });
        const reservations = (await lastValueFrom($reservationsSource))
          .reservations;
        return {
          ...finalListing,
          user,
          reservations,
        };
      }
      if (includeUser) {
        const user$ = this.userService.findOneUser({ id: finalListing.userId });
        const user = await lastValueFrom(user$);
        return {
          ...finalListing,
          user,
        };
      }
      if (includeReservations) {
        const $reservationsSource =
          this.reservationService.getReservationByOption({
            listingId,
          });
        const reservations = (await lastValueFrom($reservationsSource))
          .reservations;
        return {
          ...finalListing,
          reservations,
        };
      }
      return finalListing;
    } catch (error) {
      // Handle Prisma errors
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to retrieve listings',
      });
    }
  }

  async getListings() {
    try {
      const listings = await this.prismaService.listing.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Check if listings were found
      if (!listings || listings.length === 0) {
        throw new RpcException({
          code: status.NOT_FOUND,
          details: 'No listings found for this user',
        });
      }

      return listings.map((listing) => cleanListing(listing));
    } catch (error) {
      // Handle Prisma errors
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to retrieve listings',
      });
    }
  }

  async getListingsByOption(getListingsByOptionDto: GetListingsByOptionDto) {
    const {
      startDate,
      endDate,
      bathroomCount,
      guestCount,
      category,
      locationValue,
      roomCount,
    } = getListingsByOptionDto;
    let query: Prisma.ListingWhereInput = {};
    if (locationValue) {
      query.locationValue = locationValue;
    }
    if (category) {
      query.category = category;
    }
    if (guestCount) {
      query.guestCount = {
        gte: +guestCount,
      };
    }
    if (bathroomCount) {
      query.bathroomCount = {
        gte: +bathroomCount,
      };
    }
    if (roomCount) {
      query.roomCount = {
        gte: +roomCount,
      };
    }
    const listings = await this.prismaService.listing.findMany({
      where: query,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const cleanedListing = listings.map((listing) => cleanListing(listing));
    if (startDate && endDate) {
      const listingsWithReservation = await Promise.all(
        listings.map(async (listingItem) => {
          const listing = await this.getListingById({
            listingId: listingItem.id,
            include: { reservations: true },
          });
          if (!listing) {
            throw new RpcException({
              code: status.NOT_FOUND,
              details: 'Listing not found',
            });
          }
          return listing;
        }),
      );
      const finalListing = listingsWithReservation.filter((listing) => {
        const hasConflict = (listing.reservations || []).some((reservation) => {
          const resStart = new Date(reservation.startDate);
          const resEnd = new Date(reservation.endDate);
          const reqStart = new Date(startDate);
          const reqEnd = new Date(endDate);
          // Check if the requested date range conflicts with any reservation
          return (
            (reqStart < resEnd && reqStart >= resStart) ||
            (reqEnd > resStart && reqEnd <= resEnd)
          );
        });
        return !hasConflict;
      });
      return finalListing;
    }
    return cleanedListing;
  }

  async getFavotires(getFavorites: GetFavoritesDto) {
    const favoriteIds = getFavorites.listingIds ?? [];
    const listings = await this.prismaService.listing.findMany({
      where: {
        id: {
          in: favoriteIds,
        },
      },
    });
    return listings.map((listing) => cleanListing(listing));
  }

  async updateListing(updateListingDto: UpdateListingDto) {
    try {
      const {listingId,userId,...updateDto} = updateListingDto;
      if (!listingId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'Listing ID is required!',
        });
      }
      const updateListing = await this.prismaService.listing.update({
        where: {
          id: listingId,
        },
        data: updateDto,
      });
      return cleanListing(updateListing);
    } catch (error) {
      console.log(error);
      // Handle Prisma errors
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to update listing',
      });
    }
  }

  async deleteListing(deleteListingDto: DeleteListingDto) {
    try {
      const { listingId, userId } = deleteListingDto;
      if (!listingId || !userId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          details: 'Listing ID and User ID are required',
        });
      }
      const $reservationsSource =
        this.reservationService.getReservationByOption({
          listingId,
        });
      const reservations = (await lastValueFrom($reservationsSource))
        .reservations;
      if (reservations.length != 0) {
        await Promise.all(
          reservations.map(async (reservation) => {
            return await lastValueFrom(
              this.reservationService.deleteReservationById({
                reservationId: reservation.id,
              }),
            );
          }),
        );
      }
      await this.prismaService.listing.delete({
        where: {
          id: listingId,
        },
      });
      return {
        message:
          'Listing and all associated reservations deleted successfully!',
      };
    } catch (error) {
      console.log(error);
      // Handle Prisma errors
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        details: 'Failed to delete listing',
      });
    }
  }
}
