
import { AUTH_PACKAGE_NAME, CreateUserDto, UpdateUserDto, USER_SERVICE_NAME, UserServiceClient } from '@app/common/types/auth';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private userClient:UserServiceClient
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly client:ClientGrpc
  ){}
  onModuleInit() {
      this.userClient=this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }
  create(createUserDto: CreateUserDto) {
    return this.userClient.createUser(createUserDto)
  }

  findAll() {
    return this.userClient.findAllUsers({});
  }

  async findOne(id: string) {
    const source= this.userClient.findOneUser({id})
    const user= await lastValueFrom(source)
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const source= this.userClient.updateUser({...updateUserDto,id})
    const user= await lastValueFrom(source)
    return user
  }

  remove(id: string) {
    return this.userClient.removeUser({id})
  }
}
