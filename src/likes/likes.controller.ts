import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('likes')
@UseGuards(AuthGuard('jwt'))
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postId')
  async likePost(@Param('postId') postId: number, @Req() req: Request,) {
    const userId = (req.user as any).userId;
    return this.likesService.likePost(userId, postId);
  }

  @Delete()
  async unlikePost(@Param('postId') postId: number, @Req() req: any) {
    const userId = req.user.id;
    return this.likesService.unlikePost(userId, postId);
  }

  @Get()
  async getLikesForPost(
    @Param('postId') postId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.likesService.getLikesForPost(postId, page, limit);
  }

  @Get('check')
  async checkIfLiked(@Param('postId') postId: number, @Req() req: any) {
    const userId = req.user.id;
    const hasLiked = await this.likesService.hasUserLikedPost(userId, postId);
    return { hasLiked };
  }

  @Get('count')
  async getLikeCount(@Param('postId') postId: number) {
    const count = await this.likesService.getLikeCount(postId);
    return { count };
  }
}
