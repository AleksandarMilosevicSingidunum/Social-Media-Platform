import axios, { AxiosResponse, AxiosError } from "axios";
import { SessionManager } from "@/utils/session.manager";

const client = axios.create({
    baseURL: 'https://localhost:3000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    validateStatus: function (code) {
        return code === 200 || code === 201;
    }
});

export class PostService {
    static async getAllPosts(): Promise<AxiosResponse> {
        try {
            const response = await client.get('/posts/posts');
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
    }

    static async getPostByUsername(username: string): Promise<AxiosResponse> {
        try {
            const response = await client.get(`/posts/${username}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
    }

    static async createPost(formData: FormData): Promise<AxiosResponse> {
        try {
            const response = await client.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Set content type to multipart form data
                }
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    static async deletePost(postId: string, userId: string): Promise<AxiosResponse> {
        try {
            const response = await client.delete(`/posts/${postId}`, { data: { userId } });
            return response;
        } catch (error) {
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    static async likePost(postId: string, userId: string): Promise<AxiosResponse> {
        try {
            const response = await client.post('/posts/like', { postId, userId });
            return response;
        } catch (error) {
            throw new Error(`Failed to like post: ${error.message}`);
        }
    }

    static async dislikePost(postId: string, userId: string): Promise<AxiosResponse> {
        try {
            const response = await client.post('/posts/dislike', { postId, userId });
            return response;
        } catch (error) {
            throw new Error(`Failed to dislike post: ${error.message}`);
        }
    }
    static async countLikes(postId: string): Promise<AxiosResponse> {
        try {
            const response = await client.get(`/posts/like/${postId}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to count likes: ${error.message}`);
        }
    }

    static async countDislikes(postId: string): Promise<AxiosResponse> {   
        try {
            const response = await client.get(`/posts/dislike/${postId}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to count dislikes: ${error.message}`);
        }
    }

    static async commentPost(postId: string, userId: string, content: string): Promise<AxiosResponse> {
        try {
            console.log(postId, userId, content);
            const response = await client.post('/posts/comment', { postId, userId, content });
            return response;
        } catch (error) {
            throw new Error(`Failed to comment on post: ${error.message}`);
        }
    }
    static async deleteComment(commentId: number, userId: string): Promise<AxiosResponse> {
        try {
            console.log(commentId, userId);
            const response = await client.delete(`/posts/comment/${commentId}`, { data: { userId } });
            return response;
        } catch (error) {
            throw new Error(`Failed to delete comment: ${error.message}`);
        }
    }


    static async getComments(postId: string): Promise<AxiosResponse> {
        try {
            const response = await client.post(`/posts/comments/${postId}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to get comments: ${error.message}`);
        }
    }
}
