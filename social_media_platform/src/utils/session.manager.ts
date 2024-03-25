import type { AuthModel } from "@/models/auth.model";

export class SessionManager {
    static saveAuth(model: AuthModel) {
        const authData = {
            accessToken: model.accessToken,
            refreshToken: model.refreshToken
        };
        localStorage.setItem('auth', JSON.stringify({ auth: authData }));

    }

    static getAuth(): AuthModel | null {
        const authString = localStorage.getItem('auth');
        if (!authString) {
            throw new Error('NO_AUTH_DATA');
        }
        const authData = JSON.parse(authString);
        return {
            accessToken: authData.auth.accessToken,
            refreshToken: authData.auth.refreshToken
        };
    }
    static saveAccessToken(accessToken: string) {
        let auth = this.getAuth();
        if (!auth) {
            // If there's no existing auth data, create a new one
            auth = { accessToken: '', refreshToken: '' };
        }
        auth.accessToken = accessToken;
        this.saveAuth(auth);
    }
    static getAccessToken(): string {
        const auth = this.getAuth();
        return auth.accessToken;
    }

    static getRefreshToken(): string {
        const auth = this.getAuth();
        return auth.refreshToken;
    }

    static clearAuth() {
        localStorage.removeItem('auth');
    }

    public static hasAuth(): boolean {
        return localStorage.getItem('auth') !== null;
    }
}
