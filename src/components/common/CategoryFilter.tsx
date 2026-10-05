import React from 'react';
import { STANDARD_CATEGORIES } from '../../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  customCategory: string;
  onCustomCategoryChange: (custom: string) => void;
  allowAll?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  customCategory,
  onCustomCategoryChange,
  allowAll = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">Category</label>
      <select
        value={selectedCategory}
        onChange={e => onSelectCategory(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
      >
        {allowAll && <option value="All">All Categories</option>}
        {STANDARD_CATEGORIES.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* When Others is selected, show custom category input */}
      {selectedCategory === 'Others' && (
        <div className="pt-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Please specify your category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={e => onCustomCategoryChange(e.target.value)}
            placeholder="Enter your category (e.g. EWS, TFWS, PwD)"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};
