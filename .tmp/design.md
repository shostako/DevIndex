# DevIndex - 技術設計書

**作成日**: 2025-11-24
**バージョン**: 2.0
**ベース**: `.tmp/requirements.md`

---

## 1. 技術スタック選択

### 1.1 選択基準（universal-project-launcher準拠）

#### プロジェクト特性の評価
- **アプリケーション種別**: Web（PWA）
- **規模**: 中規模（機能3モード、用語数〜1000）
- **ユーザーベース**: 個人利用中心、将来的に公開
- **パフォーマンス要件**: 高速（検索50ms以内）+ オフライン必須

#### 制約条件の分析
- **既知技術**: React, TypeScript, Node.js
- **学習予算**: 1週間以内（Next.js App Routerは新規）
- **完成目標**: Phase 1は2週間、全Phase完成は5週間
- **運用コスト**: 無料（静的ホスティング）

#### 優先順位
1. **UI/UX要件**: 速度・オフライン・直感性
2. **実装速度**: 早期MVP、段階的拡張
3. **保守性**: TypeScript strict、関数型設計
4. **学習価値**: Next.js App Routerの習得

### 1.2 採用技術スタック

#### フロントエンド
| 技術 | 選定理由 | 代替案との比較 |
|------|---------|---------------|
| **Next.js 14 (App Router)** | SSR/SSG + クライアントの融合、PWA対応容易 | Vite: バックエンド統合が弱い<br>CRA: 時代遅れ |
| **TypeScript (strict)** | 型安全性、IDE支援、保守性 | JavaScript: 型エラーリスク |
| **Tailwind CSS** | 高速UI開発、一貫性 | CSS Modules: 冗長<br>styled-components: ランタイムコスト |
| **Zustand** | 軽量（3KB）、シンプルAPI | Redux: オーバーキル<br>Context: パフォーマンス懸念 |

#### データ層
| 技術 | 選定理由 | 代替案との比較 |
|------|---------|---------------|
| **IndexedDB (Dexie.js)** | ブラウザ内永続化、大容量、オフライン | LocalStorage: 容量制限<br>SQLite WASM: 実験的 |
| **Fuse.js** | 軽量あいまい検索、高速 | Lunr.js: 複雑<br>自前実装: 品質懸念 |

#### PWA
| 技術 | 選定理由 | 代替案との比較 |
|------|---------|---------------|
| **next-pwa** | Next.js公式推奨、設定簡単 | Workbox: 手動設定が複雑 |
| **Web App Manifest** | インストール可能化 | - |

#### 開発ツール
| 技術 | 選定理由 |
|------|---------|
| **Vitest** | 高速、TypeScript統合良好 |
| **Testing Library** | ユーザー視点のテスト |
| **ESLint + Prettier** | コード品質・一貫性 |
| **Prism.js** | シンタックスハイライト |

### 1.3 不採用技術とその理由

#### バックエンド（FastAPI / Express）
- **理由**: 静的データはビルド時生成で十分、サーバー不要
- **将来拡張**: データ同期が必要になったらAPI追加

#### データベース（SQLite / PostgreSQL）
- **理由**: Webでのサーバー通信はオーバーヘッド、IndexedDBで完結
- **トレードオフ**: 複雑なクエリは自前実装

#### React Native / Electron
- **理由**: PWAでモバイル・デスクトップ対応可能
- **将来拡張**: ネイティブ機能が必要になったら検討

---

## 2. システムアーキテクチャ

### 2.1 全体構成

