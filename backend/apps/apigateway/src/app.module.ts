import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ListingModule } from './listing/listing.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  })
  ,UsersModule,AuthModule,ListingModule,ReservationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
