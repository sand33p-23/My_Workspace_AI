import { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useExpenseFilters, ExpenseFilters } from '../hooks/useExpenseFilters';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseForm } from './ExpenseForm';
import { SearchBar } from './SearchBar';
import { calculateTotal } from '../utils/calculations';
import { formatCurrency } from '../utils/currencyUtils';
import './ExpenseList.css';

export function ExpenseList() {
  const { state } = useExpense();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({
    searchQuery: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    minAmount: 0,
    maxAmount: 0,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const filteredExpenses = useExpenseFilters(state.expenses, filters);
  const total = calculateTotal(filteredExpenses);

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h1>Expenses</h1>
        <button className="btn-add-expense" onClick={() => setShowForm(true)}>
          + Add Expense
        </button>
      </div>

      <SearchBar
        filters={filters}
        onFiltersChange={setFilters}
        categories={state.categories}
      />

      {filteredExpenses.length > 0 && (
        <div className="expense-summary">
          <span>Total: <strong>{formatCurrency(total, state.settings.currency)}</strong></span>
          <span>{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <p>{state.expenses.length === 0 ? 'No expenses yet. Add your first expense!' : 'No expenses match your filters.'}</p>
        </div>
      ) : (
        <div className="expense-list">
          {filteredExpenses.map(expense => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
      )}

      {showForm && (
        <ExpenseForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

