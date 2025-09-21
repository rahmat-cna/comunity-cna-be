import { Controller, Post, Delete, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  // Follow a user
  @Post(':id/follow')
  async followUser(
    @Param('id') followingId: number,
    @Req() req: Request
  ) {
    const followerId = (req.user as any).userId;
    return this.followersService.followUser(followerId, followingId);
  }

  // Unfollow a user
  @Delete(':id/unfollow')
  async unfollowUser(
    @Param('id') followingId: number,
    @Req() req: Request
  ) {
    const followerId = (req.user as any).id;
    return this.followersService.unfollowUser(followerId, followingId);
  }

  // Get followers of a user
  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.followersService.getFollowers(userId, page, limit);
  }

  // Get users followed by a user
  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.followersService.getFollowing(userId, page, limit);
  }

  // Check if current user is following a user
  @Get(':id/is-following')
  async isFollowing(
    @Param('id') followingId: number,
    @Req() req: Request
  ) {
    const followerId = (req.user as any).id;
    return this.followersService.isFollowing(followerId, followingId);
  }

  // Get follower count for a user
  @Get(':id/follower-count')
  async getFollowerCount(@Param('id') userId: number) {
    const count = await this.followersService.getFollowerCount(userId);
    return { count };
  }

  // Get following count for a user
  @Get(':id/following-count')
  async getFollowingCount(@Param('id') userId: number) {
    const count = await this.followersService.getFollowingCount(userId);
    return { count };
  }
}