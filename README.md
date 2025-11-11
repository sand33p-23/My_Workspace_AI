# 💰 Expense Tracker

A modern, full-featured expense tracking web application built with React, TypeScript, and Vite. Track your daily expenses, manage budgets, set up recurring expenses, and analyze your spending patterns with beautiful visualizations.

![Expense Tracker](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)

## ✨ Features

### 📊 Dashboard
- **Summary Cards**: View today's, this week's, and this month's spending at a glance
- **Budget Progress**: Visual progress indicators for each budget category
- **Spending Trends**: Interactive charts showing your spending patterns over the last 30 days
- **Recent Expenses**: Quick access to your most recent transactions

### 💸 Expense Management
- **Add/Edit/Delete Expenses**: Full CRUD operations for expense tracking
- **Category Organization**: Organize expenses by customizable categories
- **Tags System**: Add tags to expenses for better organization
- **Date Tracking**: Track expenses by date with an intuitive date picker

### 📈 Budget Tracking
- **Category Budgets**: Set budgets for specific categories
- **Period-based Budgets**: Daily, weekly, or monthly budget periods
- **Progress Visualization**: See how much you've spent vs. your budget
- **Over-budget Alerts**: Visual indicators when you exceed your budget

### 🔄 Recurring Expenses
- **Automated Tracking**: Set up recurring expenses that auto-generate
- **Flexible Frequencies**: Daily, weekly, monthly, or yearly recurrence
- **Date Ranges**: Set start and end dates for recurring expenses

### 🏷️ Category Management
- **Custom Categories**: Create and manage your own expense categories
- **Color Coding**: Assign colors and icons to categories for visual organization
- **Icon Library**: Choose from a variety of emoji icons

### 📊 Reports & Analytics
- **Category Breakdown**: Pie charts showing spending by category
- **Spending Trends**: Line charts tracking spending over time
- **Date Range Filtering**: Analyze spending for specific time periods
- **Export Functionality**: Export your data as CSV or JSON

### 🔍 Advanced Filtering
- **Search**: Search expenses by description or tags
- **Category Filter**: Filter by specific categories
- **Date Range**: Filter by date range
- **Amount Range**: Filter by minimum and maximum amounts
- **Sorting**: Sort by date, amount, or category

### 🎨 Modern UI/UX
- **Beautiful Design**: Modern, colorful interface with gradients and animations
- **Dark/Light Theme**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Polished transitions and hover effects
- **Local Storage**: All data persists in your browser

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard view
│   │   ├── ExpenseList.tsx  # Expense listing and management
│   │   ├── ExpenseForm.tsx  # Add/edit expense form
│   │   ├── BudgetManager.tsx # Budget management
│   │   ├── CategoryManager.tsx # Category management
│   │   ├── RecurringExpenseForm.tsx # Recurring expenses
│   │   └── Reports.tsx      # Reports and analytics
│   ├── context/             # React Context API
│   │   └── ExpenseContext.tsx # Global state management
│   ├── hooks/               # Custom React hooks
│   │   ├── useLocalStorage.ts # LocalStorage persistence
│   │   └── useExpenseFilters.ts # Filtering logic
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── calculations.ts  # Budget and spending calculations
│   │   ├── currencyUtils.ts  # Currency formatting
│   │   ├── dateUtils.ts     # Date manipulation
│   │   └── exportUtils.ts   # CSV/JSON export
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Usage

### Adding an Expense

1. Navigate to the **Expenses** tab
2. Click the **+ Add Expense** button
3. Fill in the expense details:
   - Amount (in your selected currency)
   - Description
   - Category
   - Date
   - Tags (optional, comma-separated)
4. Click **Add Expense**

### Setting Up a Budget

1. Go to the **Budgets** tab
2. Click **+ Add Budget**
3. Select a category
4. Set the budget amount
5. Choose the period (daily/weekly/monthly)
6. Set the start date
7. Click **Add Budget**

### Creating Recurring Expenses

1. Navigate to the **Recurring** tab
2. Click **+ Add Recurring Expense**
3. Fill in the details:
   - Description
   - Amount
   - Category
   - Frequency (daily/weekly/monthly/yearly)
   - Start date
   - End date (optional)
4. The app will automatically generate expenses based on the schedule

### Managing Categories

1. Go to the **Categories** tab
2. Click **+ Add Category**
3. Enter the category name
4. Choose an icon and color
5. Click **Add Category**

### Viewing Reports

1. Navigate to the **Reports** tab
2. Select a date range (Last 7/30/90 days or All time)
3. View spending breakdowns and trends
4. Export data as CSV or JSON if needed

## 💾 Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ Your data never leaves your device
- ✅ No account or login required
- ✅ Works offline
- ⚠️ Clearing browser data will delete your expenses

The localStorage key used is: `expense-tracker-state`

## 🎨 Customization

### Changing Currency

The default currency is set to INR (Indian Rupee). To change it:

1. Open `src/context/ExpenseContext.tsx`
2. Modify the `defaultSettings.currency` value
3. The app will use the new currency format

### Theme Customization

The app supports light and dark themes. You can toggle between them using the theme button in the navbar. Theme preferences are saved in localStorage.

## 🛠️ Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Chart library for visualizations
- **date-fns** - Date manipulation utilities
- **CSS3** - Styling with modern features (gradients, animations, etc.)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Icons and emojis used throughout the UI
- Recharts library for beautiful data visualizations
- The React and TypeScript communities

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ using React and TypeScript

