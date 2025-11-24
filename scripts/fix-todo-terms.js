#!/usr/bin/env node

/**
 * TODO項目の英語表記を修正するスクリプト
 *
 * terms-with-english.jsonの "TODO: xxx" を正しい英語表記に置き換えます
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../public/terms-with-english.json');
const OUTPUT_FILE = path.join(__dirname, '../public/terms.json');

// 完全マッピング（51件すべて）
const englishMap = {
  // 言語・ツール
  'C++': 'C++',
  'CI/CD': 'CI/CD',
  'Next.js': 'Next.js',
  'Node.js': 'Node.js',
  'Vue.js': 'Vue.js',
  'map/reduce': 'Map/Reduce',
  'Null安全': 'Null Safety',

  // アーキテクチャ
  'イベント駆動アーキテクチャ': 'Event-Driven Architecture',
  'クリーンアーキテクチャ': 'Clean Architecture',
  'レイヤードアーキテクチャ': 'Layered Architecture',
  'サーバーレス': 'Serverless',

  // デザインパターン
  'オブザーバーパターン': 'Observer Pattern',
  'シングルトン': 'Singleton',
  'ストラテジーパターン': 'Strategy Pattern',
  'ファクトリーパターン': 'Factory Pattern',

  // データベース
  'インデックス': 'Index',
  'シャーディング': 'Sharding',
  'トランザクション': 'Transaction',
  'レプリケーション': 'Replication',
  '正規化': 'Normalization',

  // インフラ・運用
  'ロードバランサー': 'Load Balancer',
  'アジャイル': 'Agile',
  'スクラム': 'Scrum',
  'コードレビュー': 'Code Review',
  'ペアプログラミング': 'Pair Programming',
  'プルリクエスト': 'Pull Request',

  // プログラミング概念
  'イミュータブル': 'Immutable',
  'クロージャ': 'Closure',
  'ジェネリクス': 'Generics',
  'ポリモーフィズム': 'Polymorphism',
  'プロトタイプ': 'Prototype',
  'ラムダ式': 'Lambda Expression',
  '関数型プログラミング': 'Functional Programming',
  '型推論': 'Type Inference',
  '抽象クラス': 'Abstract Class',

  // パフォーマンス・デバッグ
  'ガベージコレクション': 'Garbage Collection',
  'デッドロック': 'Deadlock',
  'デバッグ': 'Debugging',
  'デバウンス': 'Debounce',
  'スロットリング': 'Throttling',
  'プロファイリング': 'Profiling',
  'メモリリーク': 'Memory Leak',
  '競合状態': 'Race Condition',
  '排他制御': 'Mutual Exclusion',
  '非同期I/O': 'Asynchronous I/O',

  // Web技術
  'ブラウザキャッシュ': 'Browser Cache',
  'ローカルストレージ': 'Local Storage',
  'セッションストレージ': 'Session Storage',
  'セマンティックバージョニング': 'Semantic Versioning',
  '正規表現': 'Regular Expression',
};

function main() {
  console.log('🔧 TODO項目を修正中...\n');

  // ファイル読み込み
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

  let fixedCount = 0;
  let unfixedCount = 0;

  data.terms.forEach((term, index) => {
    if (term.term_en && term.term_en.startsWith('TODO: ')) {
      const originalTerm = term.term_en.replace('TODO: ', '');

      if (englishMap[originalTerm]) {
        term.term_en = englishMap[originalTerm];
        console.log(`✅ [${index + 1}] ${originalTerm} → ${term.term_en}`);
        fixedCount++;
      } else {
        console.log(`⚠️  [${index + 1}] ${originalTerm} → マッピングが見つかりません`);
        unfixedCount++;
      }
    }
  });

  console.log(`\n📊 結果:`);
  console.log(`   - 修正完了: ${fixedCount}件`);
  console.log(`   - 未解決: ${unfixedCount}件`);
  console.log(`   - 合計: ${data.terms.length}件\n`);

  if (unfixedCount === 0) {
    // 出力
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 ✅ 完全なデータを ${OUTPUT_FILE} に出力しました\n`);
    console.log(`📋 次のステップ:`);
    console.log(`   1. ブラウザの開発者ツール → Application → IndexedDB`);
    console.log(`   2. "DevIndexDB" を削除`);
    console.log(`   3. ページをリロード`);
    console.log(`   4. 170件すべてに英語表記が追加されたことを確認\n`);
  } else {
    console.log(`❌ ${unfixedCount}件の未解決項目があります。マッピングを追加してください。\n`);
    process.exit(1);
  }
}

main();
