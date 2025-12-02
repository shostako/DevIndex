'use client';

import { useState } from 'react';
import type { QuizQuestion, QuizChoice } from '@/types/quiz';
import type { Term } from '@/types/term';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  term: Term;
  onAnswer: (answerIndex: number) => void;
  onNext: () => void;
}

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  term,
  onAnswer,
  onNext,
}: QuizCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleChoiceClick = (index: number) => {
    if (isFlipped) return;

    setSelectedIndex(index);
    onAnswer(index);

    setTimeout(() => {
      setIsFlipped(true);
    }, 300);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedIndex(null);
    onNext();
  };

  const isCorrect = selectedIndex === question.correct_index;

  return (
    <div className="perspective-container">
      <div className={`quiz-card ${isFlipped ? 'flipped' : ''}`}>
        {/* 表面: 問題と選択肢 */}
        <div className="card-face card-front">
          <div className="p-4 sm:p-6 md:p-8">
            {/* ヘッダー: 進捗 */}
            <div className="mb-4 sm:mb-6 text-center">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                問題 {questionNumber} / {totalQuestions}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* 問題文 */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center">
                {question.question_text}
              </h2>
            </div>

            {/* 選択肢 */}
            <div className="space-y-2 sm:space-y-3">
              {question.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceClick(index)}
                  disabled={selectedIndex !== null}
                  className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-all ${
                    selectedIndex === index
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${selectedIndex !== null ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm font-medium mr-2 sm:mr-3 text-gray-900 dark:text-white">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white">{choice.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 裏面: 結果と解説 */}
        <div className="card-face card-back">
          <div className="p-4 sm:p-6 md:p-8">
            {/* 結果表示 */}
            <div className="mb-4 sm:mb-6 text-center">
              {isCorrect ? (
                <div className="text-green-600 dark:text-green-400">
                  <div className="text-4xl sm:text-6xl mb-2">✓</div>
                  <div className="text-xl sm:text-2xl font-bold">正解!</div>
                </div>
              ) : (
                <div className="text-red-600 dark:text-red-400">
                  <div className="text-4xl sm:text-6xl mb-2">✗</div>
                  <div className="text-xl sm:text-2xl font-bold">不正解</div>
                </div>
              )}
            </div>

            {/* 正解の選択肢 */}
            <div className="mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">正解</div>
              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-500 rounded-lg">
                <div className="flex items-center">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-green-500 text-white rounded-full text-xs sm:text-sm font-medium mr-2 sm:mr-3">
                    {String.fromCharCode(65 + question.correct_index)}
                  </span>
                  <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                    {question.choices[question.correct_index].text}
                  </span>
                </div>
              </div>
            </div>

            {/* 解説 */}
            <div className="mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">解説</div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2">{term.term}</div>
                <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{term.short_desc}</div>
              </div>
            </div>

            {/* 次へボタン */}
            <button
              onClick={handleNext}
              className="w-full py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              次へ
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .quiz-card {
          position: relative;
          width: 100%;
          min-height: 380px;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }

        @media (min-width: 640px) {
          .quiz-card {
            min-height: 450px;
          }
        }

        @media (min-width: 768px) {
          .quiz-card {
            min-height: 500px;
          }
        }

        .quiz-card.flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
          background: rgb(var(--background-rgb));
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .card-face {
          background: rgb(31, 41, 55);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
