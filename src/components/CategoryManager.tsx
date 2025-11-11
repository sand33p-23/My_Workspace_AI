import React, { useState } from 'react';
import { Category } from '../types';
import { useExpense } from '../context/ExpenseContext';
import './CategoryManager.css';

const categoryIcons = ['🍔', '🚗', '🎬', '💳', '🛍️', '📦', '🏠', '🏥', '🎓', '💼', '🎮', '☕', '✈️', '🎁', '💰'];
const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#95A5A6', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739',
  '#52BE80', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C'
];

export function CategoryManager() {
  const { state, dispatch } = useExpense();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    color: categoryColors[0],
    icon: categoryIcons[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const categoryData: Category = {
      id: editingId || `category-${Date.now()}`,
      name: formData.name.trim(),
      color: formData.color || categoryColors[0],
      icon: formData.icon || categoryIcons[0],
    };

    if (editingId) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: categoryData });
      setEditingId(null);
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: categoryData });
      setIsAdding(false);
    }

    setFormData({ name: '', color: categoryColors[0], icon: categoryIcons[0] });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData(category);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone if the category is in use.')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', color: categoryColors[0], icon: categoryIcons[0] });
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <h2>Categories</h2>
        {!isAdding && (
          <button className="btn-add" onClick={() => setIsAdding(true)}>
            + Add Category
          </button>
        )}
      </div>

      {isAdding && (
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Category name"
              required
            />
          </div>
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-selector">
              {categoryIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-selector">
              {categoryColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add'} Category
            </button>
          </div>
        </form>
      )}

      <div className="categories-grid">
        {state.categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-preview" style={{ backgroundColor: category.color }}>
              <span className="category-icon">{category.icon}</span>
            </div>
            <div className="category-name">{category.name}</div>
            <div className="category-actions">
              <button
                className="btn-icon"
                onClick={() => handleEdit(category)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="btn-icon"
                onClick={() => handleDelete(category.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

