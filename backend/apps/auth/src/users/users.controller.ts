import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, FindOneUserDto, UpdateUserDto, UserServiceController, UserServiceControllerMethods } from '@app/common/types/auth';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  async createUser(createUserDto: CreateUserDto) {
    try{
      return await this.usersService.create(createUserDto);
    }catch(error){
      throw error; // Let gRPC handle it
    }
  }

  // ✅ Find All Users
  async findAllUsers() {
    try{
      return await this.usersService.findAll();
    }catch(err){
      throw err
    }
  }

  // ✅ Find One User
  async findOneUser(findOneUserDto: FindOneUserDto) {
    try{
      return await this.usersService.findOne(findOneUserDto.id);
    }catch(err){
      throw err
    }
  }

  // ✅ Update User
  async updateUser(updateUserDto: UpdateUserDto) {
    try{
      return await this.usersService.update(updateUserDto.id, updateUserDto);
    }catch(err){
      throw err
    }
  }

  // ✅ Remove User
  async removeUser(findOneUserDto: FindOneUserDto) {
    try{
      return await this.usersService.remove(findOneUserDto.id);
    }catch(err){
      throw err
    }
  }

}
