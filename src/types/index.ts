export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO date string
  tags: string[];
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string; // ISO date string
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Settings {
  currency: string;
  theme: 'light' | 'dark';
  dateFormat: string;
}

export interface ExpenseState {
  expenses: Expense[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  categories: Category[];
  settings: Settings;
}

export type ExpenseAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_RECURRING_EXPENSE'; payload: RecurringExpense }
  | { type: 'UPDATE_RECURRING_EXPENSE'; payload: RecurringExpense }
  | { type: 'DELETE_RECURRING_EXPENSE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'LOAD_STATE'; payload: ExpenseState };

