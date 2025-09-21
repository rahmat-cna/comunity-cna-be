import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { PostHashtag } from './entities/post-hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag, PostHashtag])],
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService]
})
export class HashtagsModule {}
