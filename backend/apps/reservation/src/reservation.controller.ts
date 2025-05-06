import { Controller} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto, DeleteOptionDto, DeleteReservationDto, ReservationDto, ReservationIdDto, ReservationOptionDto, ReservationsDto, ReservationServiceController, ReservationServiceControllerMethods } from '@app/common';

@Controller()
@ReservationServiceControllerMethods()
export class ReservationController implements ReservationServiceController {
  constructor(private readonly reservationService: ReservationService) {}
  async deleteReservationsByOption(deleteReservationByOption: DeleteOptionDto): Promise<DeleteReservationDto>  {
    return await this.reservationService.deleteReservationsByOption(deleteReservationByOption)
  }
  async deleteReservationById(reservationIdDto: ReservationIdDto): Promise<DeleteReservationDto> {
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
