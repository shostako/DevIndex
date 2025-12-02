'use client';

import { useUIStore } from '@/lib/store';

const sortOptions = [
  { value: 'term-asc' as const, label: '用語名 (A-Z)' },
  { value: 'reading-asc' as const, label: '読み仮名 (あ-ん)' },
  { value: 'difficulty' as const, label: '難易度' },
  { value: 'category' as const, label: 'カテゴリ' },
  { value: 'date-new' as const, label: '追加日 (新しい順)' },
  { value: 'date-old' as const, label: '追加日 (古い順)' },
];

export function SortControl() {
  const { sortMode, setSortMode } = useUIStore();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
        並び替え:
      </label>
      <select
        id="sort-select"
        value={sortMode}
        onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
