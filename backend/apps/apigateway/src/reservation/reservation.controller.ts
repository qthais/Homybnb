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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '../guards/jwt.guard';
import {
  CreateReservationDto,
  ExtendRequest,
  ReservationOptionDto,
} from '@app/common';
import { ResponseDto } from '../utils/types/HttpResponse';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}
  @UseGuards(AuthGuard)
  @Post()
  async createReservation(
    @Body() createReservaionDto: CreateReservationDto,
    @Req() req: ExtendRequest,
  ) {
    const userId = req.user.sub.userId;
    const res = await this.reservationService.createReservation({
      ...createReservaionDto,
      userId,
    });
    return new ResponseDto(HttpStatus.OK, 'Create reservation successfully!', {
      reservaion: res,
    });
  }

  @HttpCode(200)
  @Post('/options')
  async getReservationByOption(
    @Body() reservationOptionDto: ReservationOptionDto,
  ) {
    const res =
      await this.reservationService.getReservationsByOption(
        reservationOptionDto,
      );
    return new ResponseDto(
      HttpStatus.OK,
      'Retrieve reservation successfully!',
      res,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id/options')
  async deleteReservationByOption(@Param('id', ParseIntPipe) id: number,@Req() req:ExtendRequest) {
    const userId=req.user.sub.userId
    const res = await this.reservationService.deleteReservationByOption({
      reservationId: id,
      userId
    });
    return new ResponseDto(
      HttpStatus.OK,
      res.message,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteReservationById(@Param('id', ParseIntPipe) id: number) {
    const res = await this.reservationService.deleteReservationById({
      reservationId: id,
    });
    return new ResponseDto(
      HttpStatus.OK,
      res.message,
    );
  }
}
