import { Body, Controller, Get, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ListingService } from './listing.service';
import { AuthGuard } from '../guards/jwt.guard';
import { ResponseDto } from '../utils/types/HttpResponse';
import { CreateListingDto, ExtendRequest } from '@app/common';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {
  }
  @UseGuards(AuthGuard)
  @Post('/create')
  async createListing(@Body() createListingDto:CreateListingDto, @Request() req:ExtendRequest){
    const id=req.user.sub.userId
    const res=await this.listingService.createListing({...createListingDto,userId:id})
    return new ResponseDto(HttpStatus.OK,"Creating listing successfully",{listing:res})
  }
  @UseGuards(AuthGuard)
  @Get()
  async getListings(@Request() req:ExtendRequest){
    const id=req.user.sub.userId
    const res= await this.listingService.getListings({userId:id})
    return new ResponseDto(HttpStatus.OK,"Retrieving listings successfully",res)
  }
}
