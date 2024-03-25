import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Follower {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'followerId' })
    follower!: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'followingId' })
    following!: User;
}
