import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Follower } from 'src/followers/entities/follower.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToMany(() => Follower, follower => follower.follower)
  following: Follower[];

  @OneToMany(() => Follower, follower => follower.following)
  followers: Follower[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToMany(() => Comment, comment => comment.likes)
  likedComments: Comment[];

   // Method untuk mengecek apakah user sudah like post tertentu
   hasLikedPost(postId: number): boolean {
    return this.likes?.some(like => like.post.id === postId) || false;
  }

  // Method untuk mendapatkan jumlah like yang diberikan user
  getTotalLikesGiven(): number {
    return this.likes?.length || 0;
  }

  // Method untuk mendapatkan jumlah comment yang dibuat user
  getTotalComments(): number {
    return this.comments?.length || 0;
  }
}
