/**
 * BANGZ SALOON - Authentication System
 * Handles user login, session management, and authentication
 */

class AuthenticationManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        this.init();
    }

    async init() {
        console.log(`[${new Date().toISOString()}] 🔐 Initializing Authentication System`);
        
        // Check if user is already logged in
        await this.checkExistingSession();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log(`[${new Date().toISOString()}] ✅ Authentication System initialized`);
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const forgotPasswordLink = document.getElementById('forgot-password-link');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Auto-focus on email field
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.focus();
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');
        const loginText = document.getElementById('login-text');
        const loginLoading = document.getElementById('login-loading');
        const errorMessage = document.getElementById('error-message');

        // Validate inputs
        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            console.log(`[${new Date().toISOString()}] 🔐 Attempting login for: ${email}`);
            
            const result = await this.authenticateUser(email, password);
            
            if (result.success) {
                console.log(`[${new Date().toISOString()}] ✅ Login successful for: ${email}`);
                
                // Store session data
                this.createSession(result.user);
                
                // Redirect to main application
                this.redirectToMainApp();
                
            } else {
                throw new Error(result.error || 'Login failed');
            }
            
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Login failed:`, error);
            this.showError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async authenticateUser(email, password) {
        try {
            console.log(`[${new Date().toISOString()}] 🔐 Authenticating user: ${email}`);
            
            // Use the global Supabase integration instance
            if (!window.supabaseIntegration) {
                throw new Error('Supabase integration not available');
            }
            const result = await window.supabaseIntegration.makeRequest('authenticateUser', {
                email: email,
                password: password
            });
            
            if (result && result.success) {
                console.log(`[${new Date().toISOString()}] ✅ User authenticated successfully: ${result.user.name}`);
                return { success: true, user: result.user };
            } else {
                console.log(`[${new Date().toISOString()}] ❌ Authentication failed: ${result?.error || 'Unknown error'}`);
                return { success: false, error: result?.error || 'Invalid email or password' };
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Authentication error:`, error);
            return { success: false, error: 'Authentication failed. Please try again.' };
        }
    }

    async hashPassword(password) {
        // Simple hash function - in production, use proper password hashing
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'bangz_saloon_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async checkExistingSession() {
        try {
            const sessionData = localStorage.getItem('bangz_saloon_session');
            
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const now = new Date().getTime();
                
                // Check if session is still valid
                if (session.expiresAt > now) {
                    console.log(`[${new Date().toISOString()}] ✅ Valid session found for: ${session.user.email}`);
                    this.isAuthenticated = true;
                    this.currentUser = session.user;
                    
                    // Redirect to main app if on login page
                    if (window.location.pathname.includes('login.html')) {
                        this.redirectToMainApp();
                    }
                } else {
                    console.log(`[${new Date().toISOString()}] ⏰ Session expired, clearing data`);
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error checking session:`, error);
            this.clearSession();
        }
    }

    createSession(user) {
        const sessionData = {
            user: user,
            loginTime: new Date().getTime(),
            expiresAt: new Date().getTime() + this.sessionTimeout
        };
        
        localStorage.setItem('bangz_saloon_session', JSON.stringify(sessionData));
        this.isAuthenticated = true;
        this.currentUser = user;
        
        console.log(`[${new Date().toISOString()}] ✅ Session created for: ${user.email}`);
    }

    clearSession() {
        localStorage.removeItem('bangz_saloon_session');
        this.isAuthenticated = false;
        this.currentUser = null;
        
        console.log(`[${new Date().toISOString()}] 🗑️ Session cleared`);
    }

    redirectToMainApp() {
        // Redirect to main application
        window.location.href = 'index.html';
    }

    redirectToLogin() {
        // Redirect to login page
        window.location.href = 'login.html';
    }

    setLoadingState(loading) {
        const loginBtn = document.getElementById('login-btn');
        const loginText = document.getElementById('login-text');
        const loginLoading = document.getElementById('login-loading');

        if (loading) {
            loginBtn.disabled = true;
            loginText.style.display = 'none';
            loginLoading.style.display = 'flex';
        } else {
            loginBtn.disabled = false;
            loginText.style.display = 'inline';
            loginLoading.style.display = 'none';
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }
    }

    showSuccess(message) {
        // You can implement success message display here
        console.log(`[${new Date().toISOString()}] ✅ ${message}`);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleForgotPassword() {
        // Implement forgot password functionality
        alert('Forgot password functionality will be implemented. Please contact your administrator.');
    }

    // Static method to check authentication from other pages
    static async checkAuth() {
        const authManager = new AuthenticationManager();
        await authManager.checkExistingSession();
        
        if (!authManager.isAuthenticated) {
            authManager.redirectToLogin();
            return false;
        }
        
        return true;
    }

    // Static method to logout
    static logout() {
        const authManager = new AuthenticationManager();
        authManager.clearSession();
        authManager.redirectToLogin();
    }

    // Static method to get current user
    static getCurrentUser() {
        try {
            const sessionData = localStorage.getItem('bangz_saloon_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                return session.user;
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting current user:`, error);
        }
        return null;
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${new Date().toISOString()}] 🎯 DOM loaded, initializing Authentication Manager`);
    window.authManager = new AuthenticationManager();
});

// Handle page visibility changes for session management
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.authManager) {
        window.authManager.checkExistingSession();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log(`[${new Date().toISOString()}] 🌐 Connection restored`);
});

window.addEventListener('offline', () => {
    console.log(`[${new Date().toISOString()}] 📴 Connection lost`);
});
