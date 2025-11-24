'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTermStore } from '@/lib/store';
import type { GenerateQuizOptions } from '@/lib/quiz';

export default function QuizSetupPage() {
  const router = useRouter();
  const { categories } = useTermStore();

  const [mode, setMode] = useState<'random' | 'category' | 'weakness'>('random');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);

  const handleStart = () => {
    const options: GenerateQuizOptions = {
      mode,
      questionCount,
    };

    if (mode === 'category' && category) {
      options.category = category;
    }

    if (difficulty) {
      options.difficulty = difficulty;
    }

    // クイズ実行ページに遷移（クエリパラメータで設定を渡す）
    const params = new URLSearchParams({
      mode,
      count: questionCount.toString(),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
    });

    router.push(`/quiz/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">クイズモード</h1>
          <p className="text-gray-600 dark:text-gray-400">
            選択式の問題で用語の理解度を確認しよう
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
          {/* モード選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              クイズモード
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="random"
                  checked={mode === 'random'}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">ランダム</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">全用語からランダムに出題</div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="category"
                  checked={mode === 'category'}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">カテゴリ別</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">特定のカテゴリから出題</div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="weakness"
                  checked={mode === 'weakness'}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">苦手克服</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">正答率が低い用語を優先</div>
                </div>
              </label>
            </div>
          </div>

          {/* カテゴリ選択（カテゴリ別モードの場合） */}
          {mode === 'category' && (
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                カテゴリ
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">カテゴリを選択</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 難易度選択（オプション） */}
          <div>
            <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              難易度（オプション）
            </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
            </select>
          </div>

          {/* 問題数選択 */}
          <div>
            <label htmlFor="count-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              問題数
            </label>
            <select
              id="count-select"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5問</option>
              <option value={10}>10問</option>
              <option value={20}>20問</option>
              <option value={30}>30問</option>
            </select>
          </div>

          {/* 開始ボタン */}
          <button
            onClick={handleStart}
            disabled={mode === 'category' && !category}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            クイズを開始
          </button>

          {/* 戻るボタン */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            辞書に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
