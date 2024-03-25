import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class PostLike {
    @PrimaryGeneratedColumn()
    id: number;

    // Relationships
    @ManyToOne(() => User, user => user.likes)
    user: User;

    @ManyToOne(() => Post, post => post.likes)
    post: Post;
}

export default PostLike;
