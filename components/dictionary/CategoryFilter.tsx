'use client';

import type { Category } from '@/types/term';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      {/* すべて */}
      <button
        onClick={() => onChange(null)}
        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        すべて
      </button>

      {/* カテゴリー一覧 */}
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onChange(category.name)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedCategory === category.name
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </button>
      ))}
    </div>
  );
}
