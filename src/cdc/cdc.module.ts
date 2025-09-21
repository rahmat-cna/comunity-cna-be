import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { SearchModule } from 'src/search/search.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Module({
  imports: [
    SearchModule,
    TypeOrmModule.forFeature([Post, Like, Comment]),
  ],
  providers: [KafkaConsumerService],
  exports: [KafkaConsumerService],
})
export class CdcModule {}