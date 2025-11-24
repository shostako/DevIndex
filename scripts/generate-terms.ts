import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Term, Category } from '../types/term';

// ----------------
// カテゴリー定義
// ----------------

const categories: Category[] = [
  { name: 'Web', color: '#3B82F6' },
  { name: 'Database', color: '#10B981' },
  { name: 'プログラミング言語', color: '#F59E0B' },
  { name: 'ツール', color: '#8B5CF6' },
  { name: 'アーキテクチャ', color: '#EF4444' },
];

// ----------------
// 初期用語データ（20語）
// ----------------

const terms: Term[] = [
  // Web関連
  {
    id: crypto.randomUUID(),
    term: 'REST API',
    reading: 'レストエーピーアイ',
    category: 'Web',
    difficulty: 'beginner',
    short_desc: 'HTTPプロトコルを使用したアーキテクチャスタイル',
    full_desc: `## REST APIとは

REpresentational State Transfer（REST）は、Webサービスを設計するためのアーキテクチャスタイルです。

### 特徴
- **ステートレス**: 各リクエストは独立して処理される
- **リソース指向**: URLでリソースを表現
- **HTTPメソッド**: GET、POST、PUT、DELETEを使用`,
    code_example: `fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data))`,
    tags: ['API', 'HTTP', 'アーキテクチャ'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'JSON',
    reading: 'ジェイソン',
    category: 'Web',
    difficulty: 'beginner',
    short_desc: 'JavaScript Object Notationの略。データ交換フォーマット',
    full_desc: `## JSONとは

JSONは軽量なデータ交換フォーマットで、人間が読み書きしやすく、機械が解析・生成しやすい形式です。`,
    code_example: `{
  "name": "太郎",
  "age": 25,
  "skills": ["JavaScript", "TypeScript"]
}`,
    tags: ['データ形式', 'Web'],
    created_at: new Date().toISOString(),
  },

  // Database関連
  {
    id: crypto.randomUUID(),
    term: 'SQL',
    reading: 'エスキューエル',
    category: 'Database',
    difficulty: 'beginner',
    short_desc: 'リレーショナルデータベースを操作するための言語',
    full_desc: `## SQLとは

Structured Query Language（SQL）は、リレーショナルデータベース管理システム（RDBMS）でデータを操作するための標準言語です。`,
    code_example: `SELECT * FROM users
WHERE age > 20
ORDER BY created_at DESC;`,
    tags: ['データベース', 'クエリ言語'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'NoSQL',
    reading: 'ノーエスキューエル',
    category: 'Database',
    difficulty: 'intermediate',
    short_desc: '非リレーショナルデータベースの総称',
    full_desc: `## NoSQLとは

NoSQLは、従来のリレーショナルデータベースとは異なるアプローチを取るデータベースシステムの総称です。

### 種類
- **ドキュメント型**: MongoDB
- **キーバリュー型**: Redis
- **カラム型**: Cassandra
- **グラフ型**: Neo4j`,
    tags: ['データベース', 'スケーラビリティ'],
    created_at: new Date().toISOString(),
  },

  // プログラミング言語
  {
    id: crypto.randomUUID(),
    term: 'TypeScript',
    reading: 'タイプスクリプト',
    category: 'プログラミング言語',
    difficulty: 'intermediate',
    short_desc: 'JavaScriptに型システムを追加したプログラミング言語',
    full_desc: `## TypeScriptとは

TypeScriptは、Microsoftが開発したJavaScriptのスーパーセットで、静的型付けを追加したプログラミング言語です。`,
    code_example: `interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`,
    tags: ['プログラミング言語', 'JavaScript', '型安全'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: '非同期処理',
    reading: 'ひどうきしょり',
    category: 'プログラミング言語',
    difficulty: 'intermediate',
    short_desc: '処理の完了を待たずに次の処理を実行する仕組み',
    full_desc: `## 非同期処理とは

非同期処理は、時間のかかる処理（ネットワーク通信、ファイル読み込み等）を待たずに、他の処理を続行できる仕組みです。

### JavaScriptでの実装
- **Promise**: 非同期処理の結果を表現
- **async/await**: Promiseをより簡潔に記述`,
    code_example: `async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}`,
    tags: ['プログラミング', 'JavaScript', 'Promise'],
    created_at: new Date().toISOString(),
  },

  // ツール
  {
    id: crypto.randomUUID(),
    term: 'Git',
    reading: 'ギット',
    category: 'ツール',
    difficulty: 'beginner',
    short_desc: '分散型バージョン管理システム',
    full_desc: `## Gitとは

Gitは、ソースコードのバージョン管理を行うための分散型バージョン管理システムです。

### 主要コマンド
- \`git clone\`: リポジトリを複製
- \`git commit\`: 変更を記録
- \`git push\`: リモートに送信
- \`git pull\`: リモートから取得`,
    code_example: `git clone https://github.com/user/repo.git
cd repo
git add .
git commit -m "Add new feature"
git push origin main`,
    tags: ['バージョン管理', 'ツール'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Docker',
    reading: 'ドッカー',
    category: 'ツール',
    difficulty: 'intermediate',
    short_desc: 'コンテナ型の仮想化プラットフォーム',
    full_desc: `## Dockerとは

Dockerは、アプリケーションとその依存関係をコンテナとしてパッケージ化し、どの環境でも同じように実行できるようにするツールです。

### メリット
- 環境の一貫性
- 軽量・高速
- スケーラビリティ`,
    code_example: `# Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]`,
    tags: ['コンテナ', 'DevOps', 'インフラ'],
    created_at: new Date().toISOString(),
  },

  // アーキテクチャ
  {
    id: crypto.randomUUID(),
    term: 'MVC',
    reading: 'エムブイシー',
    category: 'アーキテクチャ',
    difficulty: 'intermediate',
    short_desc: 'Model-View-Controllerの略。アプリケーション設計パターン',
    full_desc: `## MVCとは

MVCは、アプリケーションを3つの役割に分離する設計パターンです。

- **Model**: データとビジネスロジック
- **View**: 表示（UI）
- **Controller**: ModelとViewの橋渡し`,
    tags: ['デザインパターン', 'アーキテクチャ'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'マイクロサービス',
    reading: 'マイクロサービス',
    category: 'アーキテクチャ',
    difficulty: 'advanced',
    short_desc: 'アプリケーションを小さな独立したサービスに分割するアーキテクチャ',
    full_desc: `## マイクロサービスとは

マイクロサービスアーキテクチャは、アプリケーションを小さな独立したサービスの集合として構築する手法です。

### メリット
- 独立したデプロイ
- 技術スタックの柔軟性
- スケーラビリティ

### デメリット
- 複雑性の増加
- 分散システムの課題`,
    tags: ['アーキテクチャ', 'スケーラビリティ'],
    created_at: new Date().toISOString(),
  },

  // 追加の重要用語（10語）
  {
    id: crypto.randomUUID(),
    term: 'API',
    reading: 'エーピーアイ',
    category: 'Web',
    difficulty: 'beginner',
    short_desc: 'Application Programming Interfaceの略。ソフトウェア間の接続仕様',
    full_desc: 'APIは、異なるソフトウェアやシステムが互いに通信するためのインターフェースです。',
    tags: ['Web', 'インターフェース'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'CSS',
    reading: 'シーエスエス',
    category: 'Web',
    difficulty: 'beginner',
    short_desc: 'Cascading Style Sheetsの略。Webページの見た目を定義',
    full_desc: 'CSSは、HTMLで記述された要素のスタイル（色、サイズ、レイアウト等）を定義する言語です。',
    code_example: `.button {
  background-color: #3B82F6;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}`,
    tags: ['Web', 'スタイル'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'IndexedDB',
    reading: 'インデックスドディービー',
    category: 'Database',
    difficulty: 'intermediate',
    short_desc: 'ブラウザ内で動作するNoSQLデータベース',
    full_desc: 'IndexedDBは、ブラウザ内で大量のデータを永続化できるクライアントサイドストレージです。',
    code_example: `const db = await window.indexedDB.open('myDB', 1);
const tx = db.transaction('users', 'readwrite');
await tx.objectStore('users').add({ id: 1, name: 'Alice' });`,
    tags: ['ブラウザ', 'ストレージ', 'NoSQL'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'React',
    reading: 'リアクト',
    category: 'プログラミング言語',
    difficulty: 'intermediate',
    short_desc: 'Facebookが開発したUIライブラリ',
    full_desc: 'Reactは、ユーザーインターフェースを構築するためのJavaScriptライブラリです。コンポーネントベースで再利用性が高いのが特徴です。',
    code_example: `function Hello({ name }) {
  return <h1>Hello, {name}!</h1>;
}`,
    tags: ['JavaScript', 'UI', 'ライブラリ'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Webpack',
    reading: 'ウェブパック',
    category: 'ツール',
    difficulty: 'intermediate',
    short_desc: 'モジュールバンドラー。複数のファイルを1つにまとめる',
    full_desc: 'Webpackは、JavaScriptファイルやCSS、画像などを依存関係を解決しながら1つ（または複数）のファイルにまとめるツールです。',
    tags: ['ツール', 'ビルド'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'CI/CD',
    reading: 'シーアイシーディー',
    category: 'ツール',
    difficulty: 'intermediate',
    short_desc: 'Continuous Integration/Continuous Deliveryの略。継続的インテグレーション/デリバリー',
    full_desc: 'CI/CDは、コードの変更を自動的にテスト・ビルド・デプロイするプロセスのことです。開発サイクルを高速化し、品質を向上させます。',
    tags: ['DevOps', '自動化'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'DDD',
    reading: 'ディーディーディー',
    category: 'アーキテクチャ',
    difficulty: 'advanced',
    short_desc: 'Domain-Driven Designの略。ドメイン駆動設計',
    full_desc: 'DDDは、複雑なビジネスロジックを持つシステムを、ドメイン（業務領域）を中心に設計する手法です。',
    tags: ['設計手法', 'アーキテクチャ'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'OAuth',
    reading: 'オーオース',
    category: 'Web',
    difficulty: 'advanced',
    short_desc: '認証・認可のためのオープンスタンダード',
    full_desc: 'OAuthは、サードパーティアプリケーションがユーザーのリソースにアクセスする際の認可フレームワークです。パスワードを直接渡さずに権限を委譲できます。',
    tags: ['セキュリティ', '認証'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'PWA',
    reading: 'ピーダブリューエー',
    category: 'Web',
    difficulty: 'intermediate',
    short_desc: 'Progressive Web Appsの略。Webアプリをネイティブアプリのように動作させる技術',
    full_desc: 'PWAは、Service Workerなどの技術を使って、Webアプリをオフラインで動作させたり、ホーム画面に追加できるようにする技術です。',
    tags: ['Web', 'モバイル', 'オフライン'],
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'レスポンシブデザイン',
    reading: 'レスポンシブデザイン',
    category: 'Web',
    difficulty: 'beginner',
    short_desc: 'デバイスの画面サイズに応じてレイアウトを変更する設計手法',
    full_desc: 'レスポンシブデザインは、PC、タブレット、スマートフォンなど、様々な画面サイズに対応するデザイン手法です。',
    code_example: `@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}`,
    tags: ['Web', 'デザイン', 'UI'],
    created_at: new Date().toISOString(),
  },
];

// ----------------
// JSON生成
// ----------------

const output = {
  version: '1.0.0',
  updated_at: new Date().toISOString(),
  terms,
  categories,
};

const outputPath = join(process.cwd(), 'public', 'terms.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`✅ Generated terms.json with ${terms.length} terms`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Categories: ${categories.map(c => c.name).join(', ')}`);
