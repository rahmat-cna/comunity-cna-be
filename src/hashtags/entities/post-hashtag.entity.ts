import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Hashtag } from './hashtag.entity';

@Entity()
@Unique(['post', 'hashtag']) // Mencegah duplikasi relationship
export class PostHashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, post => post.postHashtags, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Hashtag, hashtag => hashtag.postHashtags, { onDelete: 'CASCADE' })
  hashtag: Hashtag;

  @CreateDateColumn()
  createdAt: Date;
}