import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { HashtagsModule } from 'src/hashtags/hashtags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { GifValidatorService } from './gif-validator.service';

@Module({
  imports:[TypeOrmModule.forFeature([Post]), forwardRef(() => HashtagsModule)],
  controllers: [PostsController],
  providers: [PostsService, GifValidatorService]
})
export class PostsModule {}
