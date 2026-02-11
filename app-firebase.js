// ===========================
// FIREBASE APP INTEGRATION
// Connects authentication UI with Firebase services
// ===========================

// Initialize managers
const authManager = new AuthManager();
let firebaseApp;

// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authTabs = document.querySelectorAll('.auth-tab');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const switchToLocalBtn = document.getElementById('switchToLocal');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailDisplay = document.getElementById('userEmail');

// Setup authentication UI
function setupAuthUI() {
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show appropriate form
            if (tabType === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
            }
        });
    });

    // Login form submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Show loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        const result = await authManager.signIn(email, password);
        
        if (!result.success) {
            showAuthError(result.error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
        // Success is handled by onAuthStateChanged
    });

    // Signup form submit
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        // Show loading
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
        
        const result = await authManager.signUp(email, password);
        
        if (!result.success) {
            showAuthError(result.error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
        // Success is handled by onAuthStateChanged
    });

    // Google sign-in
    googleSignInBtn.addEventListener('click', async () => {
        googleSignInBtn.textContent = 'Signing in...';
        googleSignInBtn.disabled = true;
        
        const result = await authManager.signInWithGoogle();
        
        if (!result.success) {
            showAuthError(result.error);
            googleSignInBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64,9.2c0-0.637-0.057-1.251-0.164-1.84H9v3.481h4.844c-0.209,1.125-0.843,2.078-1.796,2.717v2.258h2.908C16.658,14.137,17.64,11.898,17.64,9.2z"/>
                    <path fill="#34A853" d="M9,18c2.43,0,4.467-0.806,5.956-2.184l-2.908-2.258c-0.806,0.54-1.837,0.86-3.048,0.86c-2.344,0-4.328-1.584-5.036-3.711H0.957v2.332C2.438,15.983,5.482,18,9,18z"/>
                    <path fill="#FBBC05" d="M3.964,10.707c-0.18-0.54-0.282-1.117-0.282-1.707s0.102-1.167,0.282-1.707V4.961H0.957C0.347,6.173,0,7.548,0,9s0.348,2.827,0.957,4.039L3.964,10.707z"/>
                    <path fill="#EA4335" d="M9,3.58c1.321,0,2.508,0.454,3.44,1.345l2.582-2.582C13.463,0.891,11.426,0,9,0C5.482,0,2.438,2.017,0.957,4.961l3.007,2.332C4.672,5.163,6.656,3.58,9,3.58z"/>
                </svg>
                Continue with Google
            `;
            googleSignInBtn.disabled = false;
        }
        // Success is handled by onAuthStateChanged
    });

    // Switch to offline mode
    switchToLocalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (confirm('Switch to offline mode? Your data will only be stored on this device.')) {
            localStorage.setItem('useLocalStorage', 'true');
            location.reload();
        }
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        if (confirm('Sign out? Your data is safely stored in the cloud.')) {
            await authManager.signOut();
        }
    });
}

// Show authentication error
function showAuthError(message) {
    // Create error notification
    const error = document.createElement('div');
    error.className = 'auth-error';
    error.textContent = message;
    
    // Add to active form
    const activeForm = document.querySelector('.auth-form:not(.hidden)');
    const existingError = activeForm.querySelector('.auth-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    activeForm.insertBefore(error, activeForm.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => error.remove(), 5000);
}

// Show/hide containers based on auth state
function updateUI(user) {
    if (user) {
        // User is signed in
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        // Update user email display
        if (userEmailDisplay) {
            userEmailDisplay.textContent = user.email;
        }
        
        // Initialize app with Firebase storage
        initializeApp();
    } else {
        // User is signed out
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        
        // Reset forms
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }
}

// Initialize main app with Firebase
async function initializeApp() {
    // Check if already initialized
    if (firebaseApp) return;
    
    try {
        // Use Firebase storage instead of LocalStorage
        const firebaseStorage = new FirebaseStorageService();
        
        // Check if user has LocalStorage data to migrate
        const localStorageKey = 'budgetTrackerData';
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData && localData !== '{"budget":0,"expenses":[]}') {
            const shouldMigrate = confirm(
                'We found data saved on this device. Would you like to migrate it to the cloud?'
            );
            
            if (shouldMigrate) {
                try {
                    const parsedData = JSON.parse(localData);
                    await firebaseStorage.migrateFromLocalStorage(parsedData);
                    
                    // Show success message
                    setTimeout(() => {
                        if (window.app && window.app.ui) {
                            window.app.ui.showNotification('✅ Local data migrated to cloud!');
                        }
                    }, 1000);
                    
                    // Clear local storage
                    localStorage.removeItem(localStorageKey);
                } catch (error) {
                    console.error('Migration error:', error);
                }
            }
        }
        
        // Initialize app with Firebase storage
        const budgetManager = new BudgetManager(firebaseStorage);
        const expenseManager = new ExpenseManager(firebaseStorage);
        const ui = new UIManager();
        
        firebaseApp = new App();
        firebaseApp.storage = firebaseStorage;
        firebaseApp.budgetManager = budgetManager;
        firebaseApp.expenseManager = expenseManager;
        firebaseApp.ui = ui;
        
        // Replace global app instance
        window.app = firebaseApp;
        
        // Initialize
        firebaseApp.init();
        
        // Subscribe to real-time updates
        firebaseStorage.subscribeToChanges((data) => {
            console.log('🔄 Data updated from cloud');
            firebaseApp.updateUI();
        });
        
        console.log('✅ Firebase app initialized');
        
    } catch (error) {
        console.error('❌ App initialization error:', error);
        alert('Failed to initialize app. Please refresh the page.');
    }
}

// Check storage preference on load
function checkStoragePreference() {
    const useLocalStorage = localStorage.getItem('useLocalStorage') === 'true';
    
    if (useLocalStorage) {
        // Use offline mode - show app directly
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        // Initialize with LocalStorage (original app)
        // The regular app.js will handle this
        console.log('ℹ️ Using offline mode (LocalStorage)');
    } else {
        // Use Firebase mode
        setupAuthUI();
        
        // Listen for auth state changes
        authManager.onAuthStateChanged((user) => {
            updateUI(user);
        });
        
        console.log('ℹ️ Using Firebase mode');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkStoragePreference);
} else {
    checkStoragePreference();
}
