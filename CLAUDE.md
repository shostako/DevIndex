# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## セッション開始時の必須アクション
**重要：新しいセッションでこのプロジェクトに入った際は、以下を最初に実行すること**

1. **PROGRESS.md を読む**: `PROGRESS.md` を開き、現在の状態と未完了タスクを把握
2. **次のアクション確認**: 「次セッションへの引き継ぎ」セクションを確認し、継続すべきタスクを認識
3. **ユーザーへの報告**: 認識した未完了タスクをユーザーに報告し、優先度を確認

**目的**: セッション間の引き継ぎを確実にし、前回の作業を途切れなく継続するため

---

## プロジェクト概要

**DevIndex**は、エンジニアが技術用語を効率的に学習し、長期記憶に定着させるための学習支援Webアプリケーションです。

### コアバリュー
1. **速度**: 検索結果を50ms以内に表示（オフライン動作）
2. **オフライン**: PWAによる完全なローカル動作
3. **継続性**: SRS（Spaced Repetition System）による記憶定着
4. **可視化**: 学習進捗と理解度の明確な把握

### Phase別機能
- **Phase 1（MVP）**: 辞書機能（検索・フィルタ・詳細表示）
- **Phase 2**: クイズ機能（カード型UI、スコア管理）
- **Phase 3**: SRS機能（SM-2アルゴリズム、復習スケジュール管理）

---

## 技術スタック

### フロントエンド
- **Next.js 14 (App Router)**: フルスタックフレームワーク
- **TypeScript (strict mode)**: 型安全性
- **Tailwind CSS**: ユーティリティファーストCSS
- **Zustand**: 軽量状態管理

### データ層
- **IndexedDB (Dexie.js)**: ブラウザ内データ永続化
- **Fuse.js**: あいまい検索エンジン

### PWA
- **next-pwa**: Service Worker + Web App Manifest
- **オフライン優先**: 初回ロード後は完全にローカル動作

### 開発ツール
- **Vitest**: 高速テストランナー
- **Testing Library**: コンポーネントテスト
- **ESLint + Prettier**: コード品質・一貫性

---

## 開発コマンド

### プロジェクトのセットアップ
```bash
# 依存関係のインストール
npm install

# 初期データ生成
npm run generate-terms

# 開発サーバー起動
npm run dev
# → http://localhost:3000 でアクセス
```

### 開発中の主要コマンド
```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run start

# 型チェック
npm run type-check

# Lintチェック
npm run lint

# Lint自動修正
npm run lint:fix

# テスト実行
npm run test

# テスト（ウォッチモード）
npm run test:watch

# カバレッジ確認
npm run test:coverage

# 用語データ生成
npm run generate-terms
```

### IndexedDBの操作
```bash
# ブラウザの開発者ツール → Application → IndexedDB → DevIndexDB
# で直接確認・編集可能

# データベースをリセットしたい場合
# 1. ブラウザでIndexedDB "DevIndexDB" を削除
# 2. ページをリロード（自動的に再初期化）
```

---

## アーキテクチャ概要

### ディレクトリ構造
```
DevIndex/
├── .tmp/                      # 仕様書（要件・設計・タスク）
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── docs/                      # 設計資料
│   ├── architecture.md
│   ├── ui-design.md
│   └── srs-algorithm.md
├── public/
│   ├── terms.json            # 用語データ（ビルド時生成）
│   ├── manifest.json         # PWA manifest
│   └── icons/                # アプリアイコン
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── page.tsx          # ホーム（辞書モード）
│   │   ├── quiz/             # クイズモード
│   │   └── srs/              # SRSモード
│   ├── components/           # UIコンポーネント
│   │   ├── layout/           # レイアウト
│   │   ├── dictionary/       # 辞書関連
│   │   ├── quiz/             # クイズ関連
│   │   ├── srs/              # SRS関連
│   │   └── ui/               # 汎用UI
│   ├── lib/
│   │   ├── db.ts             # Dexie.js設定
│   │   ├── db-init.ts        # DB初期化
│   │   ├── search.ts         # 検索エンジン
│   │   ├── srs.ts            # SRSアルゴリズム
│   │   ├── quiz.ts           # クイズ生成
│   │   └── store.ts          # Zustand store
│   ├── types/                # TypeScript型定義
│   │   ├── term.ts
│   │   ├── progress.ts
│   │   └── quiz.ts
│   ├── utils/                # ユーティリティ関数
│   └── hooks/                # カスタムフック
├── scripts/
│   └── generate-terms.ts     # 用語データ生成スクリプト
├── CLAUDE.md                 # このファイル
└── package.json
```

### データフロー

