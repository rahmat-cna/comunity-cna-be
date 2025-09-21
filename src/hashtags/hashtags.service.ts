import { Injectable } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { PostHashtag } from './entities/post-hashtag.entity';
import { Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtag)
    private hashtagsRepository: Repository<Hashtag>,

    @InjectRepository(PostHashtag)
    private postHashtagsRepository: Repository<PostHashtag>,
  ) {}

   // Ekstrak hashtag dari content
   extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];

    return matches.map(tag => tag.slice(1).toLowerCase()); // Hapus '#' dan convert ke lowercase
  }

  // Process hashtags untuk post
  async processPostHashtags(post: Post, content: string): Promise<void> {
    const hashtagNames = this.extractHashtags(content);
    
    if (hashtagNames.length === 0) return;

    for (const tagName of hashtagNames) {
      let hashtag = await this.hashtagsRepository.findOne({ 
        where: { name: tagName } 
      });

      // Buat hashtag baru jika belum ada
      if (!hashtag) {
        hashtag = this.hashtagsRepository.create({ name: tagName });
        hashtag = await this.hashtagsRepository.save(hashtag);
      }

      // Tambah usage count
      hashtag.usageCount += 1;
      await this.hashtagsRepository.save(hashtag);

      // Buat relationship post-hashtag
      const postHashtag = this.postHashtagsRepository.create({
        post,
        hashtag
      });

      await this.postHashtagsRepository.save(postHashtag);
    }
  }

  // Get trending hashtags
  async getTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
    return this.hashtagsRepository.find({
      order: { usageCount: 'DESC' },
      take: limit
    });
  }

  // Get posts by hashtag
  async getPostsByHashtag(hashtagName: string, page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number }> {
    const [postHashtags, total] = await this.postHashtagsRepository.findAndCount({
      where: { hashtag: { name: hashtagName } },
      relations: ['post', 'post.user', 'post.likes', 'post.comments'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    const posts = postHashtags.map(ph => ph.post);
    return { posts, total };
  }

  // Search hashtags
  async searchHashtags(query: string, limit: number = 10): Promise<Hashtag[]> {
    return this.hashtagsRepository
      .createQueryBuilder('hashtag')
      .where('hashtag.name LIKE :query', { query: `%${query}%` })
      .orderBy('hashtag.usageCount', 'DESC')
      .limit(limit)
      .getMany();
  }
}
