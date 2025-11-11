import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ExpenseState, ExpenseAction, Expense, Budget, RecurringExpense, Category, Settings } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getNextRecurrenceDate } from '../utils/dateUtils';

const defaultCategories: Category[] = [
  { id: '1', name: 'Food', color: '#FF6B6B', icon: '🍔' },
  { id: '2', name: 'Transport', color: '#4ECDC4', icon: '🚗' },
  { id: '3', name: 'Entertainment', color: '#45B7D1', icon: '🎬' },
  { id: '4', name: 'Bills', color: '#FFA07A', icon: '💳' },
  { id: '5', name: 'Shopping', color: '#98D8C8', icon: '🛍️' },
  { id: '6', name: 'Other', color: '#95A5A6', icon: '📦' },
];

const defaultSettings: Settings = {
  currency: 'INR',
  theme: 'light',
  dateFormat: 'MM/dd/yyyy',
};

const initialState: ExpenseState = {
  expenses: [],
  budgets: [],
  recurringExpenses: [],
  categories: defaultCategories,
  settings: defaultSettings,
};

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };

    case 'SET_BUDGET':
      // Check if budget already exists for this category and period
      const existingBudgetIndex = state.budgets.findIndex(
        b => b.category === action.payload.category && b.period === action.payload.period
      );
      if (existingBudgetIndex >= 0) {
        return {
          ...state,
          budgets: state.budgets.map((budget, index) =>
            index === existingBudgetIndex ? action.payload : budget
          ),
        };
      }
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
      };

    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        ),
      };

    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
      };

    case 'ADD_RECURRING_EXPENSE':
      return {
        ...state,
        recurringExpenses: [...state.recurringExpenses, action.payload],
      };

    case 'UPDATE_RECURRING_EXPENSE':
      return {
        ...state,
        recurringExpenses: state.recurringExpenses.map(re =>
          re.id === action.payload.id ? action.payload : re
        ),
      };

    case 'DELETE_RECURRING_EXPENSE':
      return {
        ...state,
        recurringExpenses: state.recurringExpenses.filter(re => re.id !== action.payload),
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };

    case 'DELETE_CATEGORY':
      // Don't allow deleting categories that are in use
      const categoryInUse = state.expenses.some(exp => exp.category === action.payload) ||
        state.budgets.some(b => b.category === action.payload) ||
        state.recurringExpenses.some(re => re.category === action.payload);
      
      if (categoryInUse) {
        return state; // Don't delete if in use
      }
      
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface ExpenseContextType {
  state: ExpenseState;
  dispatch: React.Dispatch<ExpenseAction>;
  generateRecurringExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [storedState, setStoredState] = useLocalStorage<ExpenseState>('expense-tracker-state', initialState);
  const [state, dispatch] = useReducer(expenseReducer, storedState);

  // Sync state to localStorage whenever it changes
  React.useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  // Generate expenses from recurring expenses
  const generateRecurringExpenses = React.useCallback(() => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    state.recurringExpenses.forEach(recurring => {
      const startDate = new Date(recurring.startDate);
      const endDate = recurring.endDate ? new Date(recurring.endDate) : null;

      // Check if we should generate an expense today
      let shouldGenerate = false;
      let lastGeneratedDate = startDate;

      // Find the last generated expense for this recurring expense
      const existingExpenses = state.expenses.filter(
        exp => exp.description === recurring.description && exp.category === recurring.category
      );
      
      if (existingExpenses.length > 0) {
        const sorted = existingExpenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        lastGeneratedDate = new Date(sorted[0].date);
      }

      // Calculate next occurrence
      const nextDate = getNextRecurrenceDate(lastGeneratedDate.toISOString(), recurring.frequency);
      const nextDateObj = new Date(nextDate);
      const nextDateISO = nextDateObj.toISOString().split('T')[0];

      // Generate if next occurrence is today or in the past, and within end date if specified
      if (nextDateISO <= todayISO) {
        if (!endDate || nextDateObj <= endDate) {
          shouldGenerate = true;
        }
      }

      if (shouldGenerate) {
        // Check if expense already exists for this date
        const exists = state.expenses.some(
          exp => exp.description === recurring.description &&
                 exp.category === recurring.category &&
                 exp.date.split('T')[0] === nextDateISO
        );

        if (!exists) {
          const newExpense: Expense = {
            id: `${recurring.id}-${nextDateISO}-${Date.now()}`,
            amount: recurring.amount,
            description: recurring.description,
            category: recurring.category,
            date: nextDateObj.toISOString(),
            tags: [],
          };
          dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
        }
      }
    });
  }, [state.recurringExpenses, state.expenses]);

  // Auto-generate recurring expenses on mount and daily
  React.useEffect(() => {
    generateRecurringExpenses();
    // Check daily for new recurring expenses
    const interval = setInterval(() => {
      generateRecurringExpenses();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, [generateRecurringExpenses]);

  return (
    <ExpenseContext.Provider value={{ state, dispatch, generateRecurringExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}

