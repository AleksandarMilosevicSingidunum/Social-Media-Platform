import { SessionManager } from './session.manager';

export function useLogout() {

    function logout() {
        console.log("Logging out...");
        SessionManager.clearAuth();
        console.log("Logged out.");
        window.location.href = '/login';
    }

    return logout;
}

