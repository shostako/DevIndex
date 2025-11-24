'use client';

import type { Term } from '@/types/term';
import type { UserProgress } from '@/types/progress';
import { MASTERY_COLORS } from '@/types/progress';

interface TermTableProps {
  terms: Term[];
  progressMap: Map<string, UserProgress>;
  onSelectTerm: (term: Term) => void;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50',
  intermediate: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50',
  advanced: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50',
};

export function TermTable({ terms, progressMap, onSelectTerm }: TermTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              用語名
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              読み
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              カテゴリ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              難易度
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              習得度
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              正答率
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {terms.map((term) => {
            const progress = progressMap.get(term.id);
            const masteryLevel = progress?.mastery_level ?? 0;
            const correctRate = progress && progress.quiz_total > 0
              ? Math.round((progress.quiz_correct / progress.quiz_total) * 100)
              : null;

            return (
              <tr
                key={term.id}
                onClick={() => onSelectTerm(term)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                {/* 用語名 */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">{term.term}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{term.reading}</div>
                  {term.term_en && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{term.term_en}</div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {term.short_desc}
                  </div>
                </td>

                {/* 読み */}
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {term.reading}
                </td>

                {/* カテゴリ */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(term.category),
                      }}
                    />
                    {term.category}
                  </span>
                </td>

                {/* 難易度 */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      DIFFICULTY_COLORS[term.difficulty]
                    }`}
                  >
                    {DIFFICULTY_LABELS[term.difficulty]}
                  </span>
                </td>

                {/* 習得度 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full border-2 ${
                          level < masteryLevel
                            ? MASTERY_COLORS[masteryLevel as 0 | 1 | 2 | 3 | 4].replace('border-', 'bg-')
                            : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* 正答率 */}
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {correctRate !== null ? `${correctRate}%` : '--'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {terms.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          該当する用語が見つかりませんでした
        </div>
      )}
    </div>
  );
}

// カテゴリー色のマッピング
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Web': '#3B82F6',
    'Database': '#10B981',
    'プログラミング言語': '#F59E0B',
    'ツール': '#8B5CF6',
    'アーキテクチャ': '#EF4444',
  };
  return colors[category] || '#6B7280';
}
