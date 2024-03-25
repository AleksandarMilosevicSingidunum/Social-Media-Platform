import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    // Relationships
    @ManyToOne(() => User, user => user.comments)
    user: User;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;
}
