'use client';

import { useState } from 'react';
import { useTermStore } from '@/lib/store';

interface SidebarProps {
  categories: Array<{ name: string; color: string }>;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function Sidebar({ categories, selectedCategory, onCategoryChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { terms } = useTermStore();

  return (
    <>
      {/* モバイル用トグルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg"
        aria-label="サイドバーを開く"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* サイドバー */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full overflow-y-auto p-4 pt-20 lg:pt-4">
          {/* カテゴリーフィルタ */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              カテゴリー
            </h3>
            <div className="space-y-1">
              {/* すべて */}
              <button
                onClick={() => onCategoryChange(null)}
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
                  onClick={() => onCategoryChange(category.name)}
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
      </aside>

      {/* オーバーレイ（モバイル時） */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
