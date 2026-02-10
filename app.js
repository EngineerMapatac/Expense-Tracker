// ===========================
// STORAGE SERVICE
// Abstract layer for data persistence - easy to swap for API calls
// ===========================
class StorageService {
    constructor(storageKey = 'budgetTrackerData') {
        this.storageKey = storageKey;
    }

    // Get all data
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (error) {
            console.error('Error reading from storage:', error);
            return this.getDefaultData();
        }
    }

    // Save all data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }

    // Get default data structure
    getDefaultData() {
        return {
            budget: 0,
            expenses: []
        };
    }

    // Clear all data
    clearData() {
        localStorage.removeItem(this.storageKey);
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
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-expense)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
            if (e.key === 'Escape') {
                this.ui.hideBudgetModal();
            }
        });
    }

    handleBudgetSubmit() {
        const amount = parseFloat(this.ui.elements.budgetAmount.value);
        
        if (isNaN(amount) || amount < 0) {
            this.ui.showNotification('Please enter a valid budget amount', 'error');
            return;
        }

        this.budgetManager.setBudget(amount);
        this.ui.hideBudgetModal();
        this.updateUI();
        this.ui.showNotification('Budget updated successfully!');
    }

    handleExpenseSubmit() {
        const formData = {
            description: document.getElementById('description').value.trim(),
            amount: document.getElementById('amount').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        // Validation
        if (!formData.description || !formData.amount || !formData.category || !formData.date) {
            this.ui.showNotification('Please fill in all fields', 'error');
            return;
        }

        const editId = this.ui.elements.submitBtn.dataset.editId;

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
