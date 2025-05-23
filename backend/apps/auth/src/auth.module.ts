import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    })
    ],
  controllers: [AuthController],
  providers: [AuthService,JwtService],
})
export class AuthModule {}
