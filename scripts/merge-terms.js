const fs = require('fs');
const path = require('path');

// JSONファイルを読み込む
const terms20Path = path.join(__dirname, '../public/terms.json');
const terms150Path = path.join(__dirname, '../public/terms-150.json');

console.log('既存データ読み込み中...');
const terms20 = JSON.parse(fs.readFileSync(terms20Path, 'utf8'));

console.log('新規データ読み込み中...');
const terms150 = JSON.parse(fs.readFileSync(terms150Path, 'utf8'));

// マージ
console.log('マージ中...');
const merged = {
  version: terms20.version,
  updated_at: new Date().toISOString(),
  terms: [...terms20.terms, ...terms150.terms],
  categories: terms20.categories
};

// 書き込み
console.log('書き込み中...');
fs.writeFileSync(terms20Path, JSON.stringify(merged, null, 2));

console.log('\n✅ マージ完了!');
console.log(`  既存: ${terms20.terms.length}件`);
console.log(`  新規: ${terms150.terms.length}件`);
console.log(`  合計: ${merged.terms.length}件`);
