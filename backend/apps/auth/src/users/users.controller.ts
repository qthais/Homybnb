import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  FindOneUserDto,
  RemoveUserDto,
  UpdateUserDto,
  UserServiceController,
  UserServiceControllerMethods,
} from '@app/common/types/auth';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  async createUser(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  // ✅ Find All Users
  async findAllUsers() {
    return await this.usersService.findAll();
  }

  // ✅ Find One User
  async findOneUser(findOneUserDto: FindOneUserDto) {
    return await this.usersService.findOne(findOneUserDto.id);
  }

  // ✅ Update User
  async updateUser(updateUserDto: UpdateUserDto) {
    if(updateUserDto.isEmptyFavoriteIds){
      updateUserDto.favoriteIds=[]
    }
    return await this.usersService.update(updateUserDto.id, updateUserDto);
  }

  // ✅ Remove User
  async removeUser(removeUserDto: RemoveUserDto) {
    return await this.usersService.remove(removeUserDto.id);
  }
}
