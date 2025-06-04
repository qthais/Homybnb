import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { AuthGuard } from '../guards/jwt.guard';
import { ResponseDto } from '../utils/types/HttpResponse';
import {
  CreateListingDto,
  ExtendRequest,
  GetFavoritesDto,
  GetListingsByOptionDto,
  UpdateListingDto,
} from '@app/common';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}
  @UseGuards(AuthGuard)
  @Post()
  async createListing(
    @Body() createListingDto: CreateListingDto,
    @Request() req: ExtendRequest,
  ) {
    const id = req.user.sub.userId;
    const res = await this.listingService.createListing({
      ...createListingDto,
      userId: id,
    });
    return new ResponseDto(HttpStatus.OK, 'Creating listing successfully', {
      listing: res,
    });
  }

  @Get()
  async getListings() {
    const res = await this.listingService.getListings();
    return new ResponseDto(
      HttpStatus.OK,
      'Retrieving listings successfully',
      res,
    );
  }

  @Get('/mine')
  @UseGuards(AuthGuard)
  async getListingsOfUser(@Request() req: ExtendRequest) {
    const userId = req.user.sub.userId;
    const res = await this.listingService.getListingOfUser({ userId });
    return new ResponseDto(
      HttpStatus.OK,
      'Retrieving listings successfully',
      res,
    );
  }

  @Post('/options')
  @HttpCode(200)
  async getListingsByOption(
    @Body() getListingByOPtionDto: GetListingsByOptionDto,
  ) {
    const res = await this.listingService.getListingsByOption(
      getListingByOPtionDto,
    );
    return new ResponseDto(
      HttpStatus.OK,
      'Retrieving listings successfully',
      res,
    );
  }

  @Get('/:id')
  async getListingById(@Param('id', ParseIntPipe) id: number) {
    const res = await this.listingService.getListingById({
      listingId: id,
      include: { user: true },
    });
    return new ResponseDto(HttpStatus.OK, 'Retrieving listing successfully', {
      listing: res,
    });
  }
  @Post('/favorites')
  @UseGuards(AuthGuard)
  async getFavorites(@Body() getFavoritesDto: GetFavoritesDto) {
    const res = await this.listingService.getFavorites(getFavoritesDto);
    return new ResponseDto(
      HttpStatus.OK,
      'Retrieving listings successfully',
      res,
    );
  }
  @Put('/:id')
  @UseGuards(AuthGuard)
  async updateListing(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListingDto: UpdateListingDto,
    @Request() req: ExtendRequest,
  ) {
    const userId = req.user.sub.userId;
    const res = await this.listingService.updateListing({
      ...updateListingDto,
      listingId: id,
      userId,
    });
    return new ResponseDto(HttpStatus.OK, 'Update listing successfully', {
      listing: res,
    });
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async deleteListing(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExtendRequest,
  ) {
    const userId = req.user.sub.userId;
    const res = await this.listingService.deleteListing({
      userId,
      listingId: id,
    });
    return new ResponseDto(HttpStatus.OK, 'Listing deleted!', res);
  }
}
