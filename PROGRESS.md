# プロジェクト進捗状況

## 現在の状態
- **最終更新**: 2025-12-02
- **アクティブタスク**: なし（Phase 1-3完了、モバイルUI改善完了）

## 完了済み
- [x] Phase 1: 辞書機能（検索・フィルタ・詳細表示）
- [x] Phase 2: クイズ機能（カード型UI、スコア管理）
- [x] Phase 3: SRS機能（SM-2アルゴリズム、復習スケジュール管理）
- [x] ダークモード対応
- [x] 静的エクスポート設定（Next.js output: 'export'）
- [x] 悪魔のIT辞典リブランディング（sarcastic_notes追加）
- [x] クイズ出題ロジック改善（アルファベット用語の読み仮名問題除外）
- [x] **スマホ対応UI（レスポンシブデザイン）**
  - viewport設定追加
  - Headerハンバーガーメニュー（md未満でドロワー表示）
  - TermTableモバイル対応（md未満で簡易リスト表示）
  - QuizCard/ReviewCardレスポンシブ化（パディング・高さ・フォントサイズ）
  - page.tsxコントロール折り返し対応
  - **Sidebarボトムシート化**（モバイルで下からスライドイン）
    - FilterContent.tsx: 共通フィルタコンテンツ
    - BottomSheet.tsx: 汎用ボトムシートコンポーネント
    - Sidebar.tsx: デスクトップ専用に簡素化
  - **コントロール2x2グリッド配置**（モバイルでフィルタ/精度/並び替え/表示を2行表示）

## 未完了・保留
- [ ] 初回ユーザー向けのオンボーディング画面
- [ ] データエクスポート/インポート機能
- [ ] PWA対応（Service Worker、Web App Manifest）
- [ ] 進捗グラフの可視化
- [ ] 復習リマインダー通知

## 次セッションへの引き継ぎ
- **次のアクション**: 特に緊急なし。追加機能は優先度に応じて
- **重要な発見**:
  - SM-2アルゴリズムの習得レベル判定: `reviewCount`と`interval`の組み合わせで判定
  - WSL環境では`-H 0.0.0.0`オプションが必要（Windows側からのアクセス）
  - アルファベット用語の読み仮名問題は学習効果が低い → 除外
  - Tailwindブレークポイント: `sm:640px`, `md:768px`, `lg:1024px`
  - **重要**: 水平スクロール発生時はビューポート幅が広がるため、`sm:`よりも`md:`を使う方が安全
- **参照すべきリソース**:
  - `/home/shostako/ClaudeCode/DevIndex/logs/2025-12.md`（12月の実装ログ）
  - `/home/shostako/ClaudeCode/DevIndex/logs/2025-11.md`（11月の実装ログ）
  - `/home/shostako/ClaudeCode/DevIndex/docs/srs-algorithm.md`（SM-2仕様）

## 直近のGitコミット
- cd84ce4 feat: モバイルでコントロールを2x2グリッド配置
- e81f2f8 fix: ラベル非表示のブレークポイントをsm→mdに変更
