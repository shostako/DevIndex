import { db } from './db';
import type { Term, Category } from '@/types/term';

// ----------------
// データベース初期化
// ----------------

interface TermsData {
  version: string;
  updated_at: string;
  terms: Term[];
  categories: Category[];
}

// 初期化フラグ（競合状態を防ぐ）
let isInitializing = false;

/**
 * terms.jsonからデータを読み込み、IndexedDBに投入
 */
export async function initializeDatabase(): Promise<void> {
  // 既に初期化中の場合はスキップ（競合状態を防ぐ）
  if (isInitializing) {
    console.log('Database initialization already in progress, skipping...');
    return;
  }

  try {
    isInitializing = true;

    // terms.jsonをフェッチ
    const response = await fetch('/terms.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch terms.json: ${response.statusText}`);
    }

    const data: TermsData = await response.json();

    // IndexedDBに一括投入（bulkPutで上書き可能にする）
    await db.terms.bulkPut(data.terms);

    console.log(`Database initialized: ${data.terms.length} terms loaded`);
    console.log(`Categories: ${data.categories.map(c => c.name).join(', ')}`);
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * ユーザー進捗の初期化
 * @param termId 用語ID
 */
export async function initializeUserProgress(termId: string): Promise<void> {
  // 既に進捗が存在する場合はスキップ
  const existing = await db.user_progress.get(termId);
  if (existing) return;

  // 初期進捗を作成
  await db.user_progress.add({
    term_id: termId,
    first_learned_at: new Date(),
    last_reviewed_at: new Date(),
    review_count: 0,
    quiz_correct: 0,
    quiz_total: 0,
    ease_factor: 2.5,        // SM-2アルゴリズムの初期値
    interval: 0,
    next_review: new Date(),
    mastery_level: 0,        // 未学習
  });
}

/**
 * すべての用語に対してユーザー進捗を初期化
 */
export async function initializeAllUserProgress(): Promise<void> {
  const terms = await db.terms.toArray();

  for (const term of terms) {
    await initializeUserProgress(term.id);
  }

  console.log(`Initialized progress for ${terms.length} terms`);
}
