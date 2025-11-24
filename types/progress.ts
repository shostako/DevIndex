// ユーザー進捗（読み書き可能）
export interface UserProgress {
  term_id: string;           // 外部キー: Term.id

  // 学習履歴
  first_learned_at: Date;    // 初回学習日
  last_reviewed_at: Date;    // 最終復習日
  review_count: number;      // 復習回数

  // クイズ成績
  quiz_correct: number;      // 正解数
  quiz_total: number;        // 出題数

  // SRS（SM-2アルゴリズム）
  ease_factor: number;       // 難易度係数（初期値: 2.5）
  interval: number;          // 次回復習までの日数
  next_review: Date;         // 次回復習予定日

  // 習得レベル（0-4）
  mastery_level: 0 | 1 | 2 | 3 | 4;
  // 0: 未学習, 1: 認識, 2: 理解, 3: 定着, 4: 習得
}

// 習得レベルの色マッピング
export const MASTERY_COLORS = {
  0: 'border-gray-300',     // 未学習
  1: 'border-yellow-300',   // 認識
  2: 'border-blue-300',     // 理解
  3: 'border-green-300',    // 定着
  4: 'border-emerald-500',  // 習得
} as const;

// 習得レベルのラベル
export const MASTERY_LABELS = {
  0: '未学習',
  1: '認識',
  2: '理解',
  3: '定着',
  4: '習得',
} as const;
