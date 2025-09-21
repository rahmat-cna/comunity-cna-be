import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    
  ) {}


    // Create a comment - Simplified version
    async createComment(userId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
      const { content, postId, parentCommentId } = createCommentDto;
  
      // Cek parent comment jika ada
      let parentComment: Comment | null = null;
      if (parentCommentId) {
        parentComment = await this.commentsRepository.findOne({ 
          where: { id: parentCommentId } 
        });
        
        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
      }
  
      // Create comment langsung dengan ID references (tanpa find user dan post)
      const comment = this.commentsRepository.create({
        content,
        user: { id: userId },           // ✅ Cukup assign ID user
        post: { id: postId },           // ✅ Cukup assign ID post
        parentComment: parentComment ?? undefined,                    // ✅ Parent comment object jika ada
      });
  
      return this.commentsRepository.save(comment);
    }

    async getCommentsForPost(postId: number, page: number = 1, limit: number = 10): Promise<{ comments: Comment[], total: number }> {
      const [comments, total] = await this.commentsRepository.findAndCount({
        where: { 
          post: { id: postId },
          parentComment: IsNull(), // Only top-level comments
        },
        relations: ['user', 'replies', 'replies.user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
  
      return { comments, total };
    }

    async findCommandByPost(postId: number, userId: number) {
      const queryBuilder = await this.commentsRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoin('comment.likes', 'likes')
      .where('comment.postId = :postId', {postId})
      .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
      .loadRelationCountAndMap('comment.commentCount', 'comment.replies')
      .getManyAndCount()

      return queryBuilder
    }

     // Get comment by ID
  async getCommentById(commentId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'post', 'parentComment', 'replies', 'replies.user']
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async updateComment(commentId: number, userId: number, content: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user']
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment
    if (comment.user.id !== userId) {
      throw new NotFoundException('You can only update your own comments');
    }

    comment.content = content;
    return this.commentsRepository.save(comment);
  }

   // Delete a comment
  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user']
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment
    if (comment.user.id !== userId) {
      throw new NotFoundException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
  }

  async getCommentReplies(commentId: number, page: number = 1, limit: number = 10): Promise<{ replies: Comment[], total: number }> {
    const [replies, total] = await this.commentsRepository.findAndCount({
      where: { parentComment: { id: commentId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { replies, total };
  }

  // Get comment count for a post
  async getCommentCount(postId: number): Promise<number> {
    return this.commentsRepository.count({
      where: { post: { id: postId } }
    });
  }

  async likeComment(commentId: string, userId: number) {
    await this.commentsRepository
    .createQueryBuilder()
    .relation(Comment, 'likes')
    .of(commentId)
    .add(userId);


    return 'ok';
  }

}
