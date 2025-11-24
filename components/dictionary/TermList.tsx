'use client';

import { useMemo } from 'react';
import type { Term } from '@/types/term';
import type { UserProgress } from '@/types/progress';
import { TermCard } from './TermCard';
import { TermTable } from './TermTable';
import { useUIStore } from '@/lib/store';

interface TermListProps {
  terms: Term[];
  progressMap?: Map<string, UserProgress>;
  onSelectTerm: (term: Term) => void;
}

// ソート関数
function sortTerms(terms: Term[], sortMode: string): Term[] {
  const sorted = [...terms];

  switch (sortMode) {
    case 'term-asc':
      return sorted.sort((a, b) => a.term.localeCompare(b.term));
    case 'reading-asc':
      return sorted.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
    case 'difficulty':
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
      return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category, 'ja'));
    case 'date-new':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'date-old':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    default:
      return sorted;
  }
}

export function TermList({ terms, progressMap, onSelectTerm }: TermListProps) {
  const { viewMode, sortMode } = useUIStore();

  // ソートされた用語リスト
  const sortedTerms = useMemo(() => sortTerms(terms, sortMode), [terms, sortMode]);

  if (terms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl text-gray-600">用語が見つかりませんでした</p>
        <p className="text-sm text-gray-500 mt-2">
          検索条件を変更するか、フィルタを解除してください
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 結果数 */}
      <div className="mb-4 text-sm text-gray-600">
        {terms.length}件の用語が見つかりました
      </div>

      {/* 表示切り替え */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTerms.map(term => (
            <TermCard
              key={term.id}
              term={term}
              progress={progressMap?.get(term.id)}
              onClick={() => onSelectTerm(term)}
            />
          ))}
        </div>
      ) : (
        <TermTable
          terms={sortedTerms}
          progressMap={progressMap || new Map()}
          onSelectTerm={onSelectTerm}
        />
      )}
    </div>
  );
}
