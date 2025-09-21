import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { PostHashtag } from './post-hashtag.entity';

@Entity()
export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PostHashtag, postHashtag => postHashtag.hashtag)
  postHashtags: PostHashtag[];

  // Method untuk increment usage count
  incrementUsage() {
    this.usageCount += 1;
  }

  // Method untuk decrement usage count
  decrementUsage() {
    this.usageCount = Math.max(0, this.usageCount - 1);
  }
}