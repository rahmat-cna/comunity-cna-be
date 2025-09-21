import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))

export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}


  @Post(':postId')
  async createComment(
    @Req() req: Request, // biasanya ada user dari JWT
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {

    const userId = req.user.userId; // ambil userId dari request (misalnya dari JWT)

    // inject postId ke DTO
    createCommentDto.postId = postId;

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
  @Post(':id/like')
  async likeComment(@Param('id') id: string,  @Req() req: Request,) {
    return this.commentsService.likeComment(id, req.user.userId);
  }

  



  

}
