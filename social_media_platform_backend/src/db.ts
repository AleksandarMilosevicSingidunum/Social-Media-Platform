import dotenv from 'dotenv';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { PostLike } from './entities/PostLike';
import { PostDislike } from './entities/PostDislike';
import { Comment } from './entities/Comment';
import { Follower } from './entities/Follower';
import { Notification } from './entities/Notification';
import { Message } from './entities/message';
import { DataSource } from 'typeorm';

dotenv.config();
export const AppDataSource = new DataSource ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Post, PostLike, PostDislike, Comment, Follower, Notification, Message],
});