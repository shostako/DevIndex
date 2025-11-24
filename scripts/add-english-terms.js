#!/usr/bin/env node

/**
 * 英語表記追加スクリプト
 *
 * 既存のterms.jsonを読み込み、各用語に対して英語表記(term_en)を追加します。
 *
 * 使用方法:
 *   node scripts/add-english-terms.js
 *
 * 出力:
 *   public/terms-with-english.json （レビュー用）
 */

const fs = require('fs');
const path = require('path');

// ファイルパス
const INPUT_FILE = path.join(__dirname, '../public/terms.json');
const OUTPUT_FILE = path.join(__dirname, '../public/terms-with-english.json');

/**
 * 英語表記を生成（簡易ルールベース）
 * 実際のAI生成前の仮実装
 */
function generateEnglishTerm(term) {
  // 既にterm_enがある場合はそのまま返す
  if (term.term_en) {
    return term.term_en;
  }

  const japaneseText = term.term;

  // ルール1: 既に英語（アルファベットのみ）ならそのまま
  if (/^[A-Za-z0-9\s\-_]+$/.test(japaneseText)) {
    return japaneseText;
  }

  // ルール2: 英語と日本語の混合（例: "SOLID原則"）→ アルファベット部分を抽出してPrinciples等を追加
  const alphaMatch = japaneseText.match(/^([A-Z]+)/);
  if (alphaMatch && japaneseText.includes('原則')) {
    return `${alphaMatch[1]} Principles`;
  }

  // ルール3: カタカナ用語のマッピング（よく使われるもの）
  const katakanaMap = {
    // プログラミング言語
    'タイプスクリプト': 'TypeScript',
    'ジャバスクリプト': 'JavaScript',
    'パイソン': 'Python',
    'ルビー': 'Ruby',
    'ゴー': 'Go',
    'ラスト': 'Rust',

    // ツール・フレームワーク
    'リアクト': 'React',
    'ネクストジェイエス': 'Next.js',
    'ドッカー': 'Docker',
    'クーバネティス': 'Kubernetes',
    'ジット': 'Git',

    // アーキテクチャ・概念
    'リファクタリング': 'Refactoring',
    'マイクロサービス': 'Microservices',
    'レスポンシブデザイン': 'Responsive Design',
    'デザインパターン': 'Design Pattern',
    'アルゴリズム': 'Algorithm',
    'データベース': 'Database',
    'キャッシュ': 'Cache',
    'セッション': 'Session',
    'クッキー': 'Cookie',
    'トークン': 'Token',
    'インターフェース': 'Interface',
    'クラス': 'Class',
    'オブジェクト': 'Object',
    'メソッド': 'Method',
    '関数': 'Function',
    '変数': 'Variable',
    '配列': 'Array',
    'ハッシュ': 'Hash',
    'スタック': 'Stack',
    'キュー': 'Queue',
    'ツリー': 'Tree',
    'グラフ': 'Graph',

    // 純日本語
    '非同期処理': 'Asynchronous Processing',
    '例外処理': 'Exception Handling',
    '並行処理': 'Concurrent Processing',
    '並列処理': 'Parallel Processing',
    '依存性注入': 'Dependency Injection',
    '継承': 'Inheritance',
    '多態性': 'Polymorphism',
    'カプセル化': 'Encapsulation',
  };

  // マップから検索
  if (katakanaMap[japaneseText]) {
    return katakanaMap[japaneseText];
  }

  // ルール4: フォールバック - 日本語のままにして手動レビューを促す
  return `TODO: ${japaneseText}`;
}

/**
 * メイン処理
 */
function main() {
  console.log('🚀 英語表記追加スクリプトを開始...\n');

  // 1. 入力ファイルを読み込み
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ エラー: ${INPUT_FILE} が見つかりません`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`✅ ${data.terms.length}件の用語を読み込みました\n`);

  // 2. 各用語に英語表記を追加
  let addedCount = 0;
  let skippedCount = 0;
  let todoCount = 0;

  data.terms.forEach((term, index) => {
    const englishTerm = generateEnglishTerm(term);

    if (term.term_en) {
      skippedCount++;
    } else if (englishTerm.startsWith('TODO:')) {
      term.term_en = englishTerm;
      todoCount++;
      console.log(`⚠️  [${index + 1}] ${term.term} → ${englishTerm}`);
    } else {
      term.term_en = englishTerm;
      addedCount++;
      if ((index + 1) % 20 === 0) {
        console.log(`📝 進捗: ${index + 1}/${data.terms.length} 件処理済み`);
      }
    }
  });

  console.log(`\n✅ 処理完了:`);
  console.log(`   - 追加: ${addedCount}件`);
  console.log(`   - スキップ（既存）: ${skippedCount}件`);
  console.log(`   - 要レビュー（TODO）: ${todoCount}件`);

  // 3. 出力ファイルに書き込み
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 出力先: ${OUTPUT_FILE}`);
  console.log(`\n📋 次のステップ:`);
  console.log(`   1. ${OUTPUT_FILE} を開いてレビュー`);
  console.log(`   2. "TODO:" で始まる項目を手動で修正`);
  console.log(`   3. レビュー後、public/terms.json を置き換え`);
  console.log(`   4. ブラウザでIndexedDBを削除してリロード\n`);
}

// 実行
main();
