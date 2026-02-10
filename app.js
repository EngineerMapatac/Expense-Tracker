// ===========================
// STORAGE SERVICE
// Abstract layer for data persistence - easy to swap for API calls
// ===========================
class StorageService {
    constructor(storageKey = 'budgetTrackerData') {
        this.storageKey = storageKey;
        this.validateStorageAvailability();
    }

    /**
     * Check if localStorage is available and working
     */
    validateStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.error('LocalStorage is not available:', error);
            alert('Warning: Your browser storage is not available. Data will not be saved.');
            return false;
        }
    }

    /**
     * Get all data from storage
     * @returns {Object} Budget tracker data
     */
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                return this.getDefaultData();
            }
            
            const parsed = JSON.parse(data);
            
            // Validate data structure
            if (!this.validateDataStructure(parsed)) {
                console.warn('Invalid data structure detected. Resetting to defaults.');
                return this.getDefaultData();
            }
            
            return parsed;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return this.getDefaultData();
        }
    }

    /**
     * Save all data to storage
     * @param {Object} data - Data to save
     * @returns {boolean} Success status
     */
    saveData(data) {
        try {
            // Validate before saving
            if (!this.validateDataStructure(data)) {
                throw new Error('Invalid data structure');
            }
            
            const serialized = JSON.stringify(data);
            
            // Check storage quota
            if (serialized.length > 5 * 1024 * 1024) { // 5MB limit
                throw new Error('Data exceeds storage quota');
            }
            
            localStorage.setItem(this.storageKey, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some expenses.');
            }
            
            return false;
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
     * Clear all data from storage
     */
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Export data as JSON file
     * @returns {string} JSON string of data
     */
    exportData() {
        const data = this.getData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON data to import
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (this.validateDataStructure(data)) {
                return this.saveData(data);
            }
            throw new Error('Invalid data format');
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// ===========================
// BUDGET MANAGER
// Handles budget-related operations
// ===========================
class BudgetManager {
    constructor(storageService) {
        this.storage = storageService;
    }

    getBudget() {
        const data = this.storage.getData();
        return data.budget || 0;
    }

    setBudget(amount) {
        const data = this.storage.getData();
        data.budget = parseFloat(amount) || 0;
        return this.storage.saveData(data);
    }

    getRemainingBudget() {
        const budget = this.getBudget();
        const expenses = this.storage.getData().expenses || [];
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        return budget - totalExpenses;
    }
}

// ===========================
// EXPENSE MANAGER
// Handles expense CRUD operations
// ===========================
class ExpenseManager {
    constructor(storageService) {
        this.storage = storageService;
    }

    // Get all expenses
    getAllExpenses() {
        const data = this.storage.getData();
        return data.expenses || [];
    }

    // Get expenses by category
    getExpensesByCategory(category) {
        if (category === 'all') {
            return this.getAllExpenses();
        }
        return this.getAllExpenses().filter(exp => exp.category === category);
    }

    // Add new expense
    addExpense(expense) {
        const data = this.storage.getData();
        const newExpense = {
            id: this.generateId(),
            ...expense,
            amount: parseFloat(expense.amount),
            createdAt: new Date().toISOString()
        };
        data.expenses.push(newExpense);
        this.storage.saveData(data);
        return newExpense;
    }

    // Update expense
    updateExpense(id, updates) {
        const data = this.storage.getData();
        const index = data.expenses.findIndex(exp => exp.id === id);
        
        if (index === -1) {
            return null;
        }

        data.expenses[index] = {
            ...data.expenses[index],
            ...updates,
            amount: parseFloat(updates.amount),
            updatedAt: new Date().toISOString()
        };
        
        this.storage.saveData(data);
        return data.expenses[index];
    }

    // Delete expense
    deleteExpense(id) {
        const data = this.storage.getData();
        const initialLength = data.expenses.length;
        data.expenses = data.expenses.filter(exp => exp.id !== id);
        
        if (data.expenses.length < initialLength) {
            this.storage.saveData(data);
            return true;
        }
        return false;
    }

    // Get total expenses
    getTotalExpenses() {
        const expenses = this.getAllExpenses();
        return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    }

    // Generate unique ID
    generateId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get expense by ID
    getExpenseById(id) {
        return this.getAllExpenses().find(exp => exp.id === id);
    }

    /**
     * Get expense statistics by category
     * @returns {Object} Category breakdown with totals and percentages
     */
    getCategoryStatistics() {
        const expenses = this.getAllExpenses();
        const total = this.getTotalExpenses();
        const stats = {};

        expenses.forEach(expense => {
            if (!stats[expense.category]) {
                stats[expense.category] = {
                    total: 0,
                    count: 0,
                    percentage: 0
                };
            }
            stats[expense.category].total += parseFloat(expense.amount);
            stats[expense.category].count += 1;
        });

        // Calculate percentages
        Object.keys(stats).forEach(category => {
            stats[category].percentage = total > 0 
                ? ((stats[category].total / total) * 100).toFixed(1)
                : 0;
        });

        return stats;
    }

    /**
     * Get recent expenses
     * @param {number} limit - Number of expenses to return
     * @returns {Array} Recent expenses
     */
    getRecentExpenses(limit = 5) {
        return this.getAllExpenses()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    /**
     * Get expenses for a specific date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array} Filtered expenses
     */
    getExpensesByDateRange(startDate, endDate) {
        return this.getAllExpenses().filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }

    /**
     * Get average daily spending
     * @returns {number} Average daily amount
     */
    getAverageDailySpending() {
        const expenses = this.getAllExpenses();
        if (expenses.length === 0) return 0;

        const today = new Date();
        const firstExpenseDate = new Date(
            Math.min(...expenses.map(e => new Date(e.date)))
        );
        
        const daysDiff = Math.max(1, 
            Math.ceil((today - firstExpenseDate) / (1000 * 60 * 60 * 24))
        );

        return this.getTotalExpenses() / daysDiff;
    }
}

// ===========================
// UI MANAGER
// Handles all DOM updates and rendering
// ===========================
class UIManager {
    constructor() {
        this.elements = {
            budgetDisplay: document.getElementById('budgetDisplay'),
            totalExpenses: document.getElementById('totalExpenses'),
            remaining: document.getElementById('remaining'),
            expensesList: document.getElementById('expensesList'),
            emptyState: document.getElementById('emptyState'),
            filterCategory: document.getElementById('filterCategory'),
            budgetModal: document.getElementById('budgetModal'),
            modalOverlay: document.getElementById('modalOverlay'),
            closeModal: document.getElementById('closeModal'),
            budgetForm: document.getElementById('budgetForm'),
            budgetAmount: document.getElementById('budgetAmount'),
            expenseForm: document.getElementById('expenseForm'),
            submitBtn: document.getElementById('submitBtn'),
            submitBtnText: document.getElementById('submitBtnText')
        };

        this.categoryEmojis = {
            food: '🍔',
            transport: '🚗',
            bills: '💡',
            shopping: '🛍️',
            entertainment: '🎬',
            health: '⚕️',
            education: '📚',
            other: '📦'
        };

        this.categoryNames = {
            food: 'Food & Dining',
            transport: 'Transportation',
            bills: 'Bills & Utilities',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            health: 'Healthcare',
            education: 'Education',
            other: 'Other'
        };
    }

    // Format currency
    formatCurrency(amount) {
        return `₱${parseFloat(amount).toLocaleString('en-PH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Update budget display
    updateBudgetDisplay(budget) {
        this.elements.budgetDisplay.textContent = this.formatCurrency(budget);
    }

    // Update summary cards
    updateSummary(totalExpenses, remaining) {
        this.elements.totalExpenses.textContent = this.formatCurrency(totalExpenses);
        this.elements.remaining.textContent = this.formatCurrency(remaining);

        // Add visual indicator for negative balance
        const remainingCard = this.elements.remaining.closest('.summary-card');
        if (remaining < 0) {
            this.elements.remaining.style.color = 'var(--color-expense)';
            remainingCard.classList.add('warning');
        } else {
            this.elements.remaining.style.color = 'var(--color-text-primary)';
            remainingCard.classList.remove('warning');
        }
    }

    // Render expenses list
    renderExpenses(expenses) {
        if (expenses.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.expensesList.querySelectorAll('.expense-item').forEach(item => item.remove());
            return;
        }

        this.elements.emptyState.classList.add('hidden');

        // Clear existing expenses
        this.elements.expensesList.querySelectorAll('.expense-item').forEach(item => item.remove());

        // Render each expense
        expenses.forEach(expense => {
            const expenseElement = this.createExpenseElement(expense);
            this.elements.expensesList.appendChild(expenseElement);
        });
    }

    // Create expense element
    createExpenseElement(expense) {
        const div = document.createElement('div');
        div.className = 'expense-item';
        div.dataset.id = expense.id;

        const categoryEmoji = this.categoryEmojis[expense.category] || '📦';
        const categoryName = this.categoryNames[expense.category] || 'Other';

        div.innerHTML = `
            <div class="expense-category-icon">${categoryEmoji}</div>
            <div class="expense-details">
                <div class="expense-description">${this.escapeHtml(expense.description)}</div>
                <div class="expense-meta">
                    <span class="expense-category">${categoryName}</span>
                    <span class="expense-date">${this.formatDate(expense.date)}</span>
                </div>
            </div>
            <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
            <div class="expense-actions">
                <button class="btn-icon edit" onclick="app.editExpense('${expense.id}')" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="btn-icon delete" onclick="app.deleteExpense('${expense.id}')" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4H3.33333H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        return div;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show budget modal
    showBudgetModal(currentBudget = 0) {
        this.elements.budgetAmount.value = currentBudget;
        this.elements.budgetModal.classList.add('active');
        this.elements.budgetAmount.focus();
    }

    // Hide budget modal
    hideBudgetModal() {
        this.elements.budgetModal.classList.remove('active');
        this.elements.budgetForm.reset();
    }

    // Populate form for editing
    populateExpenseForm(expense) {
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date;
        
        this.elements.submitBtnText.textContent = 'Update Expense';
        this.elements.submitBtn.dataset.editId = expense.id;
    }

    // Reset expense form
    resetExpenseForm() {
        this.elements.expenseForm.reset();
        this.elements.submitBtnText.textContent = 'Add Expense';
        delete this.elements.submitBtn.dataset.editId;
        
        // Set date to today
        document.getElementById('date').valueAsDate = new Date();
    }

    // Show notification (simple version)
    showNotification(message, type = 'success') {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icon based on type
        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.success}</div>
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        // Auto-remove after 4 seconds
        setTimeout(() => this.removeToast(toast), 4000);
    }

    // Remove toast notification
    removeToast(toast) {
        if (toast && !toast.classList.contains('removing')) {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // Show loading state on button
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    // Validate form field
    validateField(field, rules = {}) {
        const value = field.value.trim();
        const group = field.closest('.form-group');
        
        // Remove existing error
        const existingError = group.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        group.classList.remove('error');

        // Required validation
        if (rules.required && !value) {
            this.showFieldError(group, 'This field is required');
            return false;
        }

        // Min value validation
        if (rules.min !== undefined && parseFloat(value) < rules.min) {
            this.showFieldError(group, `Minimum value is ${rules.min}`);
            return false;
        }

        // Max value validation
        if (rules.max !== undefined && parseFloat(value) > rules.max) {
            this.showFieldError(group, `Maximum value is ${rules.max}`);
            return false;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(group, rules.message || 'Invalid format');
            return false;
        }

        return true;
    }

    // Show field error
    showFieldError(group, message) {
        group.classList.add('error');
        const error = document.createElement('span');
        error.className = 'error-message';
        error.textContent = message;
        group.appendChild(error);
    }
}

// ===========================
// MAIN APP
// Coordinates all managers
// ===========================
class App {
    constructor() {
        this.storage = new StorageService();
        this.budgetManager = new BudgetManager(this.storage);
        this.expenseManager = new ExpenseManager(this.storage);
        this.ui = new UIManager();
        this.currentFilter = 'all';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        
        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();

        // Check if first time user
        this.checkFirstTimeUser();

        // Add performance monitoring
        this.logPerformanceMetrics();
    }

    /**
     * Check if this is the user's first visit
     */
    checkFirstTimeUser() {
        const data = this.storage.getData();
        const isFirstTime = !localStorage.getItem('budgetTracker_visited');
        
        if (isFirstTime) {
            localStorage.setItem('budgetTracker_visited', 'true');
            
            // Show welcome message after a short delay
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 500);
        }
    }

    /**
     * Show welcome message for new users
     */
    showWelcomeMessage() {
        const budget = this.budgetManager.getBudget();
        
        if (budget === 0) {
            this.ui.showNotification(
                '👋 Welcome! Start by setting your monthly budget.',
                'success'
            );
            
            // Auto-open budget modal for first-time users
            setTimeout(() => {
                this.ui.showBudgetModal(0);
            }, 2000);
        }
    }

    /**
     * Log performance metrics for optimization
     */
    logPerformanceMetrics() {
        if (window.performance && window.performance.timing) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            if (pageLoadTime > 0) {
                console.log(`%c⚡ Page loaded in ${pageLoadTime}ms`, 'color: #6B8E6F; font-weight: bold;');
            }
        }
    }

    setupEventListeners() {
        // Budget modal
        document.getElementById('editBudgetBtn').addEventListener('click', () => {
            this.ui.showBudgetModal(this.budgetManager.getBudget());
        });

        this.ui.elements.closeModal.addEventListener('click', () => {
            this.ui.hideBudgetModal();
        });

        this.ui.elements.modalOverlay.addEventListener('click', () => {
            this.ui.hideBudgetModal();
        });

        this.ui.elements.budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBudgetSubmit();
        });

        // Expense form
        this.ui.elements.expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });

        // Filter
        this.ui.elements.filterCategory.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterExpenses();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key closes modal
            if (e.key === 'Escape') {
                this.ui.hideBudgetModal();
            }
            
            // Ctrl/Cmd + B opens budget modal
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.ui.showBudgetModal(this.budgetManager.getBudget());
            }
            
            // Ctrl/Cmd + N focuses on expense form
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('description').focus();
            }
        });

        // Form input validation on blur
        const formInputs = document.querySelectorAll('#expenseForm input, #expenseForm select');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value) {
                    const rules = { required: true };
                    if (input.type === 'number') {
                        rules.min = 0.01;
                    }
                    this.ui.validateField(input, rules);
                }
            });
        });

        // Budget form validation
        this.ui.elements.budgetAmount.addEventListener('blur', () => {
            if (this.ui.elements.budgetAmount.value) {
                this.ui.validateField(this.ui.elements.budgetAmount, { 
                    required: true, 
                    min: 0 
                });
            }
        });

        // Trap focus in modal when open
        this.ui.elements.budgetModal.addEventListener('keydown', (e) => {
            if (!this.ui.elements.budgetModal.classList.contains('active')) return;
            
            if (e.key === 'Tab') {
                const focusableElements = this.ui.elements.budgetModal.querySelectorAll(
                    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    handleBudgetSubmit() {
        const amountField = this.ui.elements.budgetAmount;
        const amount = parseFloat(amountField.value);
        
        // Validate amount
        if (!this.ui.validateField(amountField, { 
            required: true, 
            min: 0,
            max: 999999999
        })) {
            return;
        }
        
        // Show loading state
        const submitBtn = this.ui.elements.budgetForm.querySelector('button[type="submit"]');
        this.ui.setButtonLoading(submitBtn, true);

        // Simulate async operation (for future API integration)
        setTimeout(() => {
            this.budgetManager.setBudget(amount);
            this.ui.hideBudgetModal();
            this.updateUI();
            this.ui.showNotification('Budget updated successfully!');
            this.ui.setButtonLoading(submitBtn, false);
        }, 300);
    }

    handleExpenseSubmit() {
        const descriptionField = document.getElementById('description');
        const amountField = document.getElementById('amount');
        const categoryField = document.getElementById('category');
        const dateField = document.getElementById('date');

        // Validate all fields
        const isDescriptionValid = this.ui.validateField(descriptionField, { 
            required: true 
        });
        
        const isAmountValid = this.ui.validateField(amountField, { 
            required: true, 
            min: 0.01,
            max: 999999999
        });
        
        const isCategoryValid = this.ui.validateField(categoryField, { 
            required: true 
        });
        
        const isDateValid = this.ui.validateField(dateField, { 
            required: true 
        });

        // Stop if any validation failed
        if (!isDescriptionValid || !isAmountValid || !isCategoryValid || !isDateValid) {
            this.ui.showNotification('Please correct the errors in the form', 'error');
            return;
        }

        // Collect form data
        const formData = {
            description: descriptionField.value.trim(),
            amount: amountField.value,
            category: categoryField.value,
            date: dateField.value
        };

        const editId = this.ui.elements.submitBtn.dataset.editId;

        // Show loading state
        this.ui.setButtonLoading(this.ui.elements.submitBtn, true);

        // Simulate async operation
        setTimeout(() => {
            try {
                if (editId) {
                    // Update existing expense
                    this.expenseManager.updateExpense(editId, formData);
                    this.ui.showNotification('Expense updated successfully!');
                } else {
                    // Add new expense
                    this.expenseManager.addExpense(formData);
                    this.ui.showNotification('Expense added successfully!');
                }

                this.ui.resetExpenseForm();
                this.updateUI();
            } catch (error) {
                console.error('Error saving expense:', error);
                this.ui.showNotification('Failed to save expense. Please try again.', 'error');
            } finally {
                this.ui.setButtonLoading(this.ui.elements.submitBtn, false);
            }
        }, 300);
    }

    editExpense(id) {
        const expense = this.expenseManager.getExpenseById(id);
        if (expense) {
            this.ui.populateExpenseForm(expense);
            // Scroll to form
            this.ui.elements.expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenseManager.deleteExpense(id);
            this.updateUI();
            this.ui.showNotification('Expense deleted successfully!');
        }
    }

    filterExpenses() {
        const expenses = this.expenseManager.getExpensesByCategory(this.currentFilter);
        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.ui.renderExpenses(expenses);
    }

    updateUI() {
        const budget = this.budgetManager.getBudget();
        const totalExpenses = this.expenseManager.getTotalExpenses();
        const remaining = this.budgetManager.getRemainingBudget();

        this.ui.updateBudgetDisplay(budget);
        this.ui.updateSummary(totalExpenses, remaining);
        this.filterExpenses();
    }

    loadData() {
        this.updateUI();
    }
}

// ===========================
// INITIALIZE APP
// ===========================
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
