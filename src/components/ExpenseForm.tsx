import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { useExpense } from '../context/ExpenseContext';
import { parseCurrency } from '../utils/currencyUtils';
import './ExpenseForm.css';

interface ExpenseFormProps {
  expense?: Expense;
  onClose: () => void;
}

export function ExpenseForm({ expense, onClose }: ExpenseFormProps) {
  const { state, dispatch } = useExpense();
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [category, setCategory] = useState(expense?.category || state.categories[0]?.id || '');
  const [date, setDate] = useState(expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState(expense?.tags.join(', ') || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setCategory(expense.category);
      setDate(expense.date.split('T')[0]);
      setTags(expense.tags.join(', '));
    }
  }, [expense]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseCurrency(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const expenseData: Expense = {
      id: expense?.id || `expense-${Date.now()}`,
      amount: parseCurrency(amount),
      description: description.trim(),
      category,
      date: new Date(date).toISOString(),
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
    };

    if (expense) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expenseData });
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expenseData });
    }

    onClose();
  };

  return (
    <div className="expense-form-overlay" onClick={onClose}>
      <div className="expense-form" onClick={(e) => e.stopPropagation()}>
        <div className="expense-form-header">
          <h2>{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              rows={3}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={errors.category ? 'error' : ''}
            >
              {state.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="food, restaurant, lunch"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {expense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

