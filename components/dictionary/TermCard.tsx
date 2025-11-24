'use client';

import type { Term } from '@/types/term';
import type { UserProgress } from '@/types/progress';
import { MASTERY_COLORS } from '@/types/progress';

interface TermCardProps {
  term: Term;
  progress?: UserProgress;
  onClick: () => void;
}

export function TermCard({ term, progress, onClick }: TermCardProps) {
  const masteryLevel = progress?.mastery_level ?? 0;
  const masteryColor = MASTERY_COLORS[masteryLevel];
  const correctRate = progress && progress.quiz_total > 0
    ? Math.round((progress.quiz_correct / progress.quiz_total) * 100)
    : null;

  // 難易度バッジの色
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-2 rounded-lg cursor-pointer
        hover:shadow-lg hover:scale-105
        transition-all duration-200
        ${masteryColor}
      `}
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{term.term}</h3>
          <p className="text-xs text-gray-600">{term.reading}</p>
          {term.term_en && (
            <p className="text-sm text-gray-500 font-medium">{term.term_en}</p>
          )}
        </div>

        {/* 難易度バッジ */}
        <span className={`px-2 py-1 text-xs font-semibold rounded ${difficultyColors[term.difficulty]}`}>
          {term.difficulty === 'beginner' && '初級'}
          {term.difficulty === 'intermediate' && '中級'}
          {term.difficulty === 'advanced' && '上級'}
        </span>
      </div>

      {/* 短い説明 */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{term.short_desc}</p>

      {/* フッター */}
      <div className="flex items-center justify-between text-xs">
        {/* カテゴリー */}
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
          {term.category}
        </span>

        {/* 正答率（ある場合） */}
        {correctRate !== null && (
          <span className="text-gray-600">
            正答率: {correctRate}%
          </span>
        )}
      </div>

      {/* タグ */}
      {term.tags && term.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {term.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
