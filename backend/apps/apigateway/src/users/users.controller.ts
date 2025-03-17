import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '@app/common/types/auth';
import { catchError, throwError } from 'rxjs';
import { status } from '@grpc/grpc-js';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto).pipe(
      catchError((error) => {
        console.error('gRPC Error:', error);
        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        if (error.code !== undefined) {
          switch (error.code) {
            case status.ALREADY_EXISTS:
              httpStatus = HttpStatus.BAD_REQUEST;
              message = error.details;
              break;
            case status.NOT_FOUND:
              httpStatus = HttpStatus.NOT_FOUND;
              message = error.details;
              break;
            case status.UNAUTHENTICATED:
              httpStatus = HttpStatus.UNAUTHORIZED;
              message = error.details||'Unauthorized!';
              break;
            default:
              httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
              message = error.details || 'Unknown error';
          }
        }
        return throwError(() => new HttpException({ message }, httpStatus));
      }),
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
