'use client';

import { useEffect } from 'react';
import type { Term } from '@/types/term';
import type { UserProgress } from '@/types/progress';
import { MASTERY_LABELS } from '@/types/progress';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

interface TermDetailProps {
  term: Term;
  progress?: UserProgress;
  onClose: () => void;
}

export function TermDetail({ term, progress, onClose }: TermDetailProps) {
  // Escapeキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Markdown をHTMLに変換（サニタイズ）
  const renderMarkdown = (markdown: string) => {
    const rawHtml = marked(markdown) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return cleanHtml;
  };

  // シンタックスハイライト
  useEffect(() => {
    Prism.highlightAll();
  }, [term]);

  const correctRate = progress && progress.quiz_total > 0
    ? Math.round((progress.quiz_correct / progress.quiz_total) * 100)
    : null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* モーダル本体 */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{term.term}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{term.reading}</p>
              {term.term_en && (
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mt-1">{term.term_en}</p>
              )}
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-6 space-y-6">
            {/* メタ情報 */}
            <div className="flex flex-wrap gap-3">
              {/* カテゴリー */}
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {term.category}
              </span>

              {/* 難易度 */}
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium">
                {term.difficulty === 'beginner' && '初級'}
                {term.difficulty === 'intermediate' && '中級'}
                {term.difficulty === 'advanced' && '上級'}
              </span>

              {/* 習得レベル */}
              {progress && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  {MASTERY_LABELS[progress.mastery_level]}
                </span>
              )}
            </div>

            {/* 短い説明 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">概要</h3>
              <p className="text-gray-700 dark:text-gray-300">{term.short_desc}</p>
            </div>

            {/* 詳細説明（Markdown） */}
            {term.full_desc && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">詳細</h3>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(term.full_desc) }}
                />
              </div>
            )}

            {/* コード例 */}
            {term.code_example && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">コード例</h3>
                <pre className="rounded-lg overflow-x-auto bg-gray-900 dark:bg-gray-950 p-4">
                  <code className="language-javascript">{term.code_example}</code>
                </pre>
              </div>
            )}

            {/* タグ */}
            {term.tags && term.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {term.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Monday's Note（皮肉コメント） */}
            {term.sarcastic_note && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-l-4 border-purple-500 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">😏</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">
                      Monday&apos;s Note
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                      {term.sarcastic_note}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 学習履歴（ある場合） */}
            {progress && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">学習履歴</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">復習回数</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{progress.review_count}</div>
                  </div>
                  {correctRate !== null && (
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">正答率</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctRate}%</div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">習得レベル</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {MASTERY_LABELS[progress.mastery_level]}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">次回復習</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(progress.next_review).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* フッター（アクション） */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              閉じる
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled
            >
              クイズに追加（Phase 2で実装）
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
