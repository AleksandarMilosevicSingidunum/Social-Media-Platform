import { createConnection } from 'typeorm';
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import { User } from './entities/User';
import { Post } from './entities/Post';
import { PostLike } from './entities/PostLike';
import { PostDislike } from './entities/PostDislike';
import { Comment } from './entities/Comment';
import { Follower } from './entities/Follower';
import { Notification } from './entities/Notification';
import { Message } from './entities/message';
import postRoutes from './routes/postRoutes';
import fs from 'fs';

dotenv.config();

createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Post, PostLike, PostDislike, Comment, Follower, Notification, Message],
}).then(connection => {
    console.log('Connected to database successfully!');

    const options = {
        key: fs.readFileSync('./src/cert/privateKey.key'),
        cert: fs.readFileSync('./src/cert/cert.crt')
    };

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));
    const port = process.env.PORT || 3000;
    
    const server = require('https').createServer(options, app);
    server.listen(port , () => {
        console.log(`Server is running on port ${port}`);
    }
    );
    
    app.use('/api/users', userRoutes);
    app.use('/api/posts', postRoutes);
}).catch(error => {
    console.error('Error connecting to database:', error);
});
