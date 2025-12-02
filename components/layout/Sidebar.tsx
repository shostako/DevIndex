'use client';

import { FilterContent } from './FilterContent';

interface SidebarProps {
  categories: Array<{ name: string; color: string }>;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function Sidebar({ categories, selectedCategory, onCategoryChange }: SidebarProps) {
  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-theme(spacing.16))] sticky top-16 overflow-y-auto">
      <FilterContent
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </aside>
  );
}
