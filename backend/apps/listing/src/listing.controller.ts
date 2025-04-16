import { Controller } from '@nestjs/common';
import { ListingService } from './listing.service';
import {
  CreateListingDto,
  DeleteListingDto,
  DeleteResponseDto,
  GetFavoritesDto,
  GetListingsResponseDto,
  ListingIdDto,
  ListingResponseDto,
  ListingServiceController,
  ListingServiceControllerMethods,
  UserIdDto,
} from '@app/common';

@Controller()
@ListingServiceControllerMethods()
export class ListingController implements ListingServiceController {
  constructor(private readonly listingService: ListingService) {}
  async deleteListing(deleteListingDto: DeleteListingDto): Promise<DeleteResponseDto>  {
    return await this.deleteListing(deleteListingDto)
  }
  async getFavorites(getFavoritesDto: GetFavoritesDto): Promise<GetListingsResponseDto> {
    const listing = await this.listingService.getFavotires(getFavoritesDto);
    return { listings: listing };
  }
  async getListingById(listingDto: ListingIdDto): Promise<ListingResponseDto>  {
    const listing = await this.listingService.getLisingById(listingDto)
    return listing
  }
  async getListingsOfUser(userIdDto: UserIdDto): Promise<GetListingsResponseDto>  {
    const listing = await this.listingService.getLisingsOfUser(userIdDto.userId);
    return { listings: listing };
  }
  async getListings(): Promise<GetListingsResponseDto> {
    const listing = await this.listingService.getListings();
    return { listings: listing };
  }

  async createListing(
    createListingDto: CreateListingDto,
  ): Promise<ListingResponseDto> {
    return await this.listingService.createListing(createListingDto);
  }
}
