// 用語（読み取り専用）
export interface Term {
  id: string;                // UUID
  term: string;              // 用語名
  term_en?: string;          // 英語表記（オプショナル）
  reading: string;           // 読み仮名
  category: string;          // カテゴリー
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  short_desc: string;        // 短い説明（100文字以内）
  full_desc: string;         // 詳細説明（Markdown）
  code_example?: string;     // コード例
  tags: string[];            // タグ配列
  created_at: string;        // ISO 8601形式
  sarcastic_notes?: string[];   // Monday風の皮肉コメント（複数）
}

// カテゴリー
export interface Category {
  name: string;
  color: string;             // 16進数カラーコード
}
