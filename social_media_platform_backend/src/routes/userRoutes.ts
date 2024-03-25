import express, { Router, Request, Response } from 'express';
import { UserService } from '../../src/services/userService';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';

const router = Router();

const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/Images');
    },
    filename: (req, file, cb) => {
        const username = req.body.username;
        const filename = `${username}_profileimage${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

const uploadProfileImage = upload.single('profileImage');

router.post('/signup', uploadProfileImage, async (req: Request, res: Response) => {
    try {
        const { username, email, password , bio} = req.body;
        const profileImage = req.file;
        const newUser = await UserService.signUp(username, email, password,bio, profileImage);
        return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await UserService.login(email, password);
        return res.status(200).json({ accessToken , refreshToken});
    } catch (error) {
        return res.status(401).json({ message: 'Invalid credentials', error: error.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body; // Data to be updated

        await UserService.updateUserProfile(userId, updatedData);

        return res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: 'Failed to update user profile', error: error.message });
    }
});

router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const refreshToken = req.headers.authorization?.split(' ')[1];
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not provided' });
        }

        const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as { userId: number };
        const user = await UserService.getUserById(decodedToken.userId.toString());

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TTL });
        return res.status(200).json({ accessToken });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to refresh access token', error: error.message });
    }
});

router.get('/profile', async (req: Request, res: Response) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        // Verify and decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };

        // Extract the userId from the decoded token
        const userId = decodedToken.userId.toString(); // Convert userId to string

        // Use the userId to fetch the user profile from the database
        const userProfile = await UserService.getUserById(userId);

        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Return the user profile in the response
        return res.status(200).json(userProfile);
    } catch (error) {
        // Handle errors, such as invalid token or database errors
        return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await UserService.deleteUser(req.params.id);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

router.get('/profile-image/:username', async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const user = await UserService.getUserByUsername(username);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.profileImage) {
            return res.status(404).json({ message: 'Profile image not found' });
        }

        const imagePath = path.join(__dirname, '..', '..', user.profileImage);

        // Send the profile image file
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error fetching profile image:', error);
        return res.status(500).json({ message: 'Failed to fetch profile image', error: error.message });
    }
});

router.get('/email/:email', async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
});

router.get('/user/:access', async (req: Request, res: Response) => {
    try {
        // Extract the token from the query parameters
        const access = req.params.access as string;
        const decodedToken = jwt.verify(access, process.env.JWT_ACCESS_SECRET) as { userId: number }
        console.log("decoded token",decodedToken);
        // Extract the userId from the decoded token
        const userId = decodedToken.userId.toString(); // Convert userId to string
        // Use the userId to fetch the user from the database
        const user = await UserService.getUserById(userId);




        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user in the response
        return res.status(200).json(user);
    } catch (error) {
        // Handle errors, such as invalid token or database errors
        return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
});

router.get('/user/:username', async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
});

router.get('/:Id/followed_users', async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.Id); // Convert userId to number
        // Fetch the users that the specified user follows
        const followedUsers = await UserService.getFollowedUsers(userId);

        if (!followedUsers) {
            return res.status(404).json({ message: 'Followed users not found' });
        }

        // Return the followed users in the response
        return res.status(200).json(followedUsers);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch followed users', error: error.message });
    }
});

router.post('/follow', async (req: Request, res: Response) => {
    try {
        const { userId, followingId } = req.body;
        await UserService.followUser(userId, followingId);
        return res.status(200).json({ message: 'User followed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to follow user', error: error.message });
    }
});

router.post('/unfollow', async (req: Request, res: Response) => {
    try {
        const { userId, followingId } = req.body;
        await UserService.unFollowUser(userId, followingId);
        return res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to unfollow user', error: error.message });
    }
});

router.post('/followers/count', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body; // Extract userId from the request body
        const followerCount = await UserService.countFollowers(userId);
        return res.status(200).json({ followerCount });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch follower count', error: error.message });
    }
});

router.post('/check-following', async (req: Request, res: Response) => {
    try {
        const { followerId, followeeId } = req.body;
        const isFollowing = await UserService.isFollowing(followerId, followeeId);
        return res.status(200).json({ isFollowing });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to check if user is following', error: error.message });
    }
});

export default router;
