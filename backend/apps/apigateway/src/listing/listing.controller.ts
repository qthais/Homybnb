import { Body, Controller, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ListingService } from './listing.service';
import { AuthGuard } from '../guards/jwt.guard';
import { ResponseDto } from '../utils/types/HttpResponse';
import { CreateListingDto } from '@app/common';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {
  }
  @UseGuards(AuthGuard)
  @Post('/create')
  async createListing(@Body() createListingDto:CreateListingDto, @Request() req){
    const id=req.user.sub.userId
    const res=await this.listingService.createListing({...createListingDto,userId:id})
    return new ResponseDto(HttpStatus.OK,"Create listing successfully",{listing:res})
  }
}
