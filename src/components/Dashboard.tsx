import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { calculateTotalByPeriod, getBudgetProgress, getSpendingTrend } from '../utils/calculations';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Dashboard.css';

export function Dashboard() {
  const { state } = useExpense();

  const todayTotal = calculateTotalByPeriod(state.expenses, 'daily');
  const weekTotal = calculateTotalByPeriod(state.expenses, 'weekly');
  const monthTotal = calculateTotalByPeriod(state.expenses, 'monthly');

  const recentExpenses = [...state.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const spendingTrend = getSpendingTrend(state.expenses, 30);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">Today</div>
          <div className="summary-value">{formatCurrency(todayTotal, state.settings.currency)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">This Week</div>
          <div className="summary-value">{formatCurrency(weekTotal, state.settings.currency)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">This Month</div>
          <div className="summary-value">{formatCurrency(monthTotal, state.settings.currency)}</div>
        </div>
      </div>

      {state.budgets.length > 0 && (
        <div className="budgets-section">
          <h2>Budget Progress</h2>
          <div className="budgets-grid">
            {state.budgets.map(budget => {
              const category = state.categories.find(cat => cat.id === budget.category);
              const progress = getBudgetProgress(budget, state.expenses);
              const isOverBudget = progress.percentage > 100;

              return (
                <div key={budget.id} className="budget-card-small">
                  <div className="budget-card-header">
                    <span className="budget-icon-small" style={{ backgroundColor: category?.color || '#ccc' }}>
                      {category?.icon || '📦'}
                    </span>
                    <div>
                      <div className="budget-category-name-small">{category?.name || budget.category}</div>
                      <div className="budget-period-small">{budget.period}</div>
                    </div>
                  </div>
                  <div className="budget-progress-small">
                    <div className="progress-bar-small">
                      <div
                        className={`progress-fill-small ${isOverBudget ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="progress-text-small">
                      {formatCurrency(progress.spent, state.settings.currency)} / {formatCurrency(budget.amount, state.settings.currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="charts-section">
        <div className="chart-container">
          <h2>Spending Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value, 'MM/dd')}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, state.settings.currency)}
                labelFormatter={(label) => formatDate(label, 'MM/dd/yyyy')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4ECDC4"
                strokeWidth={2}
                name="Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-expenses-section">
        <h2>Recent Expenses</h2>
        {recentExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          <div className="recent-expenses-list">
            {recentExpenses.map(expense => {
              const category = state.categories.find(cat => cat.id === expense.category);
              return (
                <div key={expense.id} className="recent-expense-item">
                  <div className="recent-expense-icon" style={{ backgroundColor: category?.color || '#ccc' }}>
                    {category?.icon || '📦'}
                  </div>
                  <div className="recent-expense-details">
                    <div className="recent-expense-description">{expense.description}</div>
                    <div className="recent-expense-meta">
                      {category?.name || expense.category} • {formatDate(expense.date)}
                    </div>
                  </div>
                  <div className="recent-expense-amount">
                    {formatCurrency(expense.amount, state.settings.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