```
┌─────────────────────────────────────────┐
│          Browser / PWA                  │
├─────────────────────────────────────────┤
│  UI Layer (React Components)            │
│  ├── DictionaryView                    │
│  ├── QuizView                          │
│  └── SRSView                           │
├─────────────────────────────────────────┤
│  State Management (Zustand)             │
│  ├── termsStore                        │
│  ├── progressStore                     │
│  └── uiStore                           │
├─────────────────────────────────────────┤
│  Business Logic                         │
│  ├── searchEngine (Fuse.js)            │
│  ├── srsAlgorithm (SM-2)               │
│  └── quizGenerator                     │
├─────────────────────────────────────────┤
│  Data Layer (Dexie.js)                  │
│  ├── terms (read-only)                 │
│  ├── user_progress (read/write)        │
│  └── quiz_sessions (read/write)        │
└─────────────────────────────────────────┘
         ↓ 初回ロード
┌─────────────────────────────────────────┐
│  Static Assets (Vercel / GitHub Pages)  │
│  ├── terms.json                        │
│  ├── app bundle                        │
│  └── Service Worker                    │
└─────────────────────────────────────────┘
```

### 2.2 データフロー

#### 初回ロード時
```
1. Service Worker登録
2. terms.jsonフェッチ
3. IndexedDB初期化
   ├── terms テーブル作成
   ├── user_progress テーブル作成
   └── quiz_sessions テーブル作成
4. terms.json → IndexedDB投入
5. Fuse.js検索インデックス構築
6. アプリケーション起動
```

#### 検索時（辞書モード）
```
1. ユーザー入力
2. Zustand store更新
3. searchEngine.search() 実行
   └── Fuse.js でローカル検索（< 50ms）
4. 結果をReactコンポーネントに反映
5. 再レンダリング
```

#### クイズ実行時
```
1. クイズ設定（範囲・難易度）
2. quizGenerator.generate()
   ├── IndexedDBからterms取得
   ├── フィルタリング
   └── ランダム選択
3. 問題出題
4. ユーザー回答
5. user_progressに結果記録
   ├── 正答率更新
   ├── 習得レベル更新
   └── SRSパラメータ更新
```

#### SRS復習時
```
1. 今日の復習リスト取得
   └── user_progress WHERE next_review <= today
2. 復習実行（クイズと同様）
3. 評価（0-5）
4. srsAlgorithm.calculateNext()
   ├── Ease Factor更新
   ├── Interval計算
   └── next_review更新
5. user_progressに保存
```

---

## 3. データモデル

### 3.1 IndexedDBスキーマ（Dexie.js）

```typescript
import Dexie, { Table } from 'dexie';

// ----------------
// 型定義
// ----------------

// 用語（読み取り専用）
interface Term {
  id: string;                // UUID
  term: string;              // 用語名
  reading: string;           // 読み仮名
  category: string;          // カテゴリー
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  short_desc: string;        // 短い説明（100文字以内）
  full_desc: string;         // 詳細説明（Markdown）
  code_example?: string;     // コード例
  tags: string[];            // タグ配列
  created_at: string;        // ISO 8601形式
}

// ユーザー進捗（読み書き可能）
interface UserProgress {
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

  // 習得レベル
  mastery_level: 0 | 1 | 2 | 3 | 4;
  // 0: 未学習, 1: 認識, 2: 理解, 3: 定着, 4: 習得
}

// クイズセッション
interface QuizSession {
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

interface QuizQuestion {
  term_id: string;
  answered_at: Date;
  is_correct: boolean;
  time_spent: number;        // 秒
  quality: 0 | 1 | 2 | 3 | 4 | 5;  // 記憶度（SRS用）
}

// ----------------
// Dexieデータベース定義
// ----------------

class DevIndexDB extends Dexie {
  terms!: Table<Term, string>;
  user_progress!: Table<UserProgress, string>;
  quiz_sessions!: Table<QuizSession, string>;

  constructor() {
    super('DevIndexDB');

    this.version(1).stores({
      terms: 'id, term, category, difficulty, *tags',
      user_progress: 'term_id, next_review, mastery_level',
      quiz_sessions: 'id, started_at, mode',
    });
  }
}

export const db = new DevIndexDB();
```

### 3.2 データ初期化戦略

