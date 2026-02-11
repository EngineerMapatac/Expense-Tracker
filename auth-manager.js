// ===========================
// AUTHENTICATION MANAGER
// Handles user authentication with Firebase
// ===========================

class AuthManager {
    constructor() {
        this.auth = auth; // From firebase-config.js
        this.onAuthStateChangedCallback = null;
    }

    /**
     * Listen for authentication state changes
     * @param {Function} callback - Called when auth state changes
     */
    onAuthStateChanged(callback) {
        this.onAuthStateChangedCallback = callback;
        
        this.auth.onAuthStateChanged((user) => {
            if (callback) {
                callback(user);
            }
        });
    }

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User credential
     */
    async signUp(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            console.log('✅ User created:', userCredential.user.email);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Sign up error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User credential
     */
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ User signed in:', userCredential.user.email);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign in with Google
     * @returns {Promise<Object>} User credential
     */
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await this.auth.signInWithPopup(provider);
            console.log('✅ Google sign in:', userCredential.user.email);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Google sign in error:', error);
            
            // User closed popup
            if (error.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Sign-in cancelled' };
            }
            
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign out current user
     * @returns {Promise<boolean>} Success status
     */
    async signOut() {
        try {
            await this.auth.signOut();
            console.log('✅ User signed out');
            return true;
        } catch (error) {
            console.error('❌ Sign out error:', error);
            return false;
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return this.auth.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return this.auth.currentUser !== null;
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<Object>} Result
     */
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            console.log('✅ Password reset email sent');
            return { success: true };
        } catch (error) {
            console.error('❌ Password reset error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Update user email
     * @param {string} newEmail - New email address
     * @returns {Promise<Object>} Result
     */
    async updateEmail(newEmail) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('No user signed in');
            
            await user.updateEmail(newEmail);
            console.log('✅ Email updated');
            return { success: true };
        } catch (error) {
            console.error('❌ Email update error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Update user password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Result
     */
    async updatePassword(newPassword) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('No user signed in');
            
            await user.updatePassword(newPassword);
            console.log('✅ Password updated');
            return { success: true };
        } catch (error) {
            console.error('❌ Password update error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Delete user account
     * @returns {Promise<Object>} Result
     */
    async deleteAccount() {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('No user signed in');
            
            await user.delete();
            console.log('✅ Account deleted');
            return { success: true };
        } catch (error) {
            console.error('❌ Account deletion error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Get user-friendly error message
     * @param {string} errorCode - Firebase error code
     * @returns {string} User-friendly message
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'Email/password sign-in is not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/requires-recent-login': 'Please sign in again to perform this action.',
            'auth/popup-blocked': 'Popup blocked. Please allow popups for this site.',
            'auth/popup-closed-by-user': 'Sign-in cancelled.',
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Valid status
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePassword(password) {
        const result = {
            valid: true,
            errors: []
        };

        if (password.length < 6) {
            result.valid = false;
            result.errors.push('Password must be at least 6 characters');
        }

        if (password.length > 128) {
            result.valid = false;
            result.errors.push('Password is too long');
        }

        return result;
    }
}
