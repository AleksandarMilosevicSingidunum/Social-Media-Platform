import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content!: string;

    // Relationships
    @ManyToOne(() => User, user => user.sentMessages)
    sender: User;

    @ManyToOne(() => User, user => user.receivedMessages)
    receiver: User;
}