```
┌─────────────────────────────────────────┐
│ Browser / PWA                           │
├─────────────────────────────────────────┤
│ UI Layer (React Components)             │
├─────────────────────────────────────────┤
│ State Management (Zustand)              │
├─────────────────────────────────────────┤
│ Business Logic                          │
│ ├── searchEngine (Fuse.js)             │
│ ├── srsAlgorithm (SM-2)                │
│ └── quizGenerator                      │
├─────────────────────────────────────────┤
│ Data Layer (Dexie.js / IndexedDB)      │
│ ├── terms (読み取り専用)               │
│ ├── user_progress (読み書き)           │
│ └── quiz_sessions (読み書き)           │
└─────────────────────────────────────────┘
```

---

## 開発ルール

### コーディング規約
1. **TypeScript strict mode**: `any`は禁止、型を明示
2. **関数型優先**: `class`は必要な場合のみ使用
3. **コンポーネント設計**:
   - `'use client'`は必要な場所のみ（状態・イベント使用時）
   - Server Componentsをデフォルトとする
4. **命名規則**:
   - コンポーネント: PascalCase（`TermCard.tsx`）
   - フック: camelCase + `use`プレフィックス（`useTerm.ts`）
   - ユーティリティ: camelCase（`formatDate.ts`）
5. **インポート順序**:
   ```typescript
   // 1. React関連
   import { useState } from 'react';
   // 2. 外部ライブラリ
   import { create } from 'zustand';
   // 3. 内部モジュール
   import { db } from '@/lib/db';
   // 4. 型定義
   import type { Term } from '@/types/term';
   // 5. スタイル
   import './styles.css';
   ```

### パフォーマンス重視
1. **検索速度**: 50ms以内を厳守（Fuse.js + Debounce）
2. **レンダリング最適化**:
   - `React.memo`で重いコンポーネントをメモ化
   - `useMemo` / `useCallback`で高頻度計算を最適化
3. **IndexedDB効率化**:
   - 一括読み込み（`bulkGet`）
   - インデックス活用（`category`, `next_review`等）

### UI/UX最優先
1. **速度至上**: すべての操作が瞬時に完了する（体感100ms以内）
2. **キーボード駆動**: マウス不要で全操作が可能
3. **レスポンシブ**: デスクトップ・タブレット・スマホ対応
4. **アクセシビリティ**: ARIA属性、キーボードナビゲーション

### データ管理
1. **用語データ**:
   - `public/terms.json`に格納（ビルド時生成）
   - 初回ロード時にIndexedDBへ投入
   - **読み取り専用**（更新は`generate-terms.ts`経由）
2. **ユーザー進捗**:
   - IndexedDB `user_progress`テーブル
   - **読み書き可能**（クイズ・SRSで更新）
3. **同期**:
   - Phase 1-3ではローカル完結
   - 将来的にクラウド同期を追加予定

---

## データモデル

### Term（用語）
```typescript
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
```

### UserProgress（ユーザー進捗）
```typescript
interface UserProgress {
  term_id: string;           // 外部キー: Term.id

  // 学習履歴
  first_learned_at: Date;
  last_reviewed_at: Date;
  review_count: number;

  // クイズ成績
  quiz_correct: number;
  quiz_total: number;

  // SRS（SM-2アルゴリズム）
  ease_factor: number;       // 難易度係数（初期値: 2.5）
  interval: number;          // 次回復習までの日数
  next_review: Date;         // 次回復習予定日

  // 習得レベル（0-4）
  mastery_level: 0 | 1 | 2 | 3 | 4;
  // 0: 未学習, 1: 認識, 2: 理解, 3: 定着, 4: 習得
}
```

### QuizSession（クイズセッション）
```typescript
interface QuizSession {
  id: string;
  mode: 'random' | 'category' | 'weakness';
  category?: string;
  difficulty?: string;
  started_at: Date;
  completed_at?: Date;
  questions: QuizQuestion[];
  score: { correct: number; total: number };
}

interface QuizQuestion {
  term_id: string;
  answered_at: Date;
  is_correct: boolean;
  time_spent: number;        // 秒
  quality: 0 | 1 | 2 | 3 | 4 | 5;  // 記憶度（SRS用）
}
```

---

## Phase別実装ガイド

### Phase 1: 辞書機能（Week 1）

**実装優先順位**:
1. プロジェクト基盤（Next.js + Dexie.js + PWA）
2. データ初期化（`terms.json` → IndexedDB）
3. レイアウト（Header, Sidebar, ProgressBar）
4. 検索エンジン（Fuse.js）
5. 用語一覧（TermCard, TermList）
6. 用語詳細（TermDetail Modal）

