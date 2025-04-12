import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '@app/common/types/auth';
import { ResponseDto } from '../utils/types/HttpResponse';
import { AuthGuard } from '../guards/jwt.guard';
import { ExtendRequest } from '@app/common';

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
  @Patch('/update')
  async update(@Request() req:ExtendRequest, @Body() updateUserDto: UpdateUserDto) {
    let user;
    if(updateUserDto.favoriteIds.length==0){
      user= await this.usersService.update( req.user.sub.userId,{...updateUserDto,isEmptyFavoriteIds:true});
    }else{
      user= await this.usersService.update( req.user.sub.userId,updateUserDto);
    }
    return new ResponseDto(HttpStatus.OK, 'Update successfully!', { user });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
