import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  // Self-referential for reply comments
  @ManyToOne(() => Comment, comment => comment.replies, { onDelete: 'CASCADE', nullable: true })
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  // Many-to-many relationship for likes
  @ManyToMany(() => User, user => user.likedComments)
  @JoinTable()
  likes: User[];

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  videos: string[];
  
  // Method untuk menandai apakah ini reply
  isReply(): boolean {
    return this.parentComment !== null;
  }

  // Method untuk mendapatkan jumlah like
  getLikeCount(): number {
    return this.likes ? this.likes.length : 0;
  }

  // Method untuk mengecek apakah user sudah like komentar ini
  isLikedByUser(userId: number): boolean {
    return this.likes ? this.likes.some(user => user.id === userId) : false;
  }


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