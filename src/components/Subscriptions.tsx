import React, { useState } from 'react';
import { Subscription } from '../types';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { addMonths, addYears, parseISO } from 'date-fns';
import './Subscriptions.css';

const OTT_SUBSCRIPTIONS = [
  { name: 'Netflix', icon: '🎬', color: '#E50914', monthlyPrice: 649, yearlyPrice: 7799 },
  { name: 'Disney+ Hotstar', icon: '🏰', color: '#1E3A8A', monthlyPrice: 299, yearlyPrice: 1499 },
  { name: 'Amazon Prime', icon: '📦', color: '#FF9900', monthlyPrice: 179, yearlyPrice: 1499 },
  { name: 'YouTube Premium', icon: '▶️', color: '#FF0000', monthlyPrice: 129, yearlyPrice: 1290 },
  { name: 'Spotify', icon: '🎵', color: '#1DB954', monthlyPrice: 119, yearlyPrice: 1189 },
  { name: 'Apple Music', icon: '🍎', color: '#FA243C', monthlyPrice: 99, yearlyPrice: 999 },
  { name: 'Zee5', icon: '📺', color: '#FF6B00', monthlyPrice: 99, yearlyPrice: 999 },
  { name: 'SonyLIV', icon: '📡', color: '#0066CC', monthlyPrice: 299, yearlyPrice: 999 },
  { name: 'Voot', icon: '🎥', color: '#FF6B35', monthlyPrice: 99, yearlyPrice: 499 },
  { name: 'JioCinema', icon: '📱', color: '#FF6B00', monthlyPrice: 0, yearlyPrice: 0 },
];

export function Subscriptions() {
  const { state, dispatch } = useExpense();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    amount: 0,
    category: state.categories.find(c => c.name === 'Entertainment')?.id || state.categories[0]?.id || '',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const handleQuickAdd = (ott: typeof OTT_SUBSCRIPTIONS[0], cycle: 'monthly' | 'yearly') => {
    const amount = cycle === 'monthly' ? ott.monthlyPrice : ott.yearlyPrice;
    const startDate = new Date();
    const nextBillingDate = cycle === 'monthly' 
      ? addMonths(startDate, 1)
      : addYears(startDate, 1);

    const subscription: Subscription = {
      id: `sub-${Date.now()}-${Math.random()}`,
      name: ott.name,
      amount,
      category: state.categories.find(c => c.name === 'Entertainment')?.id || state.categories[0]?.id || '',
      billingCycle: cycle,
      startDate: startDate.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
      icon: ott.icon,
      color: ott.color,
      isActive: true,
    };

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: subscription });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.amount || formData.amount <= 0) return;

    const startDate = new Date(formData.startDate || new Date());
    const nextBillingDate = formData.billingCycle === 'monthly'
      ? addMonths(startDate, 1)
      : addYears(startDate, 1);

    const subscription: Subscription = {
      id: editingId || `sub-${Date.now()}`,
      name: formData.name.trim(),
      amount: formData.amount,
      category: formData.category || state.categories[0]?.id || '',
      billingCycle: formData.billingCycle || 'monthly',
      startDate: startDate.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
      icon: formData.icon,
      color: formData.color,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    };

    if (editingId) {
      dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: subscription });
      setEditingId(null);
    } else {
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: subscription });
      setIsAdding(false);
    }

    setFormData({
      name: '',
      amount: 0,
      category: state.categories[0]?.id || '',
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setFormData({
      ...subscription,
      startDate: subscription.startDate.split('T')[0],
      nextBillingDate: subscription.nextBillingDate.split('T')[0],
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
    }
  };

  const handleToggle = (id: string) => {
    dispatch({ type: 'TOGGLE_SUBSCRIPTION', payload: id });
  };

  const totalMonthly = state.subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => {
      const monthlyAmount = sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12;
      return sum + monthlyAmount;
    }, 0);

  const totalYearly = totalMonthly * 12;

  return (
    <div className="subscriptions">
      <div className="subscriptions-header">
        <div>
          <h2>Subscriptions</h2>
          <div className="subscription-totals">
            <div className="total-card">
              <span className="total-label">Monthly Total</span>
              <span className="total-value">{formatCurrency(totalMonthly, state.settings.currency)}</span>
            </div>
            <div className="total-card">
              <span className="total-label">Yearly Total</span>
              <span className="total-value">{formatCurrency(totalYearly, state.settings.currency)}</span>
            </div>
          </div>
        </div>
        {!isAdding && (
          <button className="btn-add" onClick={() => setIsAdding(true)}>
            + Add Subscription
          </button>
        )}
      </div>

      {isAdding && (
        <form className="subscription-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Netflix"
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
            <label>Billing Cycle</label>
            <select
              value={formData.billingCycle || 'monthly'}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
              required
            >
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
          <div className="form-actions">
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add'} Subscription
            </button>
          </div>
        </form>
      )}

      {!isAdding && (
        <div className="quick-add-section">
          <h3>Quick Add Popular OTT Services</h3>
          <div className="ott-grid">
            {OTT_SUBSCRIPTIONS.map(ott => (
              <div key={ott.name} className="ott-card">
                <div className="ott-icon" style={{ backgroundColor: ott.color }}>
                  {ott.icon}
                </div>
                <div className="ott-name">{ott.name}</div>
                <div className="ott-prices">
                  <button
                    className="ott-btn"
                    onClick={() => handleQuickAdd(ott, 'monthly')}
                    disabled={ott.monthlyPrice === 0}
                  >
                    ₹{ott.monthlyPrice}/mo
                  </button>
                  {ott.yearlyPrice > 0 && (
                    <button
                      className="ott-btn"
                      onClick={() => handleQuickAdd(ott, 'yearly')}
                    >
                      ₹{ott.yearlyPrice}/yr
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="subscriptions-list">
        {state.subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscriptions yet. Add your first subscription!</p>
          </div>
        ) : (
          state.subscriptions.map(subscription => {
            const category = state.categories.find(cat => cat.id === subscription.category);
            const daysUntilBilling = Math.ceil(
              (parseISO(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={subscription.id} className={`subscription-card ${!subscription.isActive ? 'inactive' : ''}`}>
                <div className="subscription-main">
                  <div
                    className="subscription-icon"
                    style={{ backgroundColor: subscription.color || category?.color || '#ccc' }}
                  >
                    {subscription.icon || category?.icon || '📺'}
                  </div>
                  <div className="subscription-details">
                    <div className="subscription-name-row">
                      <div className="subscription-name">{subscription.name}</div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={subscription.isActive}
                          onChange={() => handleToggle(subscription.id)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="subscription-meta">
                      <span className="subscription-amount">
                        {formatCurrency(subscription.amount, state.settings.currency)}
                        <span className="billing-cycle">/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </span>
                      <span className="subscription-category">{category?.name || subscription.category}</span>
                    </div>
                    <div className="subscription-dates">
                      <span>Next billing: {formatDate(subscription.nextBillingDate)}</span>
                      <span className={`days-until ${daysUntilBilling <= 7 ? 'soon' : ''}`}>
                        {daysUntilBilling > 0 ? `${daysUntilBilling} days left` : 'Due today'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="subscription-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(subscription)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(subscription.id)}
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

