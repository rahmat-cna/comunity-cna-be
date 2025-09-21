import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('hashtags')
@UseGuards(AuthGuard('jwt'))
export class HashtagsController {

  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get('trending')
  async getTrendingHashtags(@Query('limit') limit: number = 10) {
    return this.hashtagsService.getTrendingHashtags(limit);
  }

  @Get('search')
  async searchHashtags(@Query('q') query: string, @Query('limit') limit: number = 10) {
    return this.hashtagsService.searchHashtags(query, limit);
  }

  @Get(':name/posts')
  async getPostsByHashtag(
    @Param('name') name: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.hashtagsService.getPostsByHashtag(name, page, limit);
  }
}
