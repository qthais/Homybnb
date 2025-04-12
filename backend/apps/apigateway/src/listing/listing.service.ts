import {
  AUTH_PACKAGE_NAME,
  CreateListingDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingServiceClient,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ListingService {
  constructor(
    @Inject(LISTING_PACKAGE_NAME) private readonly listingClient: ClientGrpc,
    @Inject(AUTH_PACKAGE_NAME) private readonly userClient: ClientGrpc,
  ) {}
  async createListing(createListingDto: CreateListingDto) {
    const source = this.listingClient
      .getService<ListingServiceClient>(LISTING_SERVICE_NAME)
      .createListing(createListingDto);
    const res = await lastValueFrom(source);
    return res;
  }
  async getListings() {
    const source = this.listingClient
      .getService<ListingServiceClient>(LISTING_SERVICE_NAME)
      .getListings({});
    const res = await lastValueFrom(source);
    return res;
  }
  async getListingById(listingId: number) {
    const listingSource = this.listingClient
      .getService<ListingServiceClient>(LISTING_SERVICE_NAME)
      .getListingById({ listingId });
    const listing = await lastValueFrom(listingSource);
    console.log({ listing });
    const userSource = this.userClient
      .getService<UserServiceClient>(USER_SERVICE_NAME)
      .findOneUser({ id: listing.userId });
    const user = await lastValueFrom(userSource);
    return {
      ...listing,
      user,
    };
  }
}
