import React, { useState } from 'react';
import { Expense } from '../types';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { ExpenseForm } from './ExpenseForm';
import './ExpenseItem.css';

interface ExpenseItemProps {
  expense: Expense;
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const { state, dispatch } = useExpense();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const category = state.categories.find(cat => cat.id === expense.category);

  const handleDelete = () => {
    if (showConfirm) {
      dispatch({ type: 'DELETE_EXPENSE', payload: expense.id });
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <>
      <div className="expense-item">
        <div className="expense-item-main">
          <div className="expense-category-icon" style={{ backgroundColor: category?.color || '#ccc' }}>
            {category?.icon || '📦'}
          </div>
          <div className="expense-details">
            <div className="expense-description">{expense.description}</div>
            <div className="expense-meta">
              <span className="expense-category">{category?.name || expense.category}</span>
              <span className="expense-date">{formatDate(expense.date)}</span>
              {expense.tags.length > 0 && (
                <div className="expense-tags">
                  {expense.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="expense-amount">
            {formatCurrency(expense.amount, state.settings.currency)}
          </div>
        </div>
        <div className="expense-actions">
          <button
            className="btn-icon"
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className={`btn-icon ${showConfirm ? 'confirm' : ''}`}
            onClick={handleDelete}
            title={showConfirm ? 'Click again to confirm' : 'Delete'}
          >
            {showConfirm ? '✓' : '🗑️'}
          </button>
        </div>
      </div>
      {isEditing && (
        <ExpenseForm
          expense={expense}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}

