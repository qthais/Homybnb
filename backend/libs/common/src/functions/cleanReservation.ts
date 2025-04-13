import { Reservation } from 'apps/reservation/prisma/generated';
import { ReservationDto } from '../types';

const cleanReservation = (reservation: Reservation): ReservationDto => {
  return {
    ...reservation,
    startDate: reservation.startDate.toISOString(),
    endDate: reservation.endDate.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
  };
};
export default cleanReservation