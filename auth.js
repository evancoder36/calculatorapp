// Google Authentication Module
// Replace YOUR_GOOGLE_CLIENT_ID with your actual Google Client ID

const AUTH_CONFIG = {
    // Get your Client ID from: https://console.cloud.google.com/apis/credentials
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    cookieName: 'evan_calc_user'
};

class AuthManager {
    constructor() {
        this.user = null;
        this.isInitialized = false;
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        const stored = localStorage.getItem(AUTH_CONFIG.cookieName);
        if (stored) {
            try {
                this.user = JSON.parse(stored);
            } catch (e) {
                localStorage.removeItem(AUTH_CONFIG.cookieName);
            }
        }
    }

    saveUserToStorage(user) {
        localStorage.setItem(AUTH_CONFIG.cookieName, JSON.stringify(user));
    }

    clearUserFromStorage() {
        localStorage.removeItem(AUTH_CONFIG.cookieName);
    }

    isAuthenticated() {
        return this.user !== null;
    }

    getUser() {
        return this.user;
    }

    // Initialize Google Sign-In
    initGoogleSignIn(buttonId, onSuccess, onError) {
        if (typeof google === 'undefined') {
            console.error('Google Identity Services not loaded');
            if (onError) onError('Google Sign-In not available');
            return;
        }

        google.accounts.id.initialize({
            client_id: AUTH_CONFIG.clientId,
            callback: (response) => this.handleCredentialResponse(response, onSuccess, onError),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Render the Google Sign-In button
        google.accounts.id.renderButton(
            document.getElementById(buttonId),
            {
                theme: 'filled_black',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                text: 'signin_with',
                logo_alignment: 'left',
                width: 280
            }
        );

        this.isInitialized = true;
    }

    handleCredentialResponse(response, onSuccess, onError) {
        try {
            // Decode the JWT token
            const payload = this.decodeJwtPayload(response.credential);

            this.user = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                token: response.credential
            };

            this.saveUserToStorage(this.user);

            if (onSuccess) onSuccess(this.user);
        } catch (error) {
            console.error('Error processing credential:', error);
            if (onError) onError(error.message);
        }
    }

    decodeJwtPayload(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    signOut(callback) {
        this.user = null;
        this.clearUserFromStorage();

        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }

        if (callback) callback();
    }

    // Check if user is authenticated, redirect to login if not
    requireAuth(redirectUrl = 'index.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Global auth manager instance
const authManager = new AuthManager();
