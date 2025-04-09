import { Controller, Get } from '@nestjs/common';
import { ListingService } from './listing.service';
import {
  CreateListingDto,
  GetListingsResponseDto,
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
  async getListings(userIdDto: UserIdDto): Promise<GetListingsResponseDto> {
    const listing = await this.listingService.getListings(userIdDto.userId);
    return { listings: listing };
  }

  async createListing(
    createListingDto: CreateListingDto,
  ): Promise<ListingResponseDto> {
    return await this.listingService.createListing(createListingDto);
  }
}
