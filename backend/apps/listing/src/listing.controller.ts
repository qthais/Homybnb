import { Controller } from '@nestjs/common';
import { ListingService } from './listing.service';
import {
  CreateListingDto,
  DeleteListingDto,
  DeleteResponseDto,
  GetFavoritesDto,
  GetListingsByOptionDto,
  GetListingsResponseDto,
  ListingIdDto,
  ListingResponseDto,
  ListingServiceController,
  ListingServiceControllerMethods,
  UserIdDto,
} from '@app/common';
import { Observable } from 'rxjs';

@Controller()
@ListingServiceControllerMethods()
export class ListingController implements ListingServiceController {
  constructor(private readonly listingService: ListingService) {}
  async getListingsByOption(getListingsByOptionDto: GetListingsByOptionDto): Promise<GetListingsResponseDto>  {
    const listings= await this.listingService.getListingsByOption(getListingsByOptionDto)
    return {listings:listings}
  }
  async deleteListing(deleteListingDto: DeleteListingDto): Promise<DeleteResponseDto>  {
    return await this.listingService.deleteListing(deleteListingDto)
  }
  async getFavorites(getFavoritesDto: GetFavoritesDto): Promise<GetListingsResponseDto> {
    const listing = await this.listingService.getFavotires(getFavoritesDto);
    return { listings: listing };
  }
  async getListingById(listingDto: ListingIdDto): Promise<ListingResponseDto>  {
    const listing = await this.listingService.getListingById(listingDto)
    return listing
  }
  async getListingsOfUser(userIdDto: UserIdDto): Promise<GetListingsResponseDto>  {
    const listing = await this.listingService.getListingsOfUser(userIdDto.userId);
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
