import Dexie, { type Table } from 'dexie';
import type { Term } from '@/types/term';
import type { UserProgress } from '@/types/progress';
import type { QuizSession } from '@/types/quiz';

// ----------------
// Dexieデータベース定義
// ----------------

class DevIndexDB extends Dexie {
  // テーブル定義（型付き）
  terms!: Table<Term, string>;
  user_progress!: Table<UserProgress, string>;
  quiz_sessions!: Table<QuizSession, string>;

  constructor() {
    super('DevIndexDB');

    // スキーマ定義（バージョン1）
    this.version(1).stores({
      // terms: 用語テーブル（読み取り専用）
      // プライマリキー: id
      // インデックス: term, category, difficulty, tags（配列）
      terms: 'id, term, category, difficulty, *tags',

      // user_progress: ユーザー進捗テーブル（読み書き）
      // プライマリキー: term_id
      // インデックス: next_review（復習予定日でソート）, mastery_level（習得レベルでフィルタ）
      user_progress: 'term_id, next_review, mastery_level',

      // quiz_sessions: クイズセッションテーブル（読み書き）
      // プライマリキー: id
      // インデックス: started_at（日付でソート）, mode（モードでフィルタ）
      quiz_sessions: 'id, started_at, mode',
    });
  }
}

// データベースインスタンス（シングルトン）
export const db = new DevIndexDB();

// ----------------
// ユーティリティ関数
// ----------------

/**
 * データベースが初期化されているか確認
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const count = await db.terms.count();
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * データベースをリセット（開発用）
 */
export async function resetDatabase(): Promise<void> {
  await db.terms.clear();
  await db.user_progress.clear();
  await db.quiz_sessions.clear();
  console.log('Database reset complete');
}

/**
 * データベースの統計情報を取得
 */
export async function getDatabaseStats() {
  const [termsCount, progressCount, sessionsCount] = await Promise.all([
    db.terms.count(),
    db.user_progress.count(),
    db.quiz_sessions.count(),
  ]);

  return {
    termsCount,
    progressCount,
    sessionsCount,
  };
}
