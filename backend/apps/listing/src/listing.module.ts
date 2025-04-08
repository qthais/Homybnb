import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  imports: [],
  controllers: [ListingController],
  providers: [ListingService,PrismaService],
})
export class ListingModule {}
