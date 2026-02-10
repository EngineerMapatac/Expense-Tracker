
# 💰 Budget Tracker Web App (MVP)

A modern, responsive personal budget and expense tracking system designed to help users monitor their income and expenses in a simple, intuitive way.

**Developed by:** John Mapatac | Computer Engineering Student

## ✨ Features

### Current MVP Features
- ✅ **Budget Management** - Set and update your monthly budget
- ✅ **Expense Tracking** - Add, edit, and delete expenses with ease
- ✅ **Smart Categorization** - 8 pre-defined categories with emoji icons
- ✅ **Real-time Summary** - Live calculation of total expenses and remaining budget
- ✅ **Filter by Category** - Quickly filter expenses by category
- ✅ **Responsive Design** - Beautiful UI that works on mobile and desktop
- ✅ **Local Storage** - All data persists in your browser with validation
- ✅ **Clean Architecture** - Modular code ready for backend integration
- ✅ **Form Validation** - Real-time field validation with helpful error messages
- ✅ **Toast Notifications** - Professional notification system with icons
- ✅ **Keyboard Shortcuts** - Productivity shortcuts for power users
- ✅ **Accessibility** - WCAG compliant with ARIA labels and screen reader support
- ✅ **First-Time UX** - Welcome message and guided setup for new users
- ✅ **Data Export/Import** - Backup and restore your data (via browser console)
- ✅ **Statistics** - Category breakdown and spending insights
- ✅ **Loading States** - Visual feedback for all actions
- ✅ **Print Support** - Print-friendly expense reports

### Keyboard Shortcuts
- **Ctrl/Cmd + B** - Open budget modal
- **Ctrl/Cmd + N** - Focus on new expense form
- **Escape** - Close modal
- **Tab** - Navigate between form fields (with focus trapping in modals)

### Categories
🍔 Food & Dining | 🚗 Transportation | 💡 Bills & Utilities | 🛍️ Shopping  
🎬 Entertainment | ⚕️ Healthcare | 📚 Education | 📦 Other

## 🚀 Quick Start

### Installation
1. **Download** all files (index.html, styles.css, app.js)
2. **Place** them in the same folder
3. **Open** `index.html` in your browser

That's it! No build tools, no dependencies, no installation required.

### First Steps
1. Click **"Edit Budget"** to set your monthly budget
2. Fill in the **Add New Expense** form with your first expense
3. Watch your budget summary update in real-time
4. Use the **category filter** to view expenses by type

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript (ES6+)** - Classes, Modules, LocalStorage API

### Design
- **Typography**: Fraunces (Display) + DM Sans (Body)
- **Color Palette**: Warm, trustworthy earth tones
- **Approach**: Mobile-first responsive design

## 📁 Project Structure

```
budget-tracker/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling
├── app.js              # Application logic
└── README.md           # Documentation
```

## 💎 Code Quality Features

### Professional Standards
- ✅ **JSDoc Comments** - Comprehensive documentation for all methods
- ✅ **Error Handling** - Try-catch blocks with graceful degradation
- ✅ **Input Validation** - Client-side validation with visual feedback
- ✅ **Data Integrity** - Structure validation before storage operations
- ✅ **Security** - XSS prevention with HTML escaping
- ✅ **Performance** - Optimized DOM updates and event delegation
- ✅ **Accessibility** - ARIA labels, semantic HTML, keyboard navigation
- ✅ **Responsive** - Mobile-first with touch-friendly targets

### Development Best Practices
- Single Responsibility Principle for each class
- Separation of concerns (Data, Business Logic, UI)
- Defensive programming with validation
- Consistent naming conventions
- No global variables (except app instance)
- Event delegation for better performance
- CSS custom properties for theming

## 🏗️ Architecture

The app uses a **clean, modular architecture** designed for easy migration to a backend:

### Classes & Separation of Concerns

```javascript
StorageService     → Data persistence layer (easily swap for API)
BudgetManager      → Budget-related operations
ExpenseManager     → Expense CRUD operations
UIManager          → DOM updates and rendering
App                → Main coordinator
```