**動作確認ポイント**:
- [ ] 検索が50ms以内で動作
- [ ] オフラインでアクセス可能
- [ ] 詳細モーダルでMarkdown + コードハイライト表示
- [ ] Ctrl+Kで検索、Escで閉じる

### Phase 2: クイズ機能（Week 2-3）

**実装優先順位**:
1. クイズ生成ロジック（`lib/quiz.ts`）
2. クイズ設定画面（QuizSetup）
3. クイズカード（QuizCard + フリップアニメーション）
4. クイズ実行フロー
5. 結果画面（QuizResult）
6. 進捗データ更新

**動作確認ポイント**:
- [ ] カードがスムーズにめくれる
- [ ] 記憶度評価（0-5）が機能
- [ ] IndexedDBの`user_progress`が更新される
- [ ] 苦手用語リストが正しく表示される

### Phase 3: SRS機能（Week 4-5）

**実装優先順位**:
1. SM-2アルゴリズム（`lib/srs.ts`）
2. 復習カレンダー（ReviewCalendar）
3. 復習実行ページ
4. 統計ダッシュボード（習得率・連続日数）
5. 習得レベル管理

**動作確認ポイント**:
- [ ] SM-2アルゴリズムが正しく動作（ユニットテスト）
- [ ] 復習予定が期限順に表示される
- [ ] 評価に応じて次回復習日が更新される
- [ ] 統計が正確に表示される

---

## トラブルシューティング

### IndexedDBが初期化されない
**症状**: ページを開いても用語が表示されない

**原因**: `terms.json`が見つからない、またはIndexedDB初期化失敗

**対処法**:
1. `npm run generate-terms`を実行
2. `public/terms.json`が存在することを確認
3. ブラウザの開発者ツール → Application → IndexedDB → DevIndexDBを確認
4. IndexedDBを削除してリロード

### 検索が遅い
**症状**: 検索結果表示に100ms以上かかる

**原因**: Fuse.jsの初期化忘れ、またはDebounce未設定

**対処法**:
1. `lib/search.ts`の`initialize()`が呼ばれているか確認
2. `SearchBar`コンポーネントで`useDebounce`を使用しているか確認
3. Fuse.jsの`threshold`を調整（デフォルト: 0.3）

### PWAがインストールできない
**症状**: 「Add to Home Screen」が表示されない

**原因**: Service Worker未登録、またはmanifest.json不正

**対処法**:
1. `next.config.js`でnext-pwaが有効か確認
2. `public/manifest.json`が正しいか確認
3. HTTPSでアクセスしているか確認（localhostは例外）
4. ブラウザの開発者ツール → Application → Service Workersで確認

### SRSアルゴリズムが期待通りに動作しない
**症状**: 次回復習日が異常

**原因**: SM-2アルゴリズムのパラメータ誤り

**対処法**:
1. `lib/srs.test.ts`のユニットテストを実行
2. `ease_factor`の初期値が2.5か確認
3. `quality`が0-5の範囲内か確認
4. `interval`の計算ロジックを再確認

---

## カスタムコマンド（将来追加予定）

将来的に以下のカスタムスラッシュコマンドを追加予定:

- `/devindex-spec`: 全体仕様の確認・更新
- `/devindex-phase`: Phase別実装進行
- `/devindex-data`: 用語データ追加UI
- `/devindex-test`: E2Eテスト実行

---

## 参考資料

- **仕様書**: `.tmp/requirements.md`（要件定義）
- **設計書**: `.tmp/design.md`（技術設計）
- **タスクリスト**: `.tmp/tasks.md`（実装タスク）
- **アーキテクチャ**: `docs/architecture.md`
- **SRSアルゴリズム**: `docs/srs-algorithm.md`

---

## 重要な設計判断

### なぜバックエンドがないのか？
- **理由**: 静的な用語データはビルド時生成で十分
- **利点**: サーバーコスト不要、オフライン動作、高速
- **将来拡張**: データ同期が必要になったらAPI追加

### なぜIndexedDBか？
- **理由**: LocalStorageは容量制限（5MB）、IndexedDBは実質無制限
- **利点**: 複雑なクエリ、大容量データ、オフライン永続化
- **トレードオフ**: 非同期API、ブラウザ間の実装差異

### なぜZustandか？
- **理由**: Reduxはオーバーキル、Contextはパフォーマンス懸念
- **利点**: 軽量（3KB）、シンプルAPI、DevTools対応
- **トレードオフ**: エコシステムが小さい

---

**最後に**: このプロジェクトは「UI/UX最優先」「速度至上主義」「オフライン優先」の3原則に基づいています。技術選択に迷った場合は、常にこの3原則に立ち返ってください。
