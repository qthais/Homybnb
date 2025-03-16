import { AUTH_PACKAGE_NAME, CreateUserDto, UpdateUserDto, USER_SERVICE_NAME, UserServiceClient } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

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

  findOne(id: string) {
    return this.usersService.findOneUser({id})
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser({id,...updateUserDto})
  }

  remove(id: string) {
    return this.usersService.removeUser({id})
  }
}
