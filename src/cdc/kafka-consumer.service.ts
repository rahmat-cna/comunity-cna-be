import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { SearchService } from 'src/search/search.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private searchService: SearchService,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {
    this.kafka = new Kafka({
      clientId: 'elasticsearch-consumer',
      brokers: ['localhost:9092'],
    });

    this.consumer = this.kafka.consumer({ 
      groupId: 'elasticsearch-group' 
    });
  }

  async onModuleInit() {
    await this.connect();
    await this.subscribeToTopics();
    await this.consumeMessages();
  }

  private async connect() {
    try {
      await this.consumer.connect();
      this.logger.log('✅ Connected to Kafka successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Kafka:', error);
      throw error;
    }
  }

  private async subscribeToTopics() {
    const topics = [
      'social_media_db.public.posts',
      'social_media_db.public.likes',
      'social_media_db.public.comments'
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ 
        topic, 
        fromBeginning: false 
      });
      this.logger.log(`✅ Subscribed to topic: ${topic}`);
    }
  }

  private async consumeMessages() {
    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          const value = message.value?.toString();
          if (!value) return;

          const event = JSON.parse(value);
          await this.handleEvent(topic, event);
          
          this.logger.debug(`✅ Processed message from ${topic}`);
        } catch (error) {
          this.logger.error(`❌ Error processing message from ${topic}:`, error);
        }
      },
    });
  }

  private async handleEvent(topic: string, event: any) {
    const operation = event.op; // c=create, u=update, d=delete
    const before = event.before;
    const after = event.after;

    try {
      switch (topic) {
        case 'social_media_db.public.posts':
          await this.handlePostEvent(operation, before, after);
          break;
        case 'social_media_db.public.likes':
          await this.handleLikeEvent(operation, before, after);
          break;
        case 'social_media_db.public.comments':
          await this.handleCommentEvent(operation, before, after);
          break;
        default:
          this.logger.warn(`⚠️ Unhandled topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`❌ Error handling ${topic} event:`, error);
    }
  }

  private async handlePostEvent(operation: string, before: any, after: any) {
    try {
      switch (operation) {
        case 'c': // Create
          if (after) {
            const fullPost = await this.fetchCompletePost(after.id);
            if (fullPost) {
              await this.searchService.indexPost(fullPost);
              this.logger.log(`✅ Indexed new post: ${after.id}`);
            }
          }
          break;
        case 'u': // Update
          if (after) {
            const fullPost = await this.fetchCompletePost(after.id);
            if (fullPost) {
              await this.searchService.updatePost(fullPost);
              this.logger.log(`✅ Updated post in ES: ${after.id}`);
            }
          }
          break;
        case 'd': // Delete
          if (before) {
            await this.searchService.deletePost(before.id);
            this.logger.log(`✅ Deleted post from ES: ${before.id}`);
          }
          break;
      }
    } catch (error) {
      this.logger.error('❌ Error handling post event:', error);
    }
  }

  private async handleLikeEvent(operation: string, before: any, after: any) {
    try {
      const postId = after?.post_id || before?.post_id;
      if (!postId) return;

      // Update like count in Elasticsearch
      const likeCount = await this.fetchLikeCount(postId);
      await this.searchService.updatePost({
        id: postId,
        likeCount
      });
      
      this.logger.log(`✅ Updated like count for post: ${postId}`);
    } catch (error) {
      this.logger.error('❌ Error handling like event:', error);
    }
  }

  private async handleCommentEvent(operation: string, before: any, after: any) {
    try {
      const postId = after?.post_id || before?.post_id;
      if (!postId) return;

      // Update comment count in Elasticsearch
      const commentCount = await this.fetchCommentCount(postId);
      await this.searchService.updatePost({
        id: postId,
        commentCount
      });
      
      this.logger.log(`✅ Updated comment count for post: ${postId}`);
    } catch (error) {
      this.logger.error('❌ Error handling comment event:', error);
    }
  }

  private async fetchCompletePost(postId: number): Promise<any> {
    try {
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['user', 'likes', 'comments', 'postHashtags', 'postHashtags.hashtag']
      });

      if (!post) return null;

      return {
        ...post,
        hashtags: post.postHashtags?.map(ph => ph.hashtag.name) || [],
        likeCount: post.likes?.length || 0,
        commentCount: post.comments?.length || 0
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching post ${postId}:`, error);
      return null;
    }
  }

  private async fetchLikeCount(postId: number): Promise<number> {
    // Implement your like count logic
    return 0;
  }

  private async fetchCommentCount(postId: number): Promise<number> {
    // Implement your comment count logic
    return 0;
  }

  async onApplicationShutdown() {
    try {
      await this.consumer.disconnect();
      this.logger.log('✅ Disconnected from Kafka');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from Kafka:', error);
    }
  }
}