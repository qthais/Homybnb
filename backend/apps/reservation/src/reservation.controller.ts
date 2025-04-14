import { Controller, Get } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto, deleteReservationDto, ReservationDto, reservationIdDto, ReservationIdDto, ReservationOptionDto, ReservationsDto, ReservationServiceController, ReservationServiceControllerMethods } from '@app/common';
import { Observable } from 'rxjs';

@Controller()
@ReservationServiceControllerMethods()
export class ReservationController implements ReservationServiceController {
  constructor(private readonly reservationService: ReservationService) {}
  async deleteReservationById(reservationIdDto: reservationIdDto): Promise<deleteReservationDto> {
    return await this.reservationService.deleteReservationById(reservationIdDto.reservationId)
  }
  async getReservationById(reservationIdDto: ReservationIdDto): Promise<ReservationDto>  {
    const reservation = await this.reservationService.getReservationById(reservationIdDto.reservationId)
    return reservation
  }
  async getReservationByOption(reservationOptionDto: ReservationOptionDto): Promise<ReservationsDto>  {
    const reservations = await this.reservationService.getReservationsByOption(reservationOptionDto)
    return {reservations}
  }
  async createReservation(createReservationDto: CreateReservationDto): Promise<ReservationDto>  {
    const reservation= await this.reservationService.createReservation(createReservationDto)
    return reservation
  }

}
