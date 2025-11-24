// クイズセッション
export interface QuizSession {
  id: string;                // UUID
  mode: 'random' | 'category' | 'weakness';
  category?: string;         // modeがcategoryの場合
  difficulty?: string;       // 難易度フィルタ
  started_at: Date;
  completed_at?: Date;
  questions: QuizQuestion[];
  score: {
    correct: number;
    total: number;
  };
}

// クイズ問題
export interface QuizQuestion {
  term_id: string;
  answered_at: Date;
  is_correct: boolean;
  time_spent: number;        // 秒
  quality: 0 | 1 | 2 | 3 | 4 | 5;  // 記憶度（SRS用）
}

// 記憶度の評価基準
export const QUALITY_LABELS = {
  0: '完全に忘れた',
  1: 'かすかに覚えていた',
  2: '思い出すのに苦労した',
  3: '正解だが迷った',
  4: '正解・確信あり',
  5: '完璧',
} as const;

// 記憶度による復習間隔（日数）
export const QUALITY_INTERVALS = {
  0: 1,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
} as const;
