# DevIndex

エンジニア用語学習Webアプリケーション

## 特徴

- **辞書モード**: 技術用語の検索・閲覧
- **クイズモード**: 学習効果を確認（Phase 2）
- **カテゴリー分類**: プログラミング言語、フレームワーク、ツール等
- **検索機能**: リアルタイム検索とフィルタリング

## 技術スタック

- **Frontend**: React + Vite
- **Backend**: FastAPI
- **Database**: SQLite
- **初期データ**: 120語（8カテゴリー）

## セットアップ

### 必要な環境

- Python 3.8+
- Node.js 16+
- npm

### 起動方法

```bash
chmod +x start.sh
./start.sh
```

ブラウザで `http://localhost:3000` にアクセス

## プロジェクト構成

```
DevIndex/
├── backend/          # FastAPI バックエンド
│   ├── main.py      # APIエントリーポイント
│   ├── database.py  # データベース設定
│   ├── models.py    # データモデル
│   └── requirements.txt
├── frontend/         # React フロントエンド
│   ├── src/
│   └── package.json
├── start.sh         # 起動スクリプト
└── README.md
```

## 開発ロードマップ

- [x] Phase 1: MVP（辞書機能）
- [ ] Phase 2: クイズモード
- [ ] Phase 3: SRS・統計機能
