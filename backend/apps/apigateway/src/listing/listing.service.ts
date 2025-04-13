import {
  CreateListingDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingServiceClient,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ListingService {
  constructor(
    @Inject(LISTING_PACKAGE_NAME) private readonly listingClient: ClientGrpc,
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
    return listing
  }
}
