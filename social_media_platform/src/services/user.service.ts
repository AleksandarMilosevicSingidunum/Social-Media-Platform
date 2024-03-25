import { SessionManager } from "@/utils/session.manager";
import axios, { AxiosError, AxiosResponse } from "axios";

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

export class UserService {
    static async signup(formData: FormData): Promise<AxiosResponse> {
        try {
            const response = await client.post('/users/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            throw new Error(`Signup failed: ${error.message}`);
        }
    }


    static async login(email: string | undefined, password: string | undefined) {
        if (email === undefined || password === undefined)
            throw new Error("PAYLOAD_UNDEFINED");

        if (email === '' || password === '')
            throw new Error("PAYLOAD_EMPTY");

        try {
            return await client.post('/users/login', { email, password });
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    static async updateUser(user: any): Promise<void> {
        try {
          await client.put(`/users/${user.id}`, user); 
        } catch (error) {
          throw new Error(`Failed to update user profile: ${error.message}`);
        }
      }
      

    static async refreshToken() {
        try {
            const refreshToken = SessionManager.getRefreshToken();
            if (!refreshToken) {
                throw new Error('Refresh token not found');
            }

            const response = await client.post('/users/refresh', {}, {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
                }
            });

            if (response.data.accessToken) {
                SessionManager.saveAccessToken(response.data.accessToken);
            } else {
                throw new Error('Access token not received');
            }
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
    
         

    static async getUserProfile() {
        await this.refreshToken(); // Refresh token before making the request
        const access = SessionManager.getAccessToken();
        return await this.useAxios(`/users/user/${access}`);
    }

    static async getUserById(userId: number) {
        return await this.useAxios(`/users/${userId}`);
    }

    static async getUserDetails(username: string) {
        return await this.useAxios(`/user/${username}`);
    }

    static async getAllUsers() {
        return await this.useAxios('/users');
    }

    static async isFollowing(followeeId: number, followerId: number): Promise<boolean> {
        try {
            const response = await client.post('/users/check-following', { followeeId, followerId });
            return response.data.isFollowing;
        } catch (error) {
            throw new Error(`Failed to check if following: ${error.message}`);
        }
    }

    static async followUser(followingId: number, userId: number): Promise<void> {
        try {
            await client.post('/users/follow', { followingId, userId });
        } catch (error) {
            throw new Error(`Failed to follow user: ${error.message}`);
        }
    }

    static async unfollowUser(followingId: number, userId: number): Promise<void> {
        try {
            await client.post('/users/unfollow', { followingId, userId });
        } catch (error) {
            throw new Error(`Failed to unfollow user: ${error.message}`);
        }
    }

    static async getFollowerCount(userId: number): Promise<number> {
        try {
            const response = await client.post('/users/followers/count', { userId });
            return response.data.followerCount;
        } catch (error) {
            throw new Error(`Failed to fetch follower count: ${error.message}`);
        }
    }

    static async getFollowedUsers(userId: number): Promise<AxiosResponse> {
        try {
            return await this.useAxios(`/users/${userId}/followed_users`, 'get', {});
        } catch (error) {
            throw new Error(`Failed to fetch followed users: ${error.message}`);
        }
    }

    static async useAxios(url: string, method: string = "get", body: object = {}) {
        await this.refreshToken();

        let rsp: AxiosResponse;
        

        try {
            rsp = await client.request({
                url: url,
                method: method,
                headers: {
                    'Authorization': `Bearer ${SessionManager.getAccessToken()}`
                },
                data: body
            }) as AxiosResponse;
        } catch (e) {
            console.error(e);
            rsp = (e as AxiosError).response as AxiosResponse;
        }

        if (rsp === undefined) {
            throw new Error("BACKEND_UNREACHABLE");
        }

        if (rsp.status === 403) {
            try {
                const tokenReq = await client.request({
                    url: '/users/refresh',
                    method: 'post',
                    headers: {
                        'Authorization': `Bearer ${SessionManager.getRefreshToken()}`
                    }
                });

                SessionManager.saveAuth(tokenReq.data);

                return await client.request({
                    url: url,
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${SessionManager.getAccessToken()}`
                    },
                    data: body
                });
            } catch (e) {
                throw new Error('REFRESH_FAILED');
            }
        }

        if (rsp.status === 404) {
            throw new Error('NOT_FOUND');
        }

        return rsp;
    }
}