### Benefits
- **Easy Backend Migration** - Just replace `StorageService` methods
- **Maintainable** - Clear separation of concerns
- **Testable** - Each class has a single responsibility
- **Scalable** - Add features without breaking existing code

## 🔄 Migrating to Backend (Future)

The architecture makes backend integration straightforward:

### Current (LocalStorage):
```javascript
class StorageService {
    getData() {
        return JSON.parse(localStorage.getItem('budgetTrackerData'));
    }
}
```

### Future (API):
```javascript
class StorageService {
    async getData() {
        const response = await fetch('/api/budget');
        return await response.json();
    }
}
```

Just update the `StorageService` class and add `async/await` to the managers!

## 🎨 Design Philosophy

### Visual Design
- **Warm & Trustworthy** - Cream backgrounds with sage green accents
- **Clear Hierarchy** - Typography scale for easy scanning
- **Smooth Interactions** - Thoughtful animations and transitions
- **Accessible** - High contrast, clear labels, keyboard navigation

### UX Principles
- **Immediate Feedback** - Real-time updates and notifications
- **Forgiving** - Confirm before deleting
- **Progressive Disclosure** - Show what matters most
- **Mobile-First** - Touch-friendly, thumb-zone optimized

## 🚀 Future Enhancements

### Planned Features
- [ ] **User Authentication** - Multi-user support
- [ ] **Backend Integration** - Node.js/Python API
- [ ] **Database** - PostgreSQL/MongoDB
- [ ] **Data Visualization** - Charts and graphs
- [ ] **Monthly Reports** - Spending trends
- [ ] **Budget Categories** - Custom category budgets
- [ ] **Export Data** - CSV/PDF export
- [ ] **Recurring Expenses** - Auto-add monthly bills
- [ ] **PWA Support** - Offline functionality, install prompt
- [ ] **Dark Mode** - Theme switching

### Technical Improvements
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] SEO optimization

## 📱 Browser Support

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 💡 Usage Tips

### Basic Usage
1. **Set Realistic Budget** - Start with your actual monthly income
2. **Log Immediately** - Add expenses right when they happen
3. **Review Weekly** - Check your spending patterns
4. **Use Categories** - Helps identify where money goes
5. **Watch the Colors** - Red remaining balance = over budget!

### Advanced Features

#### Export Your Data
Open browser console (F12) and run:
```javascript
const data = app.storage.exportData();
console.log(data); // Copy this JSON
```

#### Import Data
```javascript
const jsonData = '{"budget": 50000, "expenses": [...]}';
app.storage.importData(jsonData);
app.loadData();
```

#### View Statistics
```javascript
const stats = app.expenseManager.getCategoryStatistics();
console.table(stats);
```

#### Clear All Data
```javascript
if (confirm('Delete all data?')) {
    app.storage.clearData();
    location.reload();
}
```

### Accessibility Features
- **Screen Reader Support** - Full ARIA labels and semantic HTML
- **Keyboard Navigation** - All features accessible via keyboard
- **High Contrast** - Meets WCAG AA standards
- **Focus Indicators** - Clear visual focus states
- **Skip Links** - Jump to main content
- **Form Validation** - Inline error messages with announcements

## 🐛 Known Limitations (MVP)

- Data stored only in browser (clear cache = lose data)
- No data backup/export yet
- No recurring expenses
- Single currency (PHP)
- No multi-user support

These will be addressed in future versions!

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

This is a learning project, but suggestions and feedback are welcome!

## 📧 Contact

**John Mapatac**  
Computer Engineering Student

---

**Version:** 1.0.0 (MVP)  
**Last Updated:** February 2026

---

### Quick Reference: LocalStorage Structure

```json
{
  "budget": 50000,
  "expenses": [
    {
      "id": "exp_1234567890_abc123",
      "description": "Grocery shopping",
      "amount": 2500,
      "category": "food",
      "date": "2026-02-11",
      "createdAt": "2026-02-11T10:30:00.000Z"
    }
  ]
}
```

You can view this in Chrome DevTools → Application → Local Storage → Your Domain
