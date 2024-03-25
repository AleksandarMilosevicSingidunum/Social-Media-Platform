import { getRepository } from 'typeorm';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Comment } from '../entities/Comment';
import { PostLike } from '../entities/PostLike';
import { PostDislike } from '../entities/PostDislike';

export class PostService {

    async getAllPosts(): Promise<any[]> {
        try {
            const postRepository = getRepository(Post);
            const posts = await postRepository.find({ relations: ['user'] });
            return posts.map(post => ({
                id: post.id,
                content: post.content,
                image: post.image,
                user: {
                    id: post.user.id,
                    username: post.user.username,
                    profileImage: post.user.profileImage
                }
            }));
        } catch (error) {
            console.error('Error fetching all posts:', error);
            throw new Error(`Failed to fetch all posts: ${error.message}`);
        }
    }

    async getPostsByUsername(username: string): Promise<any[]> {
        try {
            const postRepository = getRepository(Post);
            const posts = await postRepository.find({
                relations: ['user'],
                where: {
                    user: {
                        username
                    }
                }
            });

            return posts.map(post => ({
                id: post.id,
                content: post.content,
                image: post.image,
                user: {
                    id: post.user.id,
                    username: post.user.username,
                    profileImage: post.user.profileImage
                }
            }));
        } catch (error) {
            console.error('Error fetching posts by username:', error);
            throw new Error(`Failed to fetch posts by username: ${error.message}`);
        }
    }

    async createPost(user: User, content: string, image?: Express.Multer.File) {
        try {
            const postRepository = getRepository(Post);
            const post = new Post();
            post.user = user;
            post.content = content;
            post.image = image?.filename;
            return postRepository.save(post);
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }
    async deletePost(postId: number, userId: number): Promise<boolean> {
        try {
            const postRepository = getRepository(Post);
            const post = await postRepository.findOne({ where: { id: postId }, relations: ['user'] });
    
            if (!post) {
                throw new Error('Post not found');
            }
    
            if (post.user.id !== userId) {
                throw new Error('You are not authorized to delete this post');
            }
    
            await postRepository.delete(postId);
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    async likePost(postId: number, userId: number): Promise<any> {
        try {
            const postRepository = getRepository(Post);
            const userRepository = getRepository(User);
            const likeRepository = getRepository(PostLike);
            const dislikeRepository = getRepository(PostDislike);
    
            const post = await postRepository.findOne({
                where: { id: postId },
                relations: ['likes', 'likes.user', 'dislikes']
            });
    
            if (!post) {
                throw new Error('Post not found');
            }
    
            // Check if the user already liked the post
            const existingLike = post.likes.find(like => like.user?.id === userId);
            if (existingLike) {
                return { message: 'User has already liked this post' };
            }
    
            // Find the user who is liking the post
            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
    
            // Remove any existing dislikes by this user for this post
            await dislikeRepository.delete({ post, user });
    
            // Create a new PostLike entity
            const like = new PostLike();
            like.post = post;
            like.user = user;
            await likeRepository.save(like);
    
            return post;
        } catch (error) {
            console.error('Error liking post:', error);
            throw new Error(`Failed to like post: ${error.message}`);
        }
    }
    
    async dislikePost(postId: number, userId: number): Promise<any> {
        try {
            const postRepository = getRepository(Post);
            const userRepository = getRepository(User);
            const dislikeRepository = getRepository(PostDislike);
            const likeRepository = getRepository(PostLike);
    
            const post = await postRepository.findOne({ where: { id: postId }, relations: ['dislikes', 'dislikes.user', 'likes'] });
    
            if (!post) {
                throw new Error('Post not found');
            }
    
            // Check if the user already disliked the post
            const existingDislike = post.dislikes.find(dislike => dislike.user?.id === userId);
            if (existingDislike) {
                return { message: 'User has already disliked this post' };
            }
    
            // Find the user who is disliking the post
            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
    
            // Remove any existing likes by this user for this post
            await likeRepository.delete({ post, user });
    
            // Create a new PostDislike entity
            const dislike = new PostDislike();
            dislike.post = post;
            dislike.user = user;
    
            // Save the dislike entity
            await dislikeRepository.save(dislike);
    
            return post;
        } catch (error) {
            console.error('Error disliking post:', error);
            throw new Error(`Failed to dislike post: ${error.message}`);
        }
    }
    async countLikes(postId: number): Promise<number> {
        try {
            const postRepository = getRepository(Post);
            const post = await postRepository.findOne({ where: { id: postId }, relations: ['likes'] });
            if (!post) {
                throw new Error('Post not found');
            }
            if(post.likes === undefined){
                return 0;
            }
            return post.likes ? post.likes.length : 0;
        } catch (error) {
            console.error('Error counting likes:', error);
            throw new Error(`Failed to count likes: ${error.message}`);
        }
    }
    
    async countDislikes(postId: number): Promise<number> {
        try {
            const postRepository = getRepository(Post);
            const post = await postRepository.findOne({ where: { id: postId }, relations: ['dislikes'] });
            if (!post) {
                throw new Error('Post not found');
            }
            if(post.dislikes === undefined){
                return 0;
            }
            return post.dislikes ? post.dislikes.length : 0;
        } catch (error) {
            console.error('Error counting dislikes:', error);
            throw new Error(`Failed to count dislikes: ${error.message}`);
        }
    }
    
    async getComments(postId: number): Promise<any[]> {
        try {
            const postRepository = getRepository(Post);
            const post = await postRepository.findOne({ where: { id: postId }, relations: ['comments', 'comments.user'] });
            if (!post) {
                throw new Error('Post not found');
            }
            return post.comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                user: {
                    id: comment.user.id,
                    username: comment.user.username,
                    profileImage: comment.user.profileImage
                }
            }));
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw new Error(`Failed to fetch comments: ${error.message}`);
        }
    }

    async commentOnPost(postId: number, userId: number, content: string): Promise<any> {
        try {
            const postRepository = getRepository(Post);
            const userRepository = getRepository(User);
            const commentRepository = getRepository(Comment);
            const post = await postRepository.findOne({ where: { id: postId }, relations: ['comments'] });

            if (!post) {
                throw new Error('Post not found');
            }

            const user = await userRepository.findOne({ where: { id: userId }, relations: ["comments"] });

            if (!user) {
                throw new Error('User not found');
            }

            const comment = new Comment();
            comment.post = post;
            comment.user = user;
            comment.content = content;

            await commentRepository.save(comment);

            return post;
        } catch (error) {
            console.error('Error commenting on post:', error);
            throw new Error(`Failed to comment on post: ${error.message}`);
        }
    }
    async deleteComment(commentId: number, userId: number): Promise<boolean> {
        try {
            const commentRepository = getRepository(Comment);
            const comment = await commentRepository.findOne({ where: { id: commentId }, relations: ['user'] });
    
            if (!comment) {
                throw new Error('Comment not found');
            }
    
            // Check if the user is the owner of the comment
            if (comment.user.id !== userId) {
                throw new Error('You are not authorized to delete this comment');
            }
    
            await commentRepository.delete(commentId);
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw new Error(`Failed to delete comment: ${error.message}`);
        }
    }
}
