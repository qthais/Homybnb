import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseInterceptors,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '@app/common/types/auth';
import { GrpcErrorInterceptor } from '../utils/GrpcErrorInterceptor';
import { ResponseDto } from '../utils/types/HttpResponse';
import { AuthGuard } from '../guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @UseGuards(AuthGuard)
  @Post('/find')
  @HttpCode(200)
  async findOne(@Body('email') email: string) {
    const user = await this.usersService.findOne(email);
    return new ResponseDto(HttpStatus.OK, 'Found', { user });
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const user= await this.usersService.update( req.user.sub,updateUserDto);
    return new ResponseDto(HttpStatus.OK, 'Update successfully!', { user });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
