'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTermStore } from '@/lib/store';
import { useProgressStore } from '@/lib/store';
import { generateQuizQuestions, createQuizSession, answerQuestion } from '@/lib/quiz';
import QuizCard from '@/components/quiz/QuizCard';
import type { QuizQuestion, QuizSession } from '@/types/quiz';
import type { GenerateQuizOptions } from '@/lib/quiz';

export default function QuizPlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { terms } = useTermStore();
  const { progressMap } = useProgressStore();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());

  // クイズセッションを初期化
  useEffect(() => {
    if (terms.length === 0) return;

    // URLパラメータからオプションを取得
    const mode = (searchParams.get('mode') as 'random' | 'category' | 'weakness') || 'random';
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const questionCount = parseInt(searchParams.get('count') || '10', 10);

    const options: GenerateQuizOptions = {
      mode,
      category,
      difficulty,
      questionCount,
      progressMap,
    };

    // クイズ問題を生成
    const questions = generateQuizQuestions(terms, options);

    if (questions.length === 0) {
      alert('条件に合う用語が見つかりませんでした。');
      router.push('/quiz');
      return;
    }

    // セッションを作成
    const newSession = createQuizSession(questions, options);
    setSession(newSession);
    setStartTime(new Date());
  }, [terms, searchParams, progressMap, router]);

  // 回答処理
  const handleAnswer = (answerIndex: number) => {
    if (!session) return;

    const currentQuestion = session.questions[currentIndex];
    const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;

    // 回答を記録
    const answeredQuestion = answerQuestion(currentQuestion, answerIndex, timeSpent);

    // セッションを更新
    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIndex] = answeredQuestion;

    setSession({
      ...session,
      questions: updatedQuestions,
    });
  };

  // 次の問題へ
  const handleNext = () => {
    if (!session) return;

    if (currentIndex < session.questions.length - 1) {
      // 次の問題へ
      setCurrentIndex(currentIndex + 1);
      setStartTime(new Date());
    } else {
      // 全問完了 - 結果画面へ遷移
      // セッションをlocalStorageに保存（または状態管理に保存）
      sessionStorage.setItem('quiz-session', JSON.stringify(session));
      router.push('/quiz/result');
    }
  };

  // ローディング中
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">クイズを準備中...</div>
          <div className="text-gray-600">しばらくお待ちください</div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const currentTerm = terms.find(t => t.id === currentQuestion.term_id);

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
          <h1 className="text-2xl font-bold text-gray-900">クイズモード</h1>
          <p className="text-gray-600 mt-2">
            {session.mode === 'random' && '全用語からランダム出題'}
            {session.mode === 'category' && `カテゴリ: ${session.category}`}
            {session.mode === 'weakness' && '苦手な用語を優先'}
          </p>
        </div>

        {/* クイズカード */}
        <QuizCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={session.questions.length}
          term={currentTerm}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />

        {/* 中断ボタン */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (confirm('クイズを中断しますか？進捗は保存されません。')) {
                router.push('/quiz');
              }
            }}
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            クイズを中断
          </button>
        </div>
      </div>
    </div>
  );
}
