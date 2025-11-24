'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTermStore } from '@/lib/store';
import { useProgressStore } from '@/lib/store';
import { completeQuizSession } from '@/lib/quiz';
import type { QuizSession } from '@/types/quiz';

export default function QuizResultPage() {
  const router = useRouter();
  const { terms } = useTermStore();
  const { updateProgress } = useProgressStore();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  useEffect(() => {
    // sessionStorageからセッションを取得
    const stored = sessionStorage.getItem('quiz-session');
    if (!stored) {
      router.push('/quiz');
      return;
    }

    const parsedSession = JSON.parse(stored) as QuizSession;
    const completedSession = completeQuizSession(parsedSession);
    setSession(completedSession);

    // 進捗データを更新
    updateProgressData(completedSession);

    // sessionStorageをクリア
    sessionStorage.removeItem('quiz-session');
  }, [router]);

  // 進捗データを更新
  const updateProgressData = async (session: QuizSession) => {
    setIsUpdatingProgress(true);

    try {
      for (const question of session.questions) {
        if (!question.is_correct || question.user_answer_index === undefined) continue;

        const termId = question.term_id;

        // 既存の進捗を取得
        const existing = useProgressStore.getState().getProgress(termId);

        // クイズ成績を更新
        const updates = {
          last_reviewed_at: new Date(),
          quiz_correct: (existing?.quiz_correct || 0) + (question.is_correct ? 1 : 0),
          quiz_total: (existing?.quiz_total || 0) + 1,
        };

        await updateProgress(termId, updates);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">結果を集計中...</div>
          <div className="text-gray-600">しばらくお待ちください</div>
        </div>
      </div>
    );
  }

  const { score, questions } = session;
  const accuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;
  const avgTime = questions.reduce((sum, q) => sum + (q.time_spent || 0), 0) / questions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">クイズ結果</h1>
          <p className="text-gray-600">
            {session.mode === 'random' && '全用語からランダム出題'}
            {session.mode === 'category' && `カテゴリ: ${session.category}`}
            {session.mode === 'weakness' && '苦手な用語を優先'}
          </p>
        </div>

        {/* スコアサマリー */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {score.correct} / {score.total}
            </div>
            <div className="text-xl text-gray-600">正解数</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">正答率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {avgTime.toFixed(1)}秒
              </div>
              <div className="text-sm text-gray-600">平均回答時間</div>
            </div>
          </div>
        </div>

        {/* 問題ごとの詳細 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">問題詳細</h2>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const term = terms.find(t => t.id === question.term_id);
              if (!term) return null;

              return (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg ${
                    question.is_correct
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm text-gray-600 mr-2">問題 {index + 1}</span>
                        <span
                          className={`text-lg font-bold ${
                            question.is_correct ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {question.is_correct ? '✓ 正解' : '✗ 不正解'}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">{term.term}</div>
                      <div className="text-sm text-gray-600">{term.short_desc}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">
                        {question.time_spent?.toFixed(1)}秒
                      </div>
                    </div>
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
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            もう一度クイズをする
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            辞書に戻る
          </button>
        </div>

        {/* 進捗更新中の表示 */}
        {isUpdatingProgress && (
          <div className="mt-4 text-center text-sm text-gray-500">
            進捗データを更新しています...
          </div>
        )}
      </div>
    </div>
  );
}
