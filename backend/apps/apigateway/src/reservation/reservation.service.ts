import {
  CreateReservationDto,
  RESERVATION_PACKAGE_NAME,
  RESERVATION_SERVICE_NAME,
  ReservationIdDto,
  ReservationOptionDto,
  ReservationServiceClient,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReservationService implements OnModuleInit {
  private reservationClient:ReservationServiceClient;
  constructor(
    @Inject(RESERVATION_PACKAGE_NAME)
    private readonly client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.reservationClient = this.client.getService<ReservationServiceClient>(
      RESERVATION_SERVICE_NAME,
    );
  }
  async createReservation(createReservationDto: CreateReservationDto) {
    const $reservation =
      this.reservationClient.createReservation(createReservationDto);
    const reservation = await lastValueFrom($reservation);
    return reservation;
  }
  async getReservationsByOption(reservationOptionDto:ReservationOptionDto){
    const $source= this.reservationClient.getReservationByOption(reservationOptionDto)
    const reservations= await lastValueFrom($source)
    return reservations
  }
  async deleteReservationsById(reservationIdDto:ReservationIdDto){
    const $source= this.reservationClient.deleteReservationById(reservationIdDto)
    const message= await lastValueFrom($source)
    return message
  }
}
