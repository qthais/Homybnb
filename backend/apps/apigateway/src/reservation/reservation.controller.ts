import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '../guards/jwt.guard';
import { CreateReservationDto, ExtendRequest } from '@app/common';
import { ResponseDto } from '../utils/types/HttpResponse';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}
  @UseGuards(AuthGuard)
  @Post('/create')
  async createReservation(@Body() createReservaionDto:CreateReservationDto,@Req() req:ExtendRequest){
    const userId=req.user.sub.userId
    const res =await this.reservationService.createReservation({...createReservaionDto,userId})
    return new ResponseDto(HttpStatus.OK,"Create reservation successfully!",{reservaion:res})
  }
}