#### terms.json構造
```json
{
  "version": "1.0.0",
  "updated_at": "2025-11-24T00:00:00Z",
  "terms": [
    {
      "id": "uuid-1",
      "term": "REST API",
      "reading": "レストエーピーアイ",
      "category": "Web",
      "difficulty": "beginner",
      "short_desc": "HTTPプロトコルを使用したアーキテクチャスタイル",
      "full_desc": "## REST APIとは\n\nREpresentational State Transfer...",
      "code_example": "fetch('/api/users')\n  .then(res => res.json())",
      "tags": ["API", "HTTP", "アーキテクチャ"],
      "created_at": "2025-11-01T00:00:00Z"
    }
  ],
  "categories": [
    { "name": "Web", "color": "#3B82F6" },
    { "name": "Database", "color": "#10B981" }
  ]
}
```

#### 初期化フロー（`lib/db-init.ts`）
```typescript
export async function initializeDatabase(): Promise<void> {
  // 1. terms テーブルが空か確認
  const termCount = await db.terms.count();

  if (termCount === 0) {
    // 2. terms.jsonをフェッチ
    const response = await fetch('/terms.json');
    const data = await response.json();

    // 3. IndexedDBに一括投入
    await db.terms.bulkAdd(data.terms);

    console.log(`Initialized: ${data.terms.length} terms loaded`);
  }
}
```

---

## 4. コンポーネント設計

### 4.1 ディレクトリ構造

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # ルートレイアウト
│   ├── page.tsx                   # ホーム（辞書モード）
│   ├── quiz/
│   │   ├── page.tsx               # クイズモード
│   │   └── [sessionId]/
│   │       └── page.tsx           # クイズ実行画面
│   ├── srs/
│   │   ├── page.tsx               # SRSダッシュボード
│   │   └── review/page.tsx        # 復習実行画面
│   └── globals.css                # グローバルスタイル
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # ヘッダー（モード切替）
│   │   ├── Sidebar.tsx            # サイドバー（カテゴリ・統計）
│   │   └── ProgressBar.tsx        # プログレスバー
│   ├── dictionary/
│   │   ├── SearchBar.tsx          # 検索バー
│   │   ├── TermCard.tsx           # 用語カード
│   │   ├── TermList.tsx           # 用語一覧
│   │   ├── TermDetail.tsx         # 詳細モーダル
│   │   └── CategoryFilter.tsx     # カテゴリーフィルタ
│   ├── quiz/
│   │   ├── QuizSetup.tsx          # クイズ設定画面
│   │   ├── QuizCard.tsx           # 問題カード
│   │   ├── QuizResult.tsx         # 結果画面
│   │   └── QualityRating.tsx      # 記憶度評価（0-5）
│   ├── srs/
│   │   ├── ReviewCalendar.tsx     # 復習予定カレンダー
│   │   ├── StatsCard.tsx          # 統計カード
│   │   ├── MasteryChart.tsx       # 習得度グラフ
│   │   └── WeaknessTermList.tsx   # 苦手用語リスト
│   └── ui/                        # 汎用UIコンポーネント
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── Card.tsx
├── lib/
│   ├── db.ts                      # Dexie.js設定
│   ├── db-init.ts                 # DB初期化
│   ├── search.ts                  # 検索エンジン
│   ├── srs.ts                     # SRSアルゴリズム
│   ├── quiz.ts                    # クイズ生成ロジック
│   └── store.ts                   # Zustand store
├── types/
│   ├── term.ts                    # Term型定義
│   ├── progress.ts                # UserProgress型定義
│   └── quiz.ts                    # Quiz関連型定義
├── utils/
│   ├── date.ts                    # 日付操作
│   ├── format.ts                  # フォーマット関数
│   └── constants.ts               # 定数定義
└── hooks/
    ├── useTerm.ts                 # 用語取得フック
    ├── useProgress.ts             # 進捗管理フック
    ├── useQuiz.ts                 # クイズ管理フック
    └── useSRS.ts                  # SRS管理フック
```

### 4.2 主要コンポーネント設計

#### SearchBar.tsx
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useTermStore } from '@/lib/store';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100); // 100ms デバウンス
  const { searchTerms } = useTermStore();

  useEffect(() => {
    if (debouncedQuery) {
      searchTerms(debouncedQuery);
    }
  }, [debouncedQuery, searchTerms]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="用語を検索... (Ctrl+K)"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <kbd className="absolute right-2 top-2">⌘K</kbd>
    </div>
  );
}
```

