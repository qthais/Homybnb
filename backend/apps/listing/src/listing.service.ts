import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { CreateListingDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import cleanListing from '@app/common/functions/cleanListing';

@Injectable()
export class ListingService {
  constructor(private readonly prismaService: PrismaService) {}
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
        details: "Price must be a positive number",
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
    return cleanListing(newListing)
  }
}
