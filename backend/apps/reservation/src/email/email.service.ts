import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type mailOptions = {
  subject: string;
  email: string;
  name: string;
  activationCode: string;
  template: string;
};
type confirmationMailOptions = {
  email: string;
  name: string;
  reservationNumber: number;
  checkInDate: string;
  checkOutDate: string;
  propertyName: string;
  totalPrice: number;
};

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
  async sendEmail({
    subject,
    email,
    name,
    activationCode,
    template,
  }: mailOptions) {
    await this.mailService.sendMail({
      to: email,
      subject,
      template,
      context: {
        name,
        activationCode,
      },
    });
  }
  async sendConfirmationEmail({
    email,
    name,
    reservationNumber,
    checkInDate,
    checkOutDate,
    propertyName,
    totalPrice,
  }: confirmationMailOptions) {
    await this.mailService.sendMail({
      to: email,
      subject: 'Your Homybnb Reservation is Confirmed!',
      template: 'booking-mail', // make sure `reservation-booking.ejs` exists in your templates folder
      context: {
        name,
        reservationNumber,
        checkInDate,
        checkOutDate,
        propertyName,
        totalPrice,
      },
    });
  }
  async sendCancellationEmail({
    email,
    name,
    reservationNumber,
    checkInDate,
    checkOutDate,
    propertyName,
    totalPrice,
  }: {
    email: string;
    name: string;
    reservationNumber: number;
    checkInDate: string;
    checkOutDate: string;
    propertyName: string;
    totalPrice: number;
  }) {
    await this.mailService.sendMail({
      to: email,
      subject: 'Your Homybnb Reservation Has Been Cancelled',
      template: 'cancelReservation-mail',
      context: {
        name,
        reservationNumber,
        propertyName,
        checkInDate,
        checkOutDate,
        totalPrice,
      },
    });
  }
}
