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

// クイズ問題タイプ
export type QuestionType =
  | 'term-to-desc'      // 用語名 → 説明を選択
  | 'desc-to-term'      // 説明 → 用語名を選択
  | 'reading-to-term';  // 読み仮名 → 用語名を選択

// 選択肢
export interface QuizChoice {
  text: string;         // 選択肢のテキスト
  term_id: string;      // 対応する用語ID
}

// クイズ問題
export interface QuizQuestion {
  term_id: string;                // 正解の用語ID
  question_type: QuestionType;    // 問題タイプ
  question_text: string;          // 問題文
  choices: QuizChoice[];          // 選択肢（4つ）
  correct_index: number;          // 正解のインデックス (0-3)

  // 回答後に設定される
  user_answer_index?: number;     // ユーザーの回答インデックス
  is_correct?: boolean;           // 正誤
  answered_at?: Date;             // 回答時刻
  time_spent?: number;            // 回答にかかった時間（秒）
  quality?: 0 | 1 | 2 | 3 | 4 | 5;  // 記憶度（SRS用）
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
