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
import { Follower } from 'src/followers/entities/follower.entity';

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
  async findOneByUsername(username: string, currentUserId: string) {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .loadRelationCountAndMap('user.followersCount', 'user.followers')
    .loadRelationCountAndMap('user.followingCount', 'user.following')
     // cek apakah currentUser sudah follow user target
     .addSelect(subQuery => {
      return subQuery
        .select('COUNT(f.id)', 'count')
        .from(Follower, 'f')
        .where('f.followerId = :currentUserId', { currentUserId })
        .andWhere('f.followingId = user.id');
    }, 'user_isFollowing')

    .where('user.username = :username', { username })
    .setParameter('currentUserId', currentUserId)
    .getRawAndEntities();
    
    if (user) {
      console.log();
      
      // mapping hasil subquery ke boolean
      (user.entities[0] as any).isFollowing = (user.raw[0] as any)['user_isFollowing'] == currentUserId;
      delete (user as any)['user_isFollowing'];
      console.log(user.entities[0]);
      
      return user.entities[0]
    }

    throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  }

  findOneUsernameOrEmail(val: any) {
    return this.userRepository.findOneOrFail({
      where: [{ username: val }, { email: val }],
    });
  }
}
