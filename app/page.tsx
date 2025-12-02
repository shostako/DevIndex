'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
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
        streakDays={0} // Phase 3で実装
      />

      <div className="flex">
        {/* サイドバー */}
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
              <div className="flex gap-2 justify-end">
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
