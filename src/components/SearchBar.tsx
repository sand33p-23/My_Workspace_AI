import React, { useState } from 'react';
import { ExpenseFilters } from '../hooks/useExpenseFilters';
import './SearchBar.css';

interface SearchBarProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  categories: Array<{ id: string; name: string }>;
}

export function SearchBar({ filters, onFiltersChange, categories }: SearchBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof ExpenseFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="search-bar">
      <div className="search-bar-main">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="search-input"
          />
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
          className="btn-toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Filters
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minAmount || ''}
                onChange={(e) => updateFilter('minAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="filter-group">
              <label>Max Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxAmount || ''}
                onChange={(e) => updateFilter('maxAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as 'date' | 'amount' | 'category')}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          <button
            className="btn-clear-filters"
            onClick={() => onFiltersChange({
              searchQuery: '',
              category: '',
              dateFrom: '',
              dateTo: '',
              minAmount: 0,
              maxAmount: 0,
              sortBy: 'date',
              sortOrder: 'desc',
            })}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

