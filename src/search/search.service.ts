import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly index = 'posts';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                content: { type: 'text' },
                userId: { type: 'keyword' },
                username: { type: 'keyword' },
                hashtags: { type: 'keyword' },
                images: { type: 'keyword' },
                videos: { type: 'keyword' },
                createdAt: { type: 'date' },
                likeCount: { type: 'integer' },
                commentCount: { type: 'integer' },
              },
            },
          }as any,
        });
        this.logger.log('✅ Elasticsearch index created');
      }
    } catch (error) {
      this.logger.error('❌ Error creating index:', error);
    }
  }

  async indexPost(post: any) {
    try {
      const document = {
        id: post.id,
        content: post.content,
        userId: post.user?.id,
        username: post.user?.username,
        hashtags: post.hashtags || [],
        images: post.images || [],
        videos: post.videos || [],
        createdAt: post.createdAt,
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
      };

      await this.elasticsearchService.index({
        index: this.index,
        id: post.id.toString(),
        document,
        refresh: true,
      });
    } catch (error) {
      this.logger.error(`❌ Error indexing post ${post.id}:`, error);
    }
  }

  async updatePost(updateData: any) {
    try {
      await this.elasticsearchService.update({
        index: this.index,
        id: updateData.id.toString(),
        body: {
          doc: updateData
        } as any
      });
    } catch (error) {
      this.logger.error(`❌ Error updating post ${updateData.id}:`, error);
    }
  }

  async deletePost(postId: number) {
    try {
      await this.elasticsearchService.delete({
        index: this.index,
        id: postId.toString(),
      });
    } catch (error) {
      this.logger.error(`❌ Error deleting post ${postId}:`, error);
    }
  }
}