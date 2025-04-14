import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { ListingService } from './listing.service';
import { AuthGuard } from '../guards/jwt.guard';
import { ResponseDto } from '../utils/types/HttpResponse';
import { CreateListingDto, ExtendRequest } from '@app/common';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {
  }
  @UseGuards(AuthGuard)
  @Post()
  async createListing(@Body() createListingDto:CreateListingDto, @Request() req:ExtendRequest){
    const id=req.user.sub.userId
    const res=await this.listingService.createListing({...createListingDto,userId:id})
    return new ResponseDto(HttpStatus.OK,"Creating listing successfully",{listing:res})
  }

  @Get()
  async getListings(){
    const res= await this.listingService.getListings()
    return new ResponseDto(HttpStatus.OK,"Retrieving listings successfully",res)
  }

  @Get('/:id')
  async getListingById(@Param('id',ParseIntPipe) id:number){
    const res= await this.listingService.getListingById(id)
    return new ResponseDto(HttpStatus.OK,"Retrieving listing successfully",{listing:res})
  }
}
