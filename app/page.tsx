'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { FilterContent } from '@/components/layout/FilterContent';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { SearchBar } from '@/components/dictionary/SearchBar';
import { TermList } from '@/components/dictionary/TermList';
import { TermDetail } from '@/components/dictionary/TermDetail';
import { ViewToggle } from '@/components/dictionary/ViewToggle';
import { SortControl } from '@/components/dictionary/SortControl';
import { SearchPrecisionControl } from '@/components/dictionary/SearchPrecisionControl';
import { useTermStore } from '@/lib/store';
import { useProgressStore } from '@/lib/store';

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    filteredTerms,
    categories,
    selectedTerm,
    searchQuery,
    selectedCategory,
    isLoading,
    searchTerms,
    filterByCategory,
    selectTerm,
  } = useTermStore();

  const {
    progressMap,
    getStats,
  } = useProgressStore();

  // 統計情報
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <Header />

      {/* プログレスバー */}
      <ProgressBar
        masteredCount={stats.masteredTerms}
        totalCount={stats.totalTerms}
        reviewDueToday={stats.reviewDueToday}
        streakDays={0}
      />

      <div className="flex">
        {/* サイドバー (デスクトップのみ) */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={filterByCategory}
        />

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* 検索バー + コントロール */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={searchTerms}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 md:flex md:gap-2 md:justify-end">
                {/* フィルタボタン (モバイルのみ) */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="md:hidden px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>フィルタ</span>
                  {selectedCategory && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
                <SearchPrecisionControl />
                <SortControl />
                <ViewToggle />
              </div>
            </div>

            {/* 用語一覧 */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">検索中...</p>
              </div>
            ) : (
              <TermList
                terms={filteredTerms}
                progressMap={progressMap}
                onSelectTerm={selectTerm}
              />
            )}
          </div>
        </main>
      </div>

      {/* モバイル用ボトムシート */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="フィルタ"
      >
        <FilterContent
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={filterByCategory}
          onClose={() => setIsFilterOpen(false)}
        />
      </BottomSheet>

      {/* 用語詳細モーダル */}
      {selectedTerm && (
        <TermDetail
          term={selectedTerm}
          progress={progressMap.get(selectedTerm.id)}
          onClose={() => selectTerm(null)}
        />
      )}
    </div>
  );
}
