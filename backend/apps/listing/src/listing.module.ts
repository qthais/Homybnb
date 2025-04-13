import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { PrismaService } from '../prisma/PrismaService';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
    imports: [
      ClientsModule.register([
        {
          name: AUTH_PACKAGE_NAME,
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../auth.proto'),
            url: '0.0.0.0:50051',
          },
        },
      ]),
    ],
  controllers: [ListingController],
  providers: [ListingService,PrismaService],
})
export class ListingModule {}
