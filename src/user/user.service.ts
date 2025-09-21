import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    await this.userRepository.save(user);
    return 'User created successfully';
  }

  async findOne(id: any) {
     const user = await this.userRepository
      .createQueryBuilder('user')
      .loadRelationCountAndMap('user.followersCount', 'user.followers')
      .loadRelationCountAndMap('user.followingCount', 'user.following')
      .where('user.id = :id', { id })
      .getOne();
    if (user) {
      return user;
    }

    throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  }

  findOneUsernameOrEmail(val: any) {
    return this.userRepository.findOneOrFail({
      where: [{ username: val }, { email: val }],
    });
  }
}
