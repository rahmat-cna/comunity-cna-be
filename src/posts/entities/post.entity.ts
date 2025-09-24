import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { PostHashtag } from 'src/hashtags/entities/post-hashtag.entity';
// import { PostHashtag } from '../../hashtags/entities/post-hashtag.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  videos: string[];

  @Column({ type: 'simple-array', nullable: true })
  gifs: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, like => like.post)
  likes: Like[];

  @OneToMany(() => PostHashtag, postHashtag => postHashtag.post)
  postHashtags: PostHashtag[];

  // Virtual property untuk hashtags
  hashtags?: string[];

  // Method untuk menambah gambar
  addImage(imageUrl: string) {
    if (!this.images) this.images = [];
    this.images.push(imageUrl);
  }

  // Method untuk menambah video
  addVideo(videoUrl: string) {
    if (!this.videos) this.videos = [];
    this.videos.push(videoUrl);
  }
}