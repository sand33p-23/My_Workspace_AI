import { Expense, Budget } from '../types';
import { parseISO, isWithinInterval } from 'date-fns';
import { getTodayRange, getWeekRange, getMonthRange } from './dateUtils';

export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateTotalByCategory = (expenses: Expense[], category: string): number => {
  return expenses
    .filter(expense => expense.category === category)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateTotalByPeriod = (
  expenses: Expense[],
  period: 'daily' | 'weekly' | 'monthly',
  referenceDate: Date = new Date()
): number => {
  let range;
  switch (period) {
    case 'daily':
      range = getTodayRange();
      break;
    case 'weekly':
      range = getWeekRange(referenceDate);
      break;
    case 'monthly':
      range = getMonthRange(referenceDate);
      break;
  }

  return expenses
    .filter(expense => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, range);
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateTotalByCategoryAndPeriod = (
  expenses: Expense[],
  category: string,
  period: 'daily' | 'weekly' | 'monthly',
  referenceDate: Date = new Date()
): number => {
  return calculateTotalByPeriod(
    expenses.filter(expense => expense.category === category),
    period,
    referenceDate
  );
};

export const getBudgetProgress = (
  budget: Budget,
  expenses: Expense[],
  referenceDate: Date = new Date()
): { spent: number; remaining: number; percentage: number } => {
  const spent = calculateTotalByCategoryAndPeriod(
    expenses,
    budget.category,
    budget.period,
    referenceDate
  );
  const remaining = Math.max(0, budget.amount - spent);
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return { spent, remaining, percentage };
};

export const getSpendingByCategory = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
};

export const getAverageSpending = (expenses: Expense[], period: 'daily' | 'weekly' | 'monthly'): number => {
  if (expenses.length === 0) return 0;

  const total = calculateTotal(expenses);
  const days = expenses.length; // Simplified - could be more sophisticated
  return total / days;
};

export const getSpendingTrend = (
  expenses: Expense[],
  days: number = 30
): Array<{ date: string; amount: number }> => {
  const today = new Date();
  const trend: Record<string, number> = {};

  // Initialize last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    trend[dateKey] = 0;
  }

  // Sum expenses by date
  expenses.forEach(expense => {
    const dateKey = expense.date.split('T')[0];
    if (trend[dateKey] !== undefined) {
      trend[dateKey] += expense.amount;
    }
  });

  return Object.entries(trend)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

