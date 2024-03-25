
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { PostLike } from './PostLike';
import { PostDislike } from './PostDislike';
import { Comment } from './Comment';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    image?: string;

    // Relationships
    @ManyToOne(() => User, user => user.posts)
    user: User;

    @OneToMany(() => PostLike, like => like.post)
    likes: PostLike[];

    @OneToMany(() => PostDislike, dislike => dislike.post)
    dislikes: PostDislike[];

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];
}
