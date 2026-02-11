// ===========================
// FIREBASE STORAGE SERVICE
// Cloud storage implementation using Firestore
// ===========================

class FirebaseStorageService {
    constructor() {
        this.db = db; // From firebase-config.js
        this.auth = auth; // From firebase-config.js
        this.userId = null;
        this.unsubscribe = null;
        
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.userId = user.uid;
                console.log(`✅ User authenticated: ${user.email}`);
            } else {
                this.userId = null;
                console.log('ℹ️ User signed out');
            }
        });
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.userId !== null;
    }

    /**
     * Get current user
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.auth.currentUser;
    }

    /**
     * Get all data from Firestore
     * @returns {Promise<Object>} Budget tracker data
     */
    async getData() {
        if (!this.userId) {
            console.warn('⚠️ No user authenticated');
            return this.getDefaultData();
        }

        try {
            const doc = await this.db
                .collection('users')
                .doc(this.userId)
                .get();

            if (doc.exists) {
                const data = doc.data();
                console.log('✅ Data loaded from Firebase');
                return data;
            } else {
                console.log('ℹ️ No data found, using defaults');
                return this.getDefaultData();
            }
        } catch (error) {
            console.error('❌ Error reading from Firebase:', error);
            return this.getDefaultData();
        }
    }

    /**
     * Save all data to Firestore
     * @param {Object} data - Data to save
     * @returns {Promise<boolean>} Success status
     */
    async saveData(data) {
        if (!this.userId) {
            console.warn('⚠️ Cannot save: No user authenticated');
            return false;
        }

        try {
            // Validate before saving
            if (!this.validateDataStructure(data)) {
                throw new Error('Invalid data structure');
            }

            // Add metadata
            const dataWithMetadata = {
                ...data,
                lastModified: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.userId
            };

            await this.db
                .collection('users')
                .doc(this.userId)
                .set(dataWithMetadata, { merge: true });

            console.log('✅ Data saved to Firebase');
            return true;
        } catch (error) {
            console.error('❌ Error saving to Firebase:', error);
            return false;
        }
    }

    /**
     * Subscribe to real-time updates
     * @param {Function} callback - Called when data changes
     * @returns {Function} Unsubscribe function
     */
    subscribeToChanges(callback) {
        if (!this.userId) {
            console.warn('⚠️ Cannot subscribe: No user authenticated');
            return () => {};
        }

        // Unsubscribe from previous listener if exists
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Subscribe to real-time updates
        this.unsubscribe = this.db
            .collection('users')
            .doc(this.userId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    console.log('🔄 Real-time update received');
                    callback(doc.data());
                }
            }, (error) => {
                console.error('❌ Snapshot error:', error);
            });

        return this.unsubscribe;
    }

    /**
     * Unsubscribe from real-time updates
     */
    unsubscribeFromChanges() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
            console.log('ℹ️ Unsubscribed from real-time updates');
        }
    }

    /**
     * Validate data structure integrity
     * @param {Object} data - Data to validate
     * @returns {boolean} Validation result
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.expenses)) return false;
        if (typeof data.budget !== 'number' || isNaN(data.budget)) return false;
        
        // Validate each expense
        for (const expense of data.expenses) {
            if (!expense.id || !expense.description || !expense.category || !expense.date) {
                return false;
            }
            if (typeof expense.amount !== 'number' || isNaN(expense.amount)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get default data structure
     * @returns {Object} Default data
     */
    getDefaultData() {
        return {
            budget: 0,
            expenses: [],
            version: '1.0.0',
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Clear all data from Firestore (use with caution!)
     * @returns {Promise<boolean>} Success status
     */
    async clearData() {
        if (!this.userId) {
            console.warn('⚠️ Cannot clear: No user authenticated');
            return false;
        }

        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .delete();

            console.log('✅ Data cleared from Firebase');
            return true;
        } catch (error) {
            console.error('❌ Error clearing Firebase data:', error);
            return false;
        }
    }

    /**
     * Export data as JSON string
     * @returns {Promise<string>} JSON string of data
     */
    async exportData() {
        const data = await this.getData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON data to import
     * @returns {Promise<boolean>} Success status
     */
    async importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (this.validateDataStructure(data)) {
                return await this.saveData(data);
            }
            throw new Error('Invalid data format');
        } catch (error) {
            console.error('❌ Error importing data:', error);
            return false;
        }
    }

    /**
     * Migrate data from LocalStorage to Firebase
     * @param {Object} localData - Data from LocalStorage
     * @returns {Promise<boolean>} Success status
     */
    async migrateFromLocalStorage(localData) {
        if (!this.userId) {
            console.warn('⚠️ Cannot migrate: No user authenticated');
            return false;
        }

        try {
            console.log('🔄 Migrating data to Firebase...');
            const success = await this.saveData(localData);
            
            if (success) {
                console.log('✅ Data migration successful');
            }
            
            return success;
        } catch (error) {
            console.error('❌ Migration error:', error);
            return false;
        }
    }
}
