import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, UseGuards, Req, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('posts')
@UseGuards(AuthGuard('jwt'))

export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads', // folder penyimpanan
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async createPost(
    @Body() body: { userId: number; content: string },
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request
  ) {
    // Pisahkan mana file image, mana video
    const images: string[] = [];
    const videos: string[] = [];
    

    files.forEach(file => {
      if (file.mimetype.startsWith('image/')) {
        images.push(file.filename); // bisa juga pakai file.path
      } else if (file.mimetype.startsWith('video/')) {
        videos.push(file.filename);
      }
    });

    const followerId = (req.user as any).userId;

    return this.postsService.create({content: body.content, images, videos}, followerId)
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('hashtag') hashtag?: string,
    @Query('search') search?: string,

  ) {
    // Validate pagination parameters
    const validPage = Math.max(1, Number(page));
    const validLimit = Math.min(Math.max(1, Number(limit)), 100); // Max 100 posts per request

    return this.postsService.findAll(validPage, validLimit, (req.user as any).userId, hashtag, search);
  }
  @Get(':postId')
  async findOne(
    @Param('postId') postId: number,

  ) {
    return this.postsService.findOne(postId);
  }
}
