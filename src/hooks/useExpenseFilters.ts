import { useMemo } from 'react';
import { Expense } from '../types';
import { parseISO } from 'date-fns';

export interface ExpenseFilters {
  searchQuery: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  minAmount: number;
  maxAmount: number;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export const useExpenseFilters = (expenses: Expense[], filters: ExpenseFilters): Expense[] => {
  return useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        expense =>
          expense.description.toLowerCase().includes(query) ||
          expense.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = parseISO(filters.dateFrom);
      filtered = filtered.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return expenseDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = parseISO(filters.dateTo);
      filtered = filtered.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return expenseDate <= toDate;
      });
    }

    // Amount range filter
    if (filters.minAmount > 0) {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount);
    }

    if (filters.maxAmount > 0) {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = parseISO(a.date).getTime() - parseISO(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, filters]);
};

