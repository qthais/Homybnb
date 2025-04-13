import {
  CreateReservationDto,
  RESERVATION_PACKAGE_NAME,
  RESERVATION_SERVICE_NAME,
  ReservationServiceClient,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(RESERVATION_PACKAGE_NAME)
    private readonly reservationClient: ClientGrpc,
  ) {}
  async createReservation(createReservationDto: CreateReservationDto) {
    const $reservation = this.reservationClient
      .getService<ReservationServiceClient>(RESERVATION_SERVICE_NAME)
      .createReservation(createReservationDto);
    const reservation = await lastValueFrom($reservation);
    return reservation;
  }
}
