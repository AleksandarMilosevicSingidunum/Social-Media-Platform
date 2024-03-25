import express, { Request, Response } from 'express';
import { PostService } from '../services/postService';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import { UserService } from '../services/userService';

const router = express.Router();
const postService = new PostService();

const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/Images'); // Set destination folder
    },
    filename: (req, file, cb) => {
        const username = req.body.userId; // Assuming userId is provided in the request body
        const filename = `${username}_post_${file.originalname}`; // Change filename pattern for post images
        // Remove the 'src/Images' prefix from the filename
        const adjustedFilename = filename.replace('src/Images/', '');
        cb(null, adjustedFilename); // Set filename
    }
});

const upload = multer({ storage: storage });

router.get('/posts', async (req: Request, res: Response) => {
    try {
        const posts = await postService.getAllPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/post_image/:image', async (req: Request, res: Response) => {
    try {
        const postId = req.params.image; 
        const imagePath = path.join(__dirname, '..', 'Images', postId);
        res.sendFile(imagePath);
    } catch (error: any) {
        console.error('Error fetching post image:', error);
        return res.status(500).json({ message: 'Failed to fetch post image', error: error.message });
    }
});

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
    try {
        const { userId, content } = req.body;

        // Check if userId and content are provided
        if (!userId || !content) {
            return res.status(400).json({ message: 'UserId and content are required' });
        }

        // Fetch user based on userId
        const user = await UserService.getUserById(userId); // Assuming userService is defined and imported

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create post using the fetched user object
        const post = await postService.createPost(user, content, req.file);

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//delete post 
router.delete('/:postId', async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.body.userId;

        if (!postId) {
            return res.status(400).json({ message: 'PostId is required' });
        }

        const result = await postService.deletePost(parseInt(postId), userId);

        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        const posts = await postService.getPostsByUsername(username);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts by username:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/like', async (req: Request, res: Response) => {
    try {
        const { postId, userId } = req.body;

        // Check if postId and userId are provided
        if (!postId || !userId) {
            return res.status(400).json({ message: 'PostId and userId are required' });
        }

        // Call the corresponding service method to handle liking the post
        const result = await postService.likePost(postId, userId);

        res.json(result); // Return the result of the like operation
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/dislike', async (req: Request, res: Response) => {
    try {
        const { postId, userId } = req.body;

        if (!postId || !userId) {
            return res.status(400).json({ message: 'PostId and userId are required' });
        }

        const result = await postService.dislikePost(postId, userId);

        res.json(result);
    } catch (error) {
        console.error('Error disliking post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//count the number of likes// Modify the routes for counting likes and dislikes
router.get('/like/:postId', async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({ message: 'PostId is required' });
        }
        const likesCount = await postService.countLikes(Number(postId));
        res.json({ likes: likesCount }); // Return likes count in the response
    } catch (error) {
        console.error('Error counting likes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/dislike/:postId', async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({ message: 'PostId is required' });
        }
        const dislikesCount = await postService.countDislikes(Number(postId));
        res.json({ dislikes: dislikesCount }); // Return dislikes count in the response
    } catch (error) {
        console.error('Error counting dislikes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/comments/:postId', async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({ message: 'PostId is required' });
        }
        const comments = await postService.getComments(Number(postId));
        res.json(comments); // Return the comments in the response
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
} );

router.post('/comment', async (req: Request, res: Response) => {
    try {
        const { postId, userId, content } = req.body;
        console.log (postId, userId, content);
        if (!postId || !userId || !content) {



            return res.status(400).json({ message: 'PostId, userId, and content are required' });
        }

        const result = await postService.commentOnPost(postId, userId, content);

        res.json(result); // Return the result of the comment operation
    } catch (error) {
        console.error('Error commenting on post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/comment/:commentId', async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.body.userId;

        if (!commentId) {
            return res.status(400).json({ message: 'CommentId is required' });
        }

        const result = await postService.deleteComment(parseInt(commentId), userId);

        if (!result) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
