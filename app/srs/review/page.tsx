'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTermStore, useProgressStore } from '@/lib/store';
import { getReviewDueToday, updateSRSProgress } from '@/lib/srs';
import ReviewCard from '@/components/srs/ReviewCard';
import type { UserProgress } from '@/types/progress';

export default function SRSReviewPage() {
  const router = useRouter();
  const { terms } = useTermStore();
  const { progressMap, updateProgress } = useProgressStore();

  const [reviewList, setReviewList] = useState<UserProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // 今日復習すべき用語を取得
    const progressList = Array.from(progressMap.values());
    const dueToday = getReviewDueToday(progressList);

    if (dueToday.length === 0) {
      // 復習する用語がない場合、メイン画面に戻る
      alert('復習する用語がありません。');
      router.push('/srs');
      return;
    }

    setReviewList(dueToday);
  }, [progressMap, router]);

  // 記憶度評価を処理
  const handleRate = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (reviewList.length === 0) return;

    const currentProgress = reviewList[currentIndex];

    // SRSパラメータを更新
    const updates = updateSRSProgress(currentProgress, quality);
    await updateProgress(currentProgress.term_id, updates);

    // 完了数を増やす
    setCompletedCount(completedCount + 1);

    // 次のカードへ
    if (currentIndex < reviewList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 全て完了
      alert(`復習完了！ ${reviewList.length}個の用語を復習しました。`);
      router.push('/srs');
    }
  };

  // ローディング中
  if (reviewList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">復習を準備中...</div>
          <div className="text-gray-600">しばらくお待ちください</div>
        </div>
      </div>
    );
  }

  const currentProgress = reviewList[currentIndex];
  const currentTerm = terms.find(t => t.id === currentProgress.term_id);

  if (!currentTerm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-2xl font-bold mb-2">エラー</div>
          <div>用語データが見つかりません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">SRS復習モード</h1>
          <p className="text-gray-600 mt-2">
            記憶度を正直に評価して、効率的に復習しよう
          </p>
        </div>

        {/* 復習カード */}
        <ReviewCard
          term={currentTerm}
          currentIndex={currentIndex}
          totalCount={reviewList.length}
          onRate={handleRate}
        />

        {/* 中断ボタン */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (confirm('復習を中断しますか？進捗は保存されます。')) {
                router.push('/srs');
              }
            }}
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            復習を中断
          </button>
        </div>
      </div>
    </div>
  );
}
