import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ListingModule } from './listing/listing.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  })
  ,UsersModule,AuthModule,ListingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
