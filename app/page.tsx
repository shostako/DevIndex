'use client';

import { useEffect, useState } from 'react';
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
import { initializeDatabase } from '@/lib/db-init';

export default function Home() {
  const {
    filteredTerms,
    categories,
    selectedTerm,
    searchQuery,
    selectedCategory,
    isInitialized,
    isLoading,
    loadTerms,
    searchTerms,
    filterByCategory,
    selectTerm,
  } = useTermStore();

  const {
    progressMap,
    loadProgress,
    getStats,
  } = useProgressStore();

  const [initError, setInitError] = useState<string | null>(null);

  // データベース初期化とデータロード
  useEffect(() => {
    const initialize = async () => {
      try {
        // データベース初期化
        await initializeDatabase();

        // 用語データをロード
        await loadTerms();

        // 進捗データをロード
        await loadProgress();
      } catch (error) {
        console.error('Initialization failed:', error);
        setInitError('データの初期化に失敗しました');
      }
    };

    initialize();
  }, [loadTerms, loadProgress]);

  // 統計情報
  const stats = getStats();

  // ロード中
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 dark:text-red-400">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

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
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* 検索バー + コントロール */}
            <div className="mb-6 flex gap-3">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={searchTerms}
                />
              </div>
              <SearchPrecisionControl />
              <SortControl />
              <ViewToggle />
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
