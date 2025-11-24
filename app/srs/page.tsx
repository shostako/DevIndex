'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/lib/store';
import { getReviewDueToday, calculateStats, groupByMasteryLevel } from '@/lib/srs';
import { MASTERY_LABELS, MASTERY_COLORS } from '@/types/progress';

export default function SRSPage() {
  const router = useRouter();
  const { progressMap } = useProgressStore();

  const [stats, setStats] = useState({
    totalTerms: 0,
    learnedTerms: 0,
    masteredTerms: 0,
    reviewDueToday: 0,
    averageEaseFactor: 0,
    averageInterval: 0,
  });

  const [masteryGroups, setMasteryGroups] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  useEffect(() => {
    const progressList = Array.from(progressMap.values());

    if (progressList.length === 0) return;

    // 統計を計算
    const calculatedStats = calculateStats(progressList);
    setStats(calculatedStats);

    // 習得レベル別にグループ化
    const grouped = groupByMasteryLevel(progressList);
    setMasteryGroups({
      0: grouped[0].length,
      1: grouped[1].length,
      2: grouped[2].length,
      3: grouped[3].length,
      4: grouped[4].length,
    });
  }, [progressMap]);

  const handleStartReview = () => {
    router.push('/srs/review');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SRSモード</h1>
          <p className="text-gray-600">
            間隔反復学習で効率的に記憶を定着させよう
          </p>
        </div>

        {/* 今日の復習 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {stats.reviewDueToday}
            </div>
            <div className="text-xl text-gray-600">今日の復習</div>
          </div>

          <button
            onClick={handleStartReview}
            disabled={stats.reviewDueToday === 0}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {stats.reviewDueToday > 0 ? '復習を開始' : '復習する用語がありません'}
          </button>
        </div>

        {/* 統計サマリー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">学習統計</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalTerms}
              </div>
              <div className="text-sm text-gray-600">総用語数</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.learnedTerms}
              </div>
              <div className="text-sm text-gray-600">学習済み</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.masteredTerms}
              </div>
              <div className="text-sm text-gray-600">習得済み</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.totalTerms > 0
                  ? ((stats.masteredTerms / stats.totalTerms) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">習得率</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {stats.averageEaseFactor.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">平均難易度係数</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-teal-600 mb-1">
                {stats.averageInterval.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">平均復習間隔（日）</div>
            </div>
          </div>
        </div>

        {/* 習得レベル別進捗 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">習得レベル別進捗</h2>
          <div className="space-y-3">
            {Object.entries(masteryGroups).map(([level, count]) => {
              const masteryLevel = parseInt(level) as 0 | 1 | 2 | 3 | 4;
              const percentage =
                stats.totalTerms > 0 ? (count / stats.totalTerms) * 100 : 0;

              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {MASTERY_LABELS[masteryLevel]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        masteryLevel === 0
                          ? 'bg-gray-400'
                          : masteryLevel === 1
                          ? 'bg-yellow-400'
                          : masteryLevel === 2
                          ? 'bg-blue-400'
                          : masteryLevel === 3
                          ? 'bg-green-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/quiz')}
            className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            クイズモードで学習
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            辞書に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
