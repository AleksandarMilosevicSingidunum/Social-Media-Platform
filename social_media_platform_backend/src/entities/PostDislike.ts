import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class PostDislike {
    @PrimaryGeneratedColumn()
    id: number;

    // Relationships
    @ManyToOne(() => User, user => user.dislikes)
    user: User;

    @ManyToOne(() => Post, post => post.dislikes)
    post: Post;
}

export default PostDislike;
