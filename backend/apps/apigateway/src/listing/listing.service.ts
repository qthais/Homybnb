import {
  CreateListingDto,
  DeleteListingDto,
  GetFavoritesDto,
  GetListingsByOptionDto,
  LISTING_PACKAGE_NAME,
  LISTING_SERVICE_NAME,
  ListingIdDto,
  ListingServiceClient,
  UserIdDto,
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
  async getListingById(listingIdDto:ListingIdDto) {
    const $listingSource = this.listingClient.getListingById(listingIdDto);
    const listing = await lastValueFrom($listingSource);
    return listing;
  }
  async getFavorites(getFavoritesDto:GetFavoritesDto){
    const $listingSource = this.listingClient.getFavorites(getFavoritesDto);
    const listing = await lastValueFrom($listingSource);
    return listing;
  }
  async getListingOfUser(userIdDto:UserIdDto){
    const $listingSource = this.listingClient.getListingsOfUser(userIdDto);
    const listing = await lastValueFrom($listingSource);
    return listing;
  }
  async deleteListing(deleteListingDto:DeleteListingDto){
    const $source = this.listingClient.deleteListing(deleteListingDto);
    const res = await lastValueFrom($source);
    return res
  }
  async getListingsByOption(getListingsByOptionDto:GetListingsByOptionDto){
    const $source= this.listingClient.getListingsByOption(getListingsByOptionDto)
    const listings = await lastValueFrom($source)
    return listings
  }
}
