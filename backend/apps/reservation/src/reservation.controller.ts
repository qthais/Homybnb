import { Controller, Get } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto, ReservationDto, ReservationServiceController, ReservationServiceControllerMethods } from '@app/common';
import { Observable } from 'rxjs';

@Controller()
@ReservationServiceControllerMethods()
export class ReservationController implements ReservationServiceController {
  constructor(private readonly reservationService: ReservationService) {}
  async createReservation(createReservationDto: CreateReservationDto): Promise<ReservationDto>  {
    const reservation= await this.reservationService.createReservation(createReservationDto)
    return reservation
  }

}
