import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
@Unique(['follower', 'following']) // Mencegah duplikasi follow
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.following)
  follower: User;

  @ManyToOne(() => User, user => user.followers)
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}