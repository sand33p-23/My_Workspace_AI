import { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { getSpendingByCategory, getSpendingTrend, calculateTotal } from '../utils/calculations';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import './Reports.css';

export function Reports() {
  const { state } = useExpense();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');

  const filteredExpenses = useMemo(() => {
    if (dateRange === 'all') return state.expenses;
    
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return state.expenses.filter(expense => new Date(expense.date) >= cutoffDate);
  }, [state.expenses, dateRange]);

  const spendingByCategory = getSpendingByCategory(filteredExpenses);
  const totalSpending = calculateTotal(filteredExpenses);
  const spendingTrend = getSpendingTrend(filteredExpenses, parseInt(dateRange) || 30);

  const categoryData = Object.entries(spendingByCategory)
    .map(([category, amount]) => {
      const cat = state.categories.find(c => c.id === category);
      return {
        name: cat?.name || category,
        value: amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
        color: cat?.color || '#95A5A6',
      };
    })
    .sort((a, b) => b.value - a.value);

  const handleExportCSV = () => {
    exportToCSV(filteredExpenses, state.settings.currency);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredExpenses);
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>Reports</h1>
        <div className="reports-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7' | '30' | '90' | 'all')}
            className="date-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <div className="export-buttons">
            <button onClick={handleExportCSV} className="btn-export">
              Export CSV
            </button>
            <button onClick={handleExportJSON} className="btn-export">
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="reports-summary">
        <div className="summary-card-large">
          <div className="summary-label-large">Total Spending</div>
          <div className="summary-value-large">
            {formatCurrency(totalSpending, state.settings.currency)}
          </div>
          <div className="summary-count">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="reports-charts">
        {categoryData.length > 0 ? (
          <>
            <div className="chart-section">
              <h2>Spending by Category</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, state.settings.currency)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h2>Spending Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, state.settings.currency)}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString();
                    }}
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
          </>
        ) : (
          <div className="empty-state">
            <p>No expenses to display. Add some expenses to see reports!</p>
          </div>
        )}
      </div>

      {categoryData.length > 0 && (
        <div className="category-breakdown">
          <h2>Category Breakdown</h2>
          <div className="breakdown-table">
            <div className="table-header">
              <div>Category</div>
              <div>Amount</div>
              <div>Percentage</div>
            </div>
            {categoryData.map((item, index) => (
              <div key={index} className="table-row">
                <div className="category-cell">
                  <span
                    className="category-color-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </div>
                <div className="amount-cell">
                  {formatCurrency(item.value, state.settings.currency)}
                </div>
                <div className="percentage-cell">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

