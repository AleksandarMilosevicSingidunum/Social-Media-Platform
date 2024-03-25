import { Repository, getRepository } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Express } from 'express'; // Ensure to import Express type
import bcrypt from 'bcrypt';
import { Follower } from '../entities/Follower';
dotenv.config();
const accessSecret = process.env.JWT_ACCESS_SECRET || '';
const accessTtl = process.env.JWT_ACCESS_TTL || '';
const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
const refreshTtl = process.env.JWT_REFRESH_TTL || '';
const saltRounds = 10;



export class UserService {
    static async getAllUsers(): Promise<User[]> {
        const userRepository = getRepository(User);

        if (!userRepository) {
            throw new Error('User repository not initialized');
        }
        return await userRepository.find();
    }

    static async signUp(username: string, email: string, password: string, bio: string, profileImage?: Express.Multer.File): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const userRepository = getRepository(User);
            const existingUser = await userRepository.findOne({ where: [{ username }, { email }] });

            if (existingUser) {
                if (existingUser.username === username) {
                    throw new Error('Username already exists');
                }
                if (existingUser.email === email) {
                    throw new Error('Email already exists');
                }
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create a new user object
            const newUser = new User();
            newUser.username = username;
            newUser.email = email;
            newUser.password = hashedPassword;
            newUser.profileImage = profileImage?.path;
            newUser.bio = bio

            // Save the user to the database
            await userRepository.save(newUser);

            // Generating access token during sign-up
            const accessToken = jwt.sign({ userId: newUser.id }, accessSecret, { expiresIn: accessTtl });

            // Generating refresh token during sign-up
            const refreshToken = jwt.sign({ userId: newUser.id }, refreshSecret, { expiresIn: refreshTtl });

            return { accessToken, refreshToken };
        } catch (error) {
            console.error("Error during signup:", error);
            throw error;
        }
    }

    static async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            throw new Error('Invalid credentials');
        }
        if (await bcrypt.compare(password, user.password)) {
            // Generating access token during login
            const accessToken = jwt.sign({ userId: user.id }, accessSecret, { expiresIn: accessTtl });

            // Generating refresh token during login
            const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, { expiresIn: refreshTtl });

            return { accessToken, refreshToken };
        }
        throw new Error('BAD CREDENTIALS');
    }

    static async updateUserProfile(userId: string, updatedData: any): Promise<void> {
        try {
            const userRepository = getRepository(User);
            const user = await userRepository.findOne({ where: { id: Number(userId) } });
    
            if (!user) {
                throw new Error('User not found');
            }
    
            // Update user data
            if (updatedData.username) {
                user.username = updatedData.username;
            }
            if (updatedData.email) {
                user.email = updatedData.email;
            }
            if (updatedData.bio) {
                user.bio = updatedData.bio;
            }
            // Save the updated user to the database
            await userRepository.save(user);
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    static async followUser(userId: number, followingId: number): Promise<void> {
        const followerRepository = getRepository(Follower);
        const existingFollower = await followerRepository.findOne({ where: { follower: { id: userId }, following: { id: followingId } } });
        
        if (existingFollower) {
            throw new Error('You are already following this user');
        }

        // Fetch user entities corresponding to userId and followingId
        const followerUser = await getRepository(User).findOneOrFail({ where: { id: userId } });
        const followingUser = await getRepository(User).findOneOrFail({ where: { id: followingId } });

        // Create a new follower entry
        const newFollower = new Follower();
        newFollower.follower = followerUser;
        newFollower.following = followingUser;

        await followerRepository.save(newFollower);
    }

    static async countFollowers(userId: number): Promise<number> {
        const followerRepository = getRepository(Follower);
        const followerCount = await followerRepository.count({ where: { follower: { id: userId } } });

        return followerCount;
    }

    static async getFollowedUsers(userId: number): Promise<User[]> {
        try {
            const userRepository = getRepository(User);
            const user = await userRepository.findOneOrFail({ where: { id: userId }, relations: ['following'] });
    
            if (!user || !user.following) {
                return []; // Return an empty array if user or user.following is undefined
            }
    
            // Extract the followed users from the user's 'following' relation
            const followedUsers: User[] = [];
            for (const follower of user.following) {
                // Check if the follower ID exists
                if (follower.id) {
                    const followerRepository = getRepository(Follower);

                    // Retrieve the follower user by the follower ID
                    const followerUser = await followerRepository.findOne({ where: { id: follower.id }, relations: ['follower'] });
                    if (followerUser && followerUser.follower) {
                        followedUsers.push(followerUser.follower);
                    }
                }
            }            
            return followedUsers; 
        } catch (error) {
            console.error("Error fetching followed users:", error);
            throw new Error(`Failed to fetch followed users: ${error.message}`);
        }
    }
    
    static async isFollowing(followerId: number, followeeId: number): Promise<boolean> {
        try {
            const followerRepository = getRepository(Follower);

            const existingFollower = await followerRepository.findOne({
                where: { follower: { id: followerId }, following: { id: followeeId } }
            });
            return !!existingFollower; // Return true if following, false if not following
        } catch (error) {
            console.error("Error checking if user is following:", error);
            throw new Error(`Failed to check if user is following: ${error.message}`);
        }
    }
    
    static async unFollowUser(userId: number, followingId: number): Promise<void> {
        try {
            const followerRepository = getRepository(Follower);
            const existingFollower = await followerRepository.findOne({ where: { follower: { id: userId }, following: { id: followingId } }});

            if (!existingFollower) {
                throw new Error('You are not following this user');
            }
            await followerRepository.remove(existingFollower);
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw new Error(`Failed to unfollow user: ${error.message}`);
        }
    }
    
    static async getUserByUsername(username: string): Promise<User | undefined> {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { username } });

        return user || undefined; // Return undefined if user is null
    }
    
    static async getUserByToken(token: string): Promise<User | undefined> {
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET || '') as JwtPayload;
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { id: decodedToken.userId } });

        return user ? user : undefined; // Return undefined if user is null
    }
    
    static async getUserById(id: string): Promise<User | undefined> {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { id: Number(id) } });

        return user || undefined; // Return undefined if user is null
    }
    
    static async getUserByEmail(email: string): Promise<User | undefined> {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        return user || undefined; // Return undefined if user is null
    }
    
    static async deleteUser(id: string): Promise<void> {
        const userRepository = getRepository(User);
        await userRepository.delete(id);
    }

    static async getProfileImagePath(username: string): Promise<string | undefined> {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { username } });
        
        return user?.profileImage;
    }
}
