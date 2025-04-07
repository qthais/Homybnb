import { Controller, Get } from '@nestjs/common';
import { ListingService } from './listing.service';

@Controller()
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  getHello(): string {
    return this.listingService.getHello();
  }
}
