'use client';

import { useUIStore } from '@/lib/store';

const precisionOptions = [
  { value: 'strict' as const, label: '🎯 厳格', description: '正確な検索' },
  { value: 'balanced' as const, label: '⚖️ 標準', description: 'バランス型' },
  { value: 'loose' as const, label: '🔍 緩い', description: 'あいまい検索' },
];

export function SearchPrecisionControl() {
  const { searchPrecision, setSearchPrecision } = useUIStore();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="precision-select" className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
        精度:
      </label>
      <select
        id="precision-select"
        value={searchPrecision}
        onChange={(e) => setSearchPrecision(e.target.value as typeof searchPrecision)}
        className="w-full md:w-auto px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        title="検索精度を選択"
      >
        {precisionOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
