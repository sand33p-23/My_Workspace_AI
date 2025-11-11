import React, { useState } from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { BudgetManager } from './components/BudgetManager';
import { CategoryManager } from './components/CategoryManager';
import { RecurringExpenseForm } from './components/RecurringExpenseForm';
import { Reports } from './components/Reports';
import './App.css';

type View = 'dashboard' | 'expenses' | 'budgets' | 'categories' | 'recurring' | 'reports';

function AppContent() {
  const { state, dispatch } = useExpense();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }, [state.settings.theme]);

  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: newTheme } });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseList />;
      case 'budgets':
        return <BudgetManager />;
      case 'categories':
        return <CategoryManager />;
      case 'recurring':
        return <RecurringExpenseForm />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>💰 Expense Tracker</h1>
        </div>
        <div className="navbar-nav">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${currentView === 'expenses' ? 'active' : ''}`}
            onClick={() => setCurrentView('expenses')}
          >
            💸 Expenses
          </button>
          <button
            className={`nav-item ${currentView === 'budgets' ? 'active' : ''}`}
            onClick={() => setCurrentView('budgets')}
          >
            📈 Budgets
          </button>
          <button
            className={`nav-item ${currentView === 'categories' ? 'active' : ''}`}
            onClick={() => setCurrentView('categories')}
          >
            🏷️ Categories
          </button>
          <button
            className={`nav-item ${currentView === 'recurring' ? 'active' : ''}`}
            onClick={() => setCurrentView('recurring')}
          >
            🔄 Recurring
          </button>
          <button
            className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentView('reports')}
          >
            📊 Reports
          </button>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {state.settings.theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}

export default App;

