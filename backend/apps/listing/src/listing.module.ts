import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { PrismaService } from '../prisma/PrismaService';
import { AUTH_PACKAGE_NAME, RESERVATION_PACKAGE_NAME } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    ClientsModule.registerAsync([
      {
        name: AUTH_PACKAGE_NAME,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory:(configservice:ConfigService)=>({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../auth.proto'),
            url: configservice.get<string>('AUTH_GRPC_URL', '0.0.0.0:50051'),
          },
        })
      },
      {
        name: RESERVATION_PACKAGE_NAME,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory:(configService:ConfigService)=>({
          transport: Transport.GRPC,
          options: {
            package: RESERVATION_PACKAGE_NAME,
            protoPath: join(__dirname, '../reservation.proto'),
            url: configService.get<string>('RESERVATION_GRPC_URL','0.0.0.0:50053') ,
          },
        })
      },
    ]),
  ],
  controllers: [ListingController],
  providers: [ListingService, PrismaService],
})
export class ListingModule {}
