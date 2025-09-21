import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
  ){}

  // Like a post
  async likePost(userId: number, postId: number): Promise<Like> {
    console.log(userId, postId);
    
    // Cek existing like
    const existingLike = await this.likesRepository.findOneBy({
      user: { id: userId },
      post: { id: postId }
    });
  
    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }
  
    // Langsung create dan save
    return this.likesRepository.save({
      user: { id: userId },
      post: { id: postId }
    });
  }

   // Unlike a post
  async unlikePost(userId: number, postId: number): Promise<void> {
    const like = await this.likesRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } }
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likesRepository.remove(like);
  }

  async getLikesForPost(postId: number, page: number = 1, limit: number = 10): Promise<{ likes: Like[], total: number }> {
    const [likes, total] = await this.likesRepository.findAndCount({
      where: { post: { id: postId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { likes, total };
  }

  // Get likes by user
  async getLikesByUser(userId: number, page: number = 1, limit: number = 10): Promise<{ likes: Like[], total: number }> {
    const [likes, total] = await this.likesRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['post', 'post.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { likes, total };
  }

    // Check if user liked a post
    async hasUserLikedPost(userId: number, postId: number): Promise<boolean> {
      const like = await this.likesRepository.findOne({
        where: { user: { id: userId }, post: { id: postId } }
      });
  
      return !!like;
    }

     // Get like count for a post
  async getLikeCount(postId: number): Promise<number> {
    return this.likesRepository.count({
      where: { post: { id: postId } }
    });
  }
  

}
