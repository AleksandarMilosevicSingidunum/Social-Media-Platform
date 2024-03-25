
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content!: string;

    // Relationships
    @ManyToOne(() => User, user => user.notifications)
    user!: User;
}