#### TermCard.tsx
```typescript
interface TermCardProps {
  term: Term;
  progress?: UserProgress;
  onClick: () => void;
}

export function TermCard({ term, progress, onClick }: TermCardProps) {
  const masteryColor = getMasteryColor(progress?.mastery_level ?? 0);

  return (
    <div
      className={`p-4 border-2 rounded-lg cursor-pointer hover:shadow-lg transition ${masteryColor}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{term.term}</h3>
          <p className="text-sm text-gray-600">{term.reading}</p>
        </div>
        <Badge difficulty={term.difficulty} />
      </div>

      <p className="mt-2 text-sm">{term.short_desc}</p>

      <div className="mt-2 flex gap-2">
        <CategoryBadge category={term.category} />
        {progress && (
          <span className="text-xs">
            正答率: {((progress.quiz_correct / progress.quiz_total) * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

function getMasteryColor(level: number): string {
  const colors = [
    'border-gray-300',     // 0: 未学習
    'border-yellow-300',   // 1: 認識
    'border-blue-300',     // 2: 理解
    'border-green-300',    // 3: 定着
    'border-emerald-500',  // 4: 習得
  ];
  return colors[level];
}
```

#### QuizCard.tsx
```typescript
'use client';

interface QuizCardProps {
  term: Term;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (quality: number) => void;
}

export function QuizCard({ term, isFlipped, onFlip, onRate }: QuizCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`card ${isFlipped ? 'flipped' : ''}`}>
        {!isFlipped ? (
          // 表面: 用語名のみ
          <div className="card-front">
            <h2 className="text-4xl font-bold text-center">{term.term}</h2>
            <button onClick={onFlip}>カードをめくる</button>
          </div>
        ) : (
          // 裏面: 説明 + 評価
          <div className="card-back">
            <h3 className="text-2xl font-bold">{term.term}</h3>
            <p className="mt-4">{term.full_desc}</p>
            {term.code_example && (
              <pre className="mt-4 p-4 bg-gray-100 rounded">
                <code>{term.code_example}</code>
              </pre>
            )}

            <div className="mt-6">
              <p className="font-semibold">どれくらい覚えていましたか？</p>
              <div className="flex gap-2 mt-2">
                {[0, 1, 2, 3, 4, 5].map(quality => (
                  <button
                    key={quality}
                    onClick={() => onRate(quality)}
                    className="px-4 py-2 border rounded hover:bg-blue-500"
                  >
                    {quality}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                0: 完全に忘れた | 3: 思い出した | 5: 完璧
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5. 状態管理（Zustand）

### 5.1 Store設計

```typescript
// lib/store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { db } from './db';
import { searchEngine } from './search';

// ----------------
// Terms Store
// ----------------
interface TermsState {
  terms: Term[];
  filteredTerms: Term[];
  selectedTerm: Term | null;

  // Filters
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;

  // Actions
  loadTerms: () => Promise<void>;
  searchTerms: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  filterByDifficulty: (difficulty: string | null) => void;
  selectTerm: (term: Term | null) => void;
}

export const useTermStore = create<TermsState>()(
  devtools(
    (set, get) => ({
      terms: [],
      filteredTerms: [],
      selectedTerm: null,
      searchQuery: '',
      selectedCategory: null,
      selectedDifficulty: null,

      loadTerms: async () => {
        const terms = await db.terms.toArray();
        set({ terms, filteredTerms: terms });
      },

      searchTerms: (query) => {
        const { terms } = get();
        const results = searchEngine.search(query, terms);
        set({ searchQuery: query, filteredTerms: results });
      },

      filterByCategory: (category) => {
        set({ selectedCategory: category });
        applyFilters(set, get);
      },

      filterByDifficulty: (difficulty) => {
        set({ selectedDifficulty: difficulty });
        applyFilters(set, get);
      },

      selectTerm: (term) => {
        set({ selectedTerm: term });
      },
    })
  )
);

function applyFilters(set, get) {
  const { terms, searchQuery, selectedCategory, selectedDifficulty } = get();
  let filtered = terms;

  if (searchQuery) {
    filtered = searchEngine.search(searchQuery, filtered);
  }
  if (selectedCategory) {
    filtered = filtered.filter(t => t.category === selectedCategory);
  }
  if (selectedDifficulty) {
    filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
  }

  set({ filteredTerms: filtered });
}

// ----------------
// Progress Store
// ----------------
interface ProgressState {
  progressMap: Map<string, UserProgress>;

  loadProgress: () => Promise<void>;
  updateProgress: (termId: string, updates: Partial<UserProgress>) => Promise<void>;
  getProgress: (termId: string) => UserProgress | undefined;
  getStats: () => {
    totalTerms: number;
    masteredTerms: number;
    reviewDueToday: number;
  };
}

export const useProgressStore = create<ProgressState>()(
  devtools(
    (set, get) => ({
      progressMap: new Map(),

      loadProgress: async () => {
        const progressList = await db.user_progress.toArray();
        const progressMap = new Map(
          progressList.map(p => [p.term_id, p])
        );
        set({ progressMap });
      },

      updateProgress: async (termId, updates) => {
        const existing = get().progressMap.get(termId);
        const updated = { ...existing, ...updates, term_id: termId };
        await db.user_progress.put(updated);

        const newMap = new Map(get().progressMap);
        newMap.set(termId, updated);
        set({ progressMap: newMap });
      },

      getProgress: (termId) => {
        return get().progressMap.get(termId);
      },

      getStats: () => {
        const { progressMap } = get();
        const progressList = Array.from(progressMap.values());

        return {
          totalTerms: progressMap.size,
          masteredTerms: progressList.filter(p => p.mastery_level === 4).length,
          reviewDueToday: progressList.filter(
            p => p.next_review <= new Date()
          ).length,
        };
      },
    })
  )
);
```

---

## 6. 検索エンジン実装

```typescript
// lib/search.ts
import Fuse from 'fuse.js';

class TermSearchEngine {
  private fuse: Fuse<Term> | null = null;

  initialize(terms: Term[]) {
    this.fuse = new Fuse(terms, {
      keys: [
        { name: 'term', weight: 2 },         // 用語名は重み2倍
        { name: 'reading', weight: 1.5 },
        { name: 'short_desc', weight: 1 },
        { name: 'full_desc', weight: 0.5 },
        { name: 'tags', weight: 1.5 },
      ],
      threshold: 0.3,           // あいまい度（0=完全一致, 1=何でも一致）
      includeScore: true,
      minMatchCharLength: 2,    // 最低2文字から検索
    });
  }

  search(query: string, terms?: Term[]): Term[] {
    if (!query) return terms ?? [];
    if (!this.fuse) return [];

    const results = this.fuse.search(query);
    return results.map(r => r.item);
  }

  searchWithHighlight(query: string): Array<Term & { matches: string[] }> {
    if (!this.fuse) return [];

    const results = this.fuse.search(query);
    return results.map(r => ({
      ...r.item,
      matches: r.matches?.map(m => m.value ?? '') ?? [],
    }));
  }
}

export const searchEngine = new TermSearchEngine();
```

---

## 7. SRSアルゴリズム実装（SM-2）

```typescript
// lib/srs.ts

/**
 * SM-2アルゴリズムによる次回復習日計算
 *
 * @param current 現在の進捗状態
 * @param quality 記憶度（0-5）
 *   0: 完全に忘れた
 *   1: かすかに覚えていた
 *   2: 思い出すのに苦労した
 *   3: 正解だが迷った
 *   4: 正解・確信あり
 *   5: 完璧
 * @returns 更新されたSRSパラメータ
 */
export function calculateNextReview(
  current: UserProgress,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): Partial<UserProgress> {
  const { ease_factor, interval, review_count } = current;

  // Ease Factorの更新
  let newEase = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  // Intervalの更新
  let newInterval: number;
  if (quality < 3) {
    // 不正解（質0-2）: リセット
    newInterval = 1;
  } else {
    // 正解（質3-5）: 延長
    if (interval === 0) {
      newInterval = 1;
    } else if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEase);
    }
  }

  // 次回復習日の計算
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // 習得レベルの更新
  let newMastery = current.mastery_level;
  if (quality >= 4 && review_count >= 3) {
    newMastery = Math.min(4, newMastery + 1) as 0 | 1 | 2 | 3 | 4;
  } else if (quality < 2) {
    newMastery = Math.max(0, newMastery - 1) as 0 | 1 | 2 | 3 | 4;
  }

  return {
    ease_factor: newEase,
    interval: newInterval,
    next_review: nextReviewDate,
    last_reviewed_at: new Date(),
    review_count: review_count + 1,
    mastery_level: newMastery,
  };
}

/**
 * 今日の復習予定用語を取得
 */
export async function getTodayReviews(): Promise<Array<Term & { progress: UserProgress }>> {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dueProgress = await db.user_progress
    .where('next_review')
    .belowOrEqual(today)
    .toArray();

  const termsWithProgress = await Promise.all(
    dueProgress.map(async (progress) => {
      const term = await db.terms.get(progress.term_id);
      return term ? { ...term, progress } : null;
    })
  );

  return termsWithProgress.filter((t): t is NonNullable<typeof t> => t !== null);
}
```

---

## 8. PWA設定

### 8.1 next-pwa設定

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js設定
});
```

### 8.2 Web App Manifest

```json
// public/manifest.json
{
  "name": "DevIndex - エンジニア用語学習アプリ",
  "short_name": "DevIndex",
  "description": "技術用語を効率的に学習・記憶定着",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 9. パフォーマンス最適化

### 9.1 最適化戦略

1. **初回ロード最適化**:
   - Code Splitting（Next.js自動）
   - Dynamic Import（重いコンポーネント）
   - Image Optimization（next/image）

2. **検索最適化**:
   - Debounce（100ms）
   - Fuse.js検索インデックスのメモ化

3. **レンダリング最適化**:
   - React.memo（重いコンポーネント）
   - useMemo / useCallback（高頻度関数）
   - Virtual Scrolling（用語数が多い場合）

4. **IndexedDB最適化**:
   - 一括読み込み（bulkGet）
   - インデックス活用（category, difficulty, next_review）

### 9.2 パフォーマンス目標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| 検索結果表示 | < 50ms | Performance API |
| 画面遷移 | < 100ms | 体感 |

---

## 10. テスト戦略

### 10.1 テスト方針

- **Unit Test**: 個別関数・ユーティリティ（Vitest）
- **Integration Test**: コンポーネント統合（Testing Library）
- **E2E Test**: ユーザーフロー（将来的にPlaywright）

### 10.2 テストカバレッジ目標

- **全体**: 70%以上
- **ビジネスロジック**（lib/）: 90%以上
- **UIコンポーネント**: 60%以上

### 10.3 重点テスト項目

- [ ] 検索機能の精度
- [ ] SRSアルゴリズムの正確性
- [ ] IndexedDBの初期化・更新
- [ ] オフライン動作

---

## 11. セキュリティ考慮事項

### 11.1 脅威分析

| 脅威 | 対策 |
|------|------|
| XSS | マークダウンのサニタイゼーション（DOMPurify） |
| データ改ざん | IndexedDBは読み取り専用（terms）、ローカルのみ |
| 情報漏洩 | 個人情報なし、ローカルストレージのみ |

### 11.2 実装方針

- マークダウンレンダリング時にDOMPurify使用
- CSP（Content Security Policy）設定
- TypeScript strict modeで型安全性確保

---

## 12. デプロイ戦略

### 12.1 ホスティング

- **推奨**: Vercel（Next.js公式、PWA対応良好）
- **代替**: GitHub Pages（静的エクスポート）

### 12.2 CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
```

---

**次のステップ**: `.tmp/tasks.md`（実装タスクリスト）の作成
