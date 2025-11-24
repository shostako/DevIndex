import Fuse, { FuseResultMatch } from 'fuse.js';
import type { Term } from '@/types/term';

// ----------------
// 検索エンジン（Fuse.js）
// ----------------

export class TermSearchEngine {
  private fuse: Fuse<Term> | null = null;
  private terms: Term[] = [];

  /**
   * 検索エンジンを初期化
   * @param terms 用語リスト
   * @param threshold あいまい度（オプション、デフォルト: 0.3）
   */
  initialize(terms: Term[], threshold: number = 0.3) {
    this.terms = terms;
    this.fuse = new Fuse(terms, {
      keys: [
        { name: 'term', weight: 2.0 },         // 用語名は重み2倍
        { name: 'term_en', weight: 2.0 },      // 英語表記も重み2倍
        { name: 'reading', weight: 1.5 },      // 読み仮名は1.5倍
        { name: 'short_desc', weight: 1.0 },   // 短い説明は通常
        { name: 'full_desc', weight: 0.5 },    // 詳細説明は軽め
        { name: 'tags', weight: 1.5 },         // タグは1.5倍
      ],
      threshold,                   // 動的なthreshold値を使用
      includeScore: true,          // スコアを含める
      includeMatches: true,        // マッチ箇所を含める
      minMatchCharLength: 2,       // 最低2文字から検索
      ignoreLocation: true,        // 位置を無視（全体を検索）
      isCaseSensitive: false,      // 大文字小文字を区別しない（明示的）
      findAllMatches: true,        // すべてのマッチを検索
    });
  }

  /**
   * 検索実行（シンプル版）
   * @param query 検索クエリ
   * @returns マッチした用語リスト
   */
  search(query: string): Term[] {
    if (!query || query.trim().length < 2) {
      return this.terms;
    }

    if (!this.fuse) {
      console.warn('Search engine not initialized');
      return [];
    }

    const results = this.fuse.search(query);
    return results.map(r => r.item);
  }

  /**
   * 検索実行（ハイライト情報付き）
   * @param query 検索クエリ
   * @returns マッチした用語とハイライト情報
   */
  searchWithHighlight(query: string): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return this.terms.map(term => ({
        term,
        score: 0,
        matches: [],
      }));
    }

    if (!this.fuse) {
      console.warn('Search engine not initialized');
      return [];
    }

    const results = this.fuse.search(query);
    return results.map(r => ({
      term: r.item,
      score: r.score ?? 1,
      matches: extractMatches(r.matches ?? []),
    }));
  }

  /**
   * すべての用語を取得
   */
  getAllTerms(): Term[] {
    return this.terms;
  }
}

// ----------------
// 型定義
// ----------------

export interface SearchResult {
  term: Term;
  score: number;
  matches: MatchInfo[];
}

export interface MatchInfo {
  key: string;              // マッチしたフィールド名
  value: string;            // マッチした値
  indices: [number, number][]; // マッチ箇所のインデックス
}

// ----------------
// ユーティリティ関数
// ----------------

/**
 * Fuse.jsのマッチ情報を抽出
 */
function extractMatches(fuseMatches: readonly FuseResultMatch[]): MatchInfo[] {
  return fuseMatches.map(match => ({
    key: match.key ?? '',
    value: match.value ?? '',
    indices: match.indices as [number, number][],
  }));
}

/**
 * テキストにハイライトを適用
 * @param text 元のテキスト
 * @param indices ハイライトするインデックス配列
 * @returns ハイライト適用済みのHTML文字列（安全）
 */
export function highlightMatches(
  text: string,
  indices: [number, number][]
): string {
  if (!indices || indices.length === 0) {
    return escapeHtml(text);
  }

  let result = '';
  let lastIndex = 0;

  // インデックスをソート
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

  for (const [start, end] of sortedIndices) {
    // マッチ前の部分
    result += escapeHtml(text.slice(lastIndex, start));

    // マッチ部分（ハイライト）
    result += `<mark class="bg-yellow-200">${escapeHtml(text.slice(start, end + 1))}</mark>`;

    lastIndex = end + 1;
  }

  // 残りの部分
  result += escapeHtml(text.slice(lastIndex));

  return result;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ----------------
// シングルトンインスタンス
// ----------------

export const searchEngine = new TermSearchEngine();
