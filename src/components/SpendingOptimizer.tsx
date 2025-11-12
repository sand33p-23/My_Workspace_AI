import { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { calculateTotalByPeriod, getSpendingByCategory } from '../utils/calculations';
import { formatCurrency } from '../utils/currencyUtils';
import { getBudgetProgress } from '../utils/calculations';
import './SpendingOptimizer.css';

interface Suggestion {
  id: string;
  type: 'budget' | 'subscription' | 'category' | 'recurring' | 'general';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings?: number;
  action?: string;
}

export function SpendingOptimizer() {
  const { state } = useExpense();

  const suggestions = useMemo(() => {
    const suggestionsList: Suggestion[] = [];
    const monthTotal = calculateTotalByPeriod(state.expenses, 'monthly');
    const categorySpending = getSpendingByCategory(state.expenses);
    const activeSubscriptions = state.subscriptions.filter(sub => sub.isActive);
    const subscriptionMonthlyTotal = activeSubscriptions.reduce((sum, sub) => {
      return sum + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
    }, 0);

    // Budget-related suggestions
    state.budgets.forEach(budget => {
      const progress = getBudgetProgress(budget, state.expenses);
      if (progress.percentage > 100) {
        const overBudget = progress.spent - budget.amount;
        suggestionsList.push({
          id: `budget-over-${budget.id}`,
          type: 'budget',
          title: `Over Budget: ${state.categories.find(c => c.id === budget.category)?.name || budget.category}`,
          description: `You've exceeded your ${budget.period} budget by ${formatCurrency(overBudget, state.settings.currency)}. Consider reviewing expenses in this category.`,
          impact: overBudget > budget.amount * 0.5 ? 'high' : 'medium',
          savings: overBudget,
        });
      } else if (progress.percentage > 80) {
        suggestionsList.push({
          id: `budget-warning-${budget.id}`,
          type: 'budget',
          title: `Approaching Budget Limit: ${state.categories.find(c => c.id === budget.category)?.name || budget.category}`,
          description: `You've used ${progress.percentage.toFixed(1)}% of your ${budget.period} budget. Only ${formatCurrency(progress.remaining, state.settings.currency)} remaining.`,
          impact: 'medium',
        });
      }
    });

    // Subscription optimization suggestions
    if (activeSubscriptions.length > 0) {
      // Check for duplicate subscriptions
      const subscriptionGroups = activeSubscriptions.reduce((acc, sub) => {
        const key = sub.name.toLowerCase();
        if (!acc[key]) acc[key] = [];
        acc[key].push(sub);
        return acc;
      }, {} as Record<string, typeof activeSubscriptions>);

      Object.entries(subscriptionGroups).forEach(([name, subs]) => {
        if (subs.length > 1) {
          const totalMonthly = subs.reduce((sum, sub) => {
            return sum + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
          }, 0);
          suggestionsList.push({
            id: `duplicate-sub-${name}`,
            type: 'subscription',
            title: `Duplicate Subscriptions: ${subs[0].name}`,
            description: `You have ${subs.length} active subscriptions for ${subs[0].name}. Consider canceling duplicates to save ${formatCurrency(totalMonthly - (subs[0].billingCycle === 'monthly' ? subs[0].amount : subs[0].amount / 12), state.settings.currency)}/month.`,
            impact: 'high',
            savings: totalMonthly - (subs[0].billingCycle === 'monthly' ? subs[0].amount : subs[0].amount / 12),
          });
        }
      });

      // Yearly vs Monthly subscription savings
      activeSubscriptions.forEach(sub => {
        if (sub.billingCycle === 'monthly') {
          const yearlyEquivalent = sub.amount * 12;
          const potentialSavings = yearlyEquivalent * 0.15; // Assume 15% savings with yearly
          if (potentialSavings > 500) {
            suggestionsList.push({
              id: `yearly-save-${sub.id}`,
              type: 'subscription',
              title: `Switch to Yearly: ${sub.name}`,
              description: `Consider switching ${sub.name} to yearly billing. You could save approximately ${formatCurrency(potentialSavings, state.settings.currency)} per year.`,
              impact: 'medium',
              savings: potentialSavings,
            });
          }
        }
      });

      // High subscription spending
      if (subscriptionMonthlyTotal > monthTotal * 0.3) {
        suggestionsList.push({
          id: 'high-subscription-spending',
          type: 'subscription',
          title: 'High Subscription Spending',
          description: `Your subscriptions account for ${((subscriptionMonthlyTotal / monthTotal) * 100).toFixed(1)}% of monthly spending (${formatCurrency(subscriptionMonthlyTotal, state.settings.currency)}/month). Review and cancel unused subscriptions.`,
          impact: 'high',
          savings: subscriptionMonthlyTotal * 0.2, // Potential 20% savings
        });
      }
    }

    // Category spending analysis
    Object.entries(categorySpending).forEach(([categoryId, amount]) => {
      const category = state.categories.find(c => c.id === categoryId);
      const categoryPercentage = (amount / monthTotal) * 100;
      
      if (categoryPercentage > 40 && monthTotal > 10000) {
        suggestionsList.push({
          id: `category-high-${categoryId}`,
          type: 'category',
          title: `High Spending: ${category?.name || categoryId}`,
          description: `${category?.name || categoryId} accounts for ${categoryPercentage.toFixed(1)}% of your monthly spending. Consider setting a budget or reviewing expenses in this category.`,
          impact: 'medium',
        });
      }
    });

    // Recurring expenses review
    if (state.recurringExpenses.length > 5) {
      const recurringTotal = state.recurringExpenses.reduce((sum, re) => {
        const monthly = re.frequency === 'monthly' ? re.amount : 
                        re.frequency === 'weekly' ? re.amount * 4.33 :
                        re.frequency === 'daily' ? re.amount * 30 : re.amount / 12;
        return sum + monthly;
      }, 0);
      
      if (recurringTotal > monthTotal * 0.5) {
        suggestionsList.push({
          id: 'review-recurring',
          type: 'recurring',
          title: 'Review Recurring Expenses',
          description: `You have ${state.recurringExpenses.length} recurring expenses totaling ${formatCurrency(recurringTotal, state.settings.currency)}/month. Review them to identify any you no longer need.`,
          impact: 'medium',
        });
      }
    }

    // General spending tips
    if (monthTotal > 50000) {
      suggestionsList.push({
        id: 'general-high-spending',
        type: 'general',
        title: 'High Monthly Spending',
        description: `Your monthly spending is ${formatCurrency(monthTotal, state.settings.currency)}. Consider creating budgets for major categories to better control expenses.`,
        impact: 'medium',
      });
    }

    // No expenses tracked
    if (state.expenses.length === 0) {
      suggestionsList.push({
        id: 'start-tracking',
        type: 'general',
        title: 'Start Tracking Your Expenses',
        description: 'Begin tracking your expenses to get personalized spending insights and optimization suggestions.',
        impact: 'high',
      });
    }

    return suggestionsList.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }, [state]);

  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + (s.savings || 0), 0);

  return (
    <div className="spending-optimizer">
      <div className="optimizer-header">
        <div>
          <h2>💡 Spending Optimizer</h2>
          <p className="optimizer-subtitle">Get personalized suggestions to optimize your spending</p>
        </div>
        {totalPotentialSavings > 0 && (
          <div className="savings-summary">
            <div className="savings-label">Potential Monthly Savings</div>
            <div className="savings-value">{formatCurrency(totalPotentialSavings, state.settings.currency)}</div>
          </div>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>Great job!</h3>
          <p>Your spending looks optimized. Keep tracking your expenses to get more suggestions.</p>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className={`suggestion-card impact-${suggestion.impact}`}
            >
              <div className="suggestion-header">
                <div className="suggestion-icon">
                  {suggestion.type === 'budget' && '📊'}
                  {suggestion.type === 'subscription' && '📺'}
                  {suggestion.type === 'category' && '🏷️'}
                  {suggestion.type === 'recurring' && '🔄'}
                  {suggestion.type === 'general' && '💡'}
                </div>
                <div className="suggestion-content">
                  <h3 className="suggestion-title">{suggestion.title}</h3>
                  <p className="suggestion-description">{suggestion.description}</p>
                </div>
                {suggestion.savings && (
                  <div className="suggestion-savings">
                    <span className="savings-amount">
                      Save {formatCurrency(suggestion.savings, state.settings.currency)}/mo
                    </span>
                  </div>
                )}
              </div>
              <div className="suggestion-footer">
                <span className={`impact-badge impact-${suggestion.impact}`}>
                  {suggestion.impact === 'high' && '🔴 High Impact'}
                  {suggestion.impact === 'medium' && '🟡 Medium Impact'}
                  {suggestion.impact === 'low' && '🟢 Low Impact'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="optimizer-tips">
        <h3>💡 General Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📅</div>
            <h4>Review Regularly</h4>
            <p>Review your expenses weekly to catch unnecessary spending early.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Set Realistic Budgets</h4>
            <p>Create budgets based on your actual spending patterns, not ideal scenarios.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📺</div>
            <h4>Audit Subscriptions</h4>
            <p>Review subscriptions monthly and cancel services you don't use regularly.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔄</div>
            <h4>Track Everything</h4>
            <p>Record all expenses, even small ones, to get accurate spending insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

