import React, { useState } from 'react';
import { Budget } from '../types';
import { useExpense } from '../context/ExpenseContext';
import { getBudgetProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/currencyUtils';
import './BudgetManager.css';

export function BudgetManager() {
  const { state, dispatch } = useExpense();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Budget>>({
    category: state.categories[0]?.id || '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || formData.amount <= 0) return;

    const budgetData: Budget = {
      id: editingId || `budget-${Date.now()}`,
      category: formData.category,
      amount: formData.amount,
      period: formData.period || 'monthly',
      startDate: new Date(formData.startDate || new Date()).toISOString(),
    };

    if (editingId) {
      dispatch({ type: 'UPDATE_BUDGET', payload: budgetData });
      setEditingId(null);
    } else {
      dispatch({ type: 'SET_BUDGET', payload: budgetData });
      setIsAdding(false);
    }

    setFormData({
      category: state.categories[0]?.id || '',
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setFormData({
      ...budget,
      startDate: budget.startDate.split('T')[0],
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      dispatch({ type: 'DELETE_BUDGET', payload: id });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      category: state.categories[0]?.id || '',
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="budget-manager">
      <div className="budget-manager-header">
        <h2>Budgets</h2>
        {!isAdding && (
          <button className="btn-add" onClick={() => setIsAdding(true)}>
            + Add Budget
          </button>
        )}
      </div>

      {isAdding && (
        <form className="budget-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {state.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label>Period</label>
            <select
              value={formData.period || 'monthly'}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as 'daily' | 'weekly' | 'monthly' })}
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add'} Budget
            </button>
          </div>
        </form>
      )}

      <div className="budgets-list">
        {state.budgets.length === 0 ? (
          <div className="empty-state">
            <p>No budgets set. Create a budget to track your spending!</p>
          </div>
        ) : (
          state.budgets.map(budget => {
            const category = state.categories.find(cat => cat.id === budget.category);
            const progress = getBudgetProgress(budget, state.expenses);
            const isOverBudget = progress.percentage > 100;

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-header">
                  <div className="budget-category">
                    <span className="budget-icon" style={{ backgroundColor: category?.color || '#ccc' }}>
                      {category?.icon || '📦'}
                    </span>
                    <div>
                      <div className="budget-category-name">{category?.name || budget.category}</div>
                      <div className="budget-period">{budget.period} budget</div>
                    </div>
                  </div>
                  <div className="budget-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(budget)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(budget.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="budget-amounts">
                  <div className="budget-amount">
                    <span className="label">Budget:</span>
                    <span>{formatCurrency(budget.amount, state.settings.currency)}</span>
                  </div>
                  <div className={`budget-spent ${isOverBudget ? 'over-budget' : ''}`}>
                    <span className="label">Spent:</span>
                    <span>{formatCurrency(progress.spent, state.settings.currency)}</span>
                  </div>
                  <div className="budget-remaining">
                    <span className="label">Remaining:</span>
                    <span>{formatCurrency(progress.remaining, state.settings.currency)}</span>
                  </div>
                </div>
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                      style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {progress.percentage.toFixed(1)}% {isOverBudget ? '(Over budget!)' : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

