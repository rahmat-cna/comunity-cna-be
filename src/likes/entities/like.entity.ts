import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity()
@Unique(['user', 'post']) // Satu user hanya bisa like satu post sekali
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, post => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}