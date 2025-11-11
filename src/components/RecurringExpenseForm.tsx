import React, { useState } from 'react';
import { RecurringExpense } from '../types';
import { useExpense } from '../context/ExpenseContext';
import './RecurringExpenseForm.css';

export function RecurringExpenseForm() {
  const { state, dispatch } = useExpense();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RecurringExpense>>({
    description: '',
    amount: 0,
    category: state.categories[0]?.id || '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description?.trim() || !formData.amount || formData.amount <= 0 || !formData.category) return;

    const recurringData: RecurringExpense = {
      id: editingId || `recurring-${Date.now()}`,
      description: formData.description.trim(),
      amount: formData.amount,
      category: formData.category,
      frequency: formData.frequency || 'monthly',
      startDate: new Date(formData.startDate || new Date()).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };

    if (editingId) {
      dispatch({ type: 'UPDATE_RECURRING_EXPENSE', payload: recurringData });
      setEditingId(null);
    } else {
      dispatch({ type: 'ADD_RECURRING_EXPENSE', payload: recurringData });
      setIsAdding(false);
    }

    setFormData({
      description: '',
      amount: 0,
      category: state.categories[0]?.id || '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
  };

  const handleEdit = (recurring: RecurringExpense) => {
    setEditingId(recurring.id);
    setFormData({
      ...recurring,
      startDate: recurring.startDate.split('T')[0],
      endDate: recurring.endDate ? recurring.endDate.split('T')[0] : '',
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      dispatch({ type: 'DELETE_RECURRING_EXPENSE', payload: id });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      description: '',
      amount: 0,
      category: state.categories[0]?.id || '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
  };

  return (
    <div className="recurring-expense-form">
      <div className="recurring-expense-header">
        <h2>Recurring Expenses</h2>
        {!isAdding && (
          <button className="btn-add" onClick={() => setIsAdding(true)}>
            + Add Recurring Expense
          </button>
        )}
      </div>

      {isAdding && (
        <form className="recurring-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Netflix subscription"
              required
            />
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
            <label>Frequency</label>
            <select
              value={formData.frequency || 'monthly'}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' })}
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
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
          <div className="form-group">
            <label>End Date (optional)</label>
            <input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <small>Leave empty for no end date</small>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add'} Recurring Expense
            </button>
          </div>
        </form>
      )}

      <div className="recurring-expenses-list">
        {state.recurringExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No recurring expenses set. Add one to automatically generate expenses!</p>
          </div>
        ) : (
          state.recurringExpenses.map(recurring => {
            const category = state.categories.find(cat => cat.id === recurring.category);

            return (
              <div key={recurring.id} className="recurring-expense-card">
                <div className="recurring-expense-main">
                  <div className="recurring-category-icon" style={{ backgroundColor: category?.color || '#ccc' }}>
                    {category?.icon || '📦'}
                  </div>
                  <div className="recurring-details">
                    <div className="recurring-description">{recurring.description}</div>
                    <div className="recurring-meta">
                      <span className="recurring-amount">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: state.settings.currency,
                        }).format(recurring.amount)}
                      </span>
                      <span className="recurring-frequency">{recurring.frequency}</span>
                      <span className="recurring-category">{category?.name || recurring.category}</span>
                    </div>
                    <div className="recurring-dates">
                      <span>Starts: {new Date(recurring.startDate).toLocaleDateString()}</span>
                      {recurring.endDate && (
                        <span>Ends: {new Date(recurring.endDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="recurring-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(recurring)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(recurring.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

