'use client';

import { useState } from 'react';
import type { Term } from '@/types/term';
import { QUALITY_LABELS } from '@/types/quiz';

interface ReviewCardProps {
  term: Term;
  currentIndex: number;
  totalCount: number;
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

export default function ReviewCard({
  term,
  currentIndex,
  totalCount,
  onRate,
}: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleShowAnswer = () => {
    setIsFlipped(true);
  };

  const handleRate = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    onRate(quality);
    setIsFlipped(false);
  };

  return (
    <div className="perspective-container">
      <div className={`review-card ${isFlipped ? 'flipped' : ''}`}>
        {/* 表面: 用語名 */}
        <div className="card-face card-front">
          <div className="p-4 sm:p-6 md:p-8">
            {/* ヘッダー: 進捗 */}
            <div className="mb-4 sm:mb-6 text-center">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                復習 {currentIndex + 1} / {totalCount}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {/* 用語名 */}
            <div className="mb-6 sm:mb-8">
              <div className="text-center mb-4">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">この用語を覚えていますか？</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {term.term}
                </h2>
                {term.reading && (
                  <div className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-2">
                    {term.reading}
                  </div>
                )}
              </div>
            </div>

            {/* 答えを見るボタン */}
            <button
              onClick={handleShowAnswer}
              className="w-full py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              答えを見る
            </button>
          </div>
        </div>

        {/* 裏面: 説明と記憶度評価 */}
        <div className="card-face card-back">
          <div className="p-4 sm:p-6 md:p-8">
            {/* 用語情報 */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{term.term}</h3>
              {term.reading && (
                <div className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">{term.reading}</div>
              )}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3 sm:mb-4">
                <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">{term.short_desc}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {term.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                  {term.difficulty === 'beginner' && '初級'}
                  {term.difficulty === 'intermediate' && '中級'}
                  {term.difficulty === 'advanced' && '上級'}
                </span>
              </div>
            </div>

            {/* 記憶度評価 */}
            <div className="mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 text-center">
                この用語をどのくらい覚えていましたか？
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {(Object.entries(QUALITY_LABELS) as [string, string][]).map(([quality, label]) => {
                  const q = parseInt(quality) as 0 | 1 | 2 | 3 | 4 | 5;
                  return (
                    <button
                      key={quality}
                      onClick={() => handleRate(q)}
                      className={`p-2 sm:p-3 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        q < 3
                          ? 'border-red-300 dark:border-red-600 hover:border-red-500'
                          : 'border-green-300 dark:border-green-600 hover:border-green-500'
                      }`}
                    >
                      <div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">{quality}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight">{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ヒント */}
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
              0-2: 忘れていた → すぐ復習 / 3-5: 覚えていた → 間隔を延ばす
            </div>
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

        .review-card {
          position: relative;
          width: 100%;
          min-height: 380px;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }

        @media (min-width: 640px) {
          .review-card {
            min-height: 450px;
          }
        }

        @media (min-width: 768px) {
          .review-card {
            min-height: 500px;
          }
        }

        .review-card.flipped {
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
