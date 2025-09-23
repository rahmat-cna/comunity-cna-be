import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))

export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}


  @Post(':postId')
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
  async createComment(
    @Req() req: Request, // biasanya ada user dari JWT
    @UploadedFiles() files: Express.Multer.File[],
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {

    const images: string[] = [];
    const videos: string[] = [];

    if (files) {
      files.forEach(file => {
        if (file.mimetype.startsWith('image/')) {
          images.push(file.filename); // bisa juga pakai file.path
        } else if (file.mimetype.startsWith('video/')) {
          videos.push(file.filename);
        }
      });
      
    }
    

    const userId = req.user.userId; // ambil userId dari request (misalnya dari JWT)

    // inject postId ke DTO
    createCommentDto.postId = postId;
    createCommentDto.images = images
    createCommentDto.videos = videos

    const comment = await this.commentsService.createComment(userId, createCommentDto);
    return { 
      message: 'Comment created successfully', 
      data: comment 
    };
  }

  @Get(':postId')
  async findCommandByPost(
    @Req() req: Request, // biasanya ada user dari JWT
    @Param('postId', ParseIntPipe) postId: number,
  ) {

    const userId = req.user.userId; // ambil userId dari request (misalnya dari JWT)
    return this.commentsService.findCommandByPost(postId, userId);

  }
  @Get(':commmentId/detail')
  async getCommentById(
    @Param('commmentId', ParseIntPipe) commmentId: number,
  ) {

    return this.commentsService.getCommentById(commmentId);

  }
  @Post(':id/like')
  async likeComment(@Param('id') id: string,  @Req() req: Request,) {
    return this.commentsService.likeComment(id, req.user.userId);
  }

  



  

}
