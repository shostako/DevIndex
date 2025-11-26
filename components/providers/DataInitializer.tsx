'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useTermStore, useProgressStore } from '@/lib/store';
import { initializeDatabase } from '@/lib/db-init';

interface DataInitializerProps {
  children: ReactNode;
}

/**
 * グローバルデータ初期化コンポーネント
 * アプリ全体で一度だけデータベースとストアを初期化する
 */
export function DataInitializer({ children }: DataInitializerProps) {
  const { isInitialized, loadTerms } = useTermStore();
  const { loadProgress } = useProgressStore();
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // 既に初期化済み or 初期化中ならスキップ
    if (isInitialized || isInitializing) return;

    const initialize = async () => {
      setIsInitializing(true);
      try {
        // IndexedDBを初期化
        await initializeDatabase();

        // 用語データをロード
        await loadTerms();

        // 進捗データをロード
        await loadProgress();
      } catch (error) {
        console.error('Data initialization failed:', error);
        setInitError('データの初期化に失敗しました');
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [isInitialized, isInitializing, loadTerms, loadProgress]);

  // 初期化中
  if (!isInitialized && !initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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

  return <>{children}</>;
}
