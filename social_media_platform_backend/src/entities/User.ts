import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './Post';
import { PostLike } from './PostLike';
import { PostDislike } from './PostDislike';
import { Comment } from './Comment';
import { Follower } from './Follower';
import { Notification } from './Notification';
import { Message } from './message';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    profileImage?: string;

    @Column({ nullable: true })
    bio?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    joinDate: Date;

    @OneToMany(() => Post, post => post.user)
    posts?: Post[];

    @OneToMany(() => PostLike, like => like.user)
    likes?: PostLike[];

    @OneToMany(() => PostDislike, dislike => dislike.user)
    dislikes?: PostDislike[];

    @OneToMany(() => Comment, comment => comment.user)
    comments?: Comment[];

    @OneToMany(() => Follower, follower => follower.following)
    following?: Follower[];

    @OneToMany(() => Follower, follower => follower.follower)
    followers?: Follower[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications?: Notification[];

    @OneToMany(() => Message, message => message.sender)
    sentMessages?: Message[];

    @OneToMany(() => Message, message => message.receiver)
    receivedMessages?: Message[];
}
