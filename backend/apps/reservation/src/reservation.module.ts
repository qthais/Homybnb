import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/PrismaService';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME, LISTING_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'apps/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: LISTING_PACKAGE_NAME,
        imports: [ConfigModule, EmailModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: LISTING_PACKAGE_NAME,
            protoPath: join(__dirname, '../listing.proto'),
            url: configService.get<string>('LISTING_GRPC_URL', '0.0.0.0:50052'),
          },
        }),
      },
      {
        name: AUTH_PACKAGE_NAME,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configservice: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../auth.proto'),
            url: configservice.get<string>('AUTH_GRPC_URL', '0.0.0.0:50051'),
          },
        }),
      },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService],
})
export class ReservationModule {}
