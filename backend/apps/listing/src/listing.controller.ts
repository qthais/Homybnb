import { Controller, Get } from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto, ListingResponseDto, ListingServiceController, ListingServiceControllerMethods } from '@app/common';

@Controller()
@ListingServiceControllerMethods()
export class ListingController implements ListingServiceController {
  constructor(private readonly listingService: ListingService) {}
  async createListing(createListingDto: CreateListingDto): Promise<ListingResponseDto>  {
    try{
      return await this.listingService.createListing(createListingDto)
    }catch(err){
      throw err
    }
  }


}
