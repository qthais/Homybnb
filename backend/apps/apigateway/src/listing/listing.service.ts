import {
  CreateListingDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingServiceClient,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ListingService implements OnModuleInit {
  private listingClient: ListingServiceClient;
  constructor(
    @Inject(LISTING_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.listingClient =
      this.client.getService<ListingServiceClient>(LISTING_SERVICE_NAME);
  }
  async createListing(createListingDto: CreateListingDto) {
    const $source = this.listingClient.createListing(createListingDto);
    const res = await lastValueFrom($source);
    return res;
  }
  async getListings() {
    const $source = this.listingClient.getListings({});
    const res = await lastValueFrom($source);
    return res;
  }
  async getListingById(listingId: number) {
    const listing$Source = this.listingClient.getListingById({ listingId });
    const listing = await lastValueFrom(listing$Source);
    return listing;
  }
}
