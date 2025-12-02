'use client';

import { useTermStore } from '@/lib/store';

interface FilterContentProps {
  categories: Array<{ name: string; color: string }>;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onClose?: () => void;
}

export function FilterContent({
  categories,
  selectedCategory,
  onCategoryChange,
  onClose,
}: FilterContentProps) {
  const { terms } = useTermStore();

  const handleCategoryChange = (category: string | null) => {
    onCategoryChange(category);
    onClose?.();
  };

  return (
    <div className="p-4">
      {/* カテゴリーフィルタ */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          カテゴリー
        </h3>
        <div className="space-y-1">
          {/* すべて */}
          <button
            onClick={() => handleCategoryChange(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            すべて
          </button>

          {/* カテゴリー一覧 */}
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
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
      </div>

      {/* 統計情報 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          統計
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>全用語</span>
            <span className="font-semibold text-gray-900 dark:text-white">{terms.length}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>習得済み</span>
            <span className="font-semibold text-gray-900 dark:text-white">0</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>今日の復習</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
