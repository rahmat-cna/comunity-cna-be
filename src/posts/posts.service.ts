import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { HashtagsService } from 'src/hashtags/hashtags.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @Inject(forwardRef(() => HashtagsService))
    private hashtagsService: HashtagsService,
    
  ){}
  async create(createPostDto: CreatePostDto, userId: number) {
    
    // Create post
    const post = this.postsRepository.create({
      content: createPostDto.content,
      images: createPostDto.images,
      videos: createPostDto.videos,
      user: { id: userId }
    });
    const savedPost = await this.postsRepository.save(post);
     // Process hashtags jika ada content
     if (createPostDto.content) {
      await this.hashtagsService.processPostHashtags(savedPost, createPostDto.content);
     }
    return 'This action adds a new post';
  }

  async findOneByUsername(username: string) {
    const queryBuilder = this.postsRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoin('post.likes', 'likes')
    .leftJoin('post.comments', 'comments')
    .loadRelationCountAndMap('post.likeCount', 'post.likes')
    .loadRelationCountAndMap('post.commentCount', 'post.comments')
    .where('user.username =:username', {username})
    .orderBy('post.createdAt', 'DESC')
    return await queryBuilder.getManyAndCount();

  }

  async findPostsBySimilarHashtag(tag: string) {
    return this.postsRepository
      .createQueryBuilder('post')
      .innerJoin('post.postHashtags', 'ph')
      .innerJoin('ph.hashtag', 'hashtag')
      .leftJoinAndSelect('post.user', 'user')
      .where('similarity(hashtag.name, :tag) > 0.2', { tag }) // ambil yang mirip di atas threshold
      .orderBy('similarity(hashtag.name, :tag)', 'DESC') // urutkan dari paling mirip
      .getMany();
  }
  

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: number,
    hashtag?: string,
    search?: string
  ) {
    // const pageNumber = Number(page) || 1;
    // const limitNumber = Number(limit) || 10;
    
    // // ✅ Pastikan nilai valid
    // const validPage = Math.max(1, pageNumber);
    // const validLimit = Math.min(Math.max(1, limitNumber), 100); // Max 100 posts
    
    // const skip = (validPage - 1) * validLimit; // ✅ Sekarang pasti number
    // // Build where conditions
    // const where: any = {};
    
    // // Filter by user jika provided
    // if (userId) {
    //   where.user = { id: userId };
    // }
    
    // // Filter by hashtag jika provided
    // if (hashtag) {
    //   where.postHashtags = {
    //     hashtag: { name: hashtag }
    //   };
    // }
  
    // Build query builder untuk flexibility
    const queryBuilder = this.postsRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    // ✅ HANYA JOIN untuk like count, jangan select semua data likes
    .leftJoin('post.likes', 'likes')
    // ✅ HANYA JOIN untuk comment count, jangan select semua data comments
    .leftJoin('post.comments', 'comments')
    // .leftJoinAndSelect('post.postHashtags', 'postHashtags')
    // .leftJoinAndSelect('postHashtags.hashtag', 'hashtag')
    // ✅ LOAD COUNT saja, bukan semua data
    .loadRelationCountAndMap('post.likeCount', 'post.likes')
    .loadRelationCountAndMap('post.commentCount', 'post.comments')
    .loadRelationIdAndMap('post.likedByUser', 'post.likes', 'like', qb =>
      qb.where('like.userId = :userId', { userId }),
    )
    // ✅ LOAD apakah user sudah like post ini
    .orderBy('post.createdAt', 'DESC')
    return await queryBuilder.getManyAndCount();

    
  
    // // Apply filters
    // if (userId) {
    //   queryBuilder.andWhere('user.id = :userId', { userId });
    // }
  
    // if (hashtag) {
    //   queryBuilder.andWhere('hashtag.name = :hashtag', { hashtag });
    // }
  
    // if (search) {
    //   queryBuilder.andWhere(
    //     '(post.content LIKE :search OR user.username LIKE :search)',
    //     { search: `%${search}%` }
    //   );
    // }
  
    // // Get posts dengan pagination
    // const [posts, total] = await queryBuilder
    //   .skip(skip)
    //   .take(limit)
    //   .getManyAndCount();
  
    // // Map hashtags ke post
    // const postsWithHashtags = posts.map(post => ({
    //   ...post,
    //   hashtags: post.postHashtags?.map(ph => ph.hashtag.name) || [],
    //   likeCount: post.likes?.length || 0,
    //   commentCount: post.comments?.length || 0
    // }));
  
    // // Calculate total pages
    // const totalPages = Math.ceil(total / limit);
    // const posts = await queryBuilder.getMany();
    
    
  
  }



  async findOne(id: number) {
    const queryBuilder = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      // ✅ HANYA JOIN untuk like count, jangan select semua data likes
      .leftJoin('post.likes', 'likes')
      // ✅ HANYA JOIN untuk comment count, jangan select semua data comments
      .leftJoin('post.comments', 'comments')
      .leftJoinAndSelect('post.postHashtags', 'postHashtags')
      .leftJoinAndSelect('postHashtags.hashtag', 'hashtag')
      // ✅ LOAD COUNT saja, bukan semua data
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      // ✅ LOAD apakah user sudah like post ini
      .where('post.id = :id', {id})
      .getOneOrFail();
    return queryBuilder
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
