
import { AUTH_PACKAGE_NAME, CreateUserDto, UpdateUserDto, USER_SERVICE_NAME, UserServiceClient } from '@app/common/types/auth';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService:UserServiceClient
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly client:ClientGrpc
  ){}
  onModuleInit() {
      this.usersService=this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }
  create(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto)
  }

  findAll() {
    return this.usersService.findAllUsers({});
  }

  async findOne(email: string) {
    const source= this.usersService.findOneUser({email})
    const user= await lastValueFrom(source)
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const source= this.usersService.updateUser({id,...updateUserDto})
    const user= await lastValueFrom(source)
    return user
  }

  remove(id: string) {
    return this.usersService.removeUser({id})
  }
}
