import { Expense } from '../types';
import { formatCurrency } from './currencyUtils';
import { formatDate } from './dateUtils';

export const exportToCSV = (expenses: Expense[], currency: string = 'USD'): void => {
  const headers = ['Date', 'Amount', 'Description', 'Category', 'Tags'];
  const rows = expenses.map(expense => [
    formatDate(expense.date),
    formatCurrency(expense.amount, currency),
    expense.description,
    expense.category,
    expense.tags.join(', '),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (expenses: Expense[]): void => {
  const jsonContent = JSON.stringify(expenses, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

