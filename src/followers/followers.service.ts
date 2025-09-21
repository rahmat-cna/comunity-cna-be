import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from './entities/follower.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Follow user
  async followUser(followerId: number, followingId: number): Promise<{ message: string }> {
    // Cek jika user mencoba follow diri sendiri
    if (followerId === followingId) {
      throw new ConflictException('You cannot follow yourself');
    }

    
    const followingUser = await this.usersRepository.findOne({ where: { id: followingId } });
    if (!followingUser) {
      throw new NotFoundException('User to follow not found');
    }

    // Cek jika sudah follow
    const existingFollow = await this.followersRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }

    // Buat relationship follow
    const follow = this.followersRepository.create({
      follower: { id: followerId },
      following: { id: followingId }
    });

    await this.followersRepository.save(follow);

    return { message: 'Successfully followed user' };
  }

  // Unfollow user
  async unfollowUser(followerId: number, followingId: number): Promise<{ message: string }> {
    const follow = await this.followersRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    });

    if (!follow) {
      throw new NotFoundException('You are not following this user');
    }

    await this.followersRepository.remove(follow);

    return { message: 'Successfully unfollowed user' };
  }

  // Get followers of a user
  async getFollowers(userId: number, page: number = 1, limit: number = 10): Promise<{ followers: any[], total: number }> {
    const [follows, total] = await this.followersRepository.findAndCount({
      where: { following: { id: userId } },
      relations: ['follower'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    const followers = follows.map(follow => ({
      id: follow.follower.id,
      username: follow.follower.username,
      followedAt: follow.createdAt
    }));

    return { followers, total };
  }

  // Get users followed by a user
  async getFollowing(userId: number, page: number = 1, limit: number = 10): Promise<{ following: any[], total: number }> {
    console.log(page, limit);
    
    const [follows, total] = await this.followersRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: ['following'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    const following = follows.map(follow => ({
      id: follow.following.id,
      username: follow.following.username,
      followedAt: follow.createdAt
    }));

    return { following, total };
  }

  // Check if a user is following another user
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followersRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    });

    return !!follow;
  }

  // Get follower count for a user
  async getFollowerCount(userId: number): Promise<number> {
    return this.followersRepository.count({
      where: { following: { id: userId } }
    });
  }

  // Get following count for a user
  async getFollowingCount(userId: number): Promise<number> {
    return this.followersRepository.count({
      where: { follower: { id: userId } }
    });
  }

  

}