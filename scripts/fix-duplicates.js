const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const termsPath = path.join(__dirname, '../public/terms.json');

console.log('重複IDを修正中...\n');

// JSONを読み込む
const data = JSON.parse(fs.readFileSync(termsPath, 'utf8'));
const terms = data.terms;

// IDの出現回数をカウント
const idCounts = {};
terms.forEach(term => {
  idCounts[term.id] = (idCounts[term.id] || 0) + 1;
});

// 重複IDを特定
const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);

console.log(`Total terms: ${terms.length}`);
console.log(`Unique IDs before fix: ${Object.keys(idCounts).length}`);
console.log(`Duplicate IDs: ${duplicateIds.length}\n`);

// 各IDについて、最初の出現以外に新しいUUIDを割り当てる
const seen = new Set();
let fixedCount = 0;

terms.forEach(term => {
  if (seen.has(term.id)) {
    // 重複 → 新しいUUIDを生成
    const oldId = term.id;
    term.id = crypto.randomUUID();
    seen.add(term.id);  // 新しいIDも追加
    console.log(`Fixed: ${oldId} → ${term.id}`);
    fixedCount++;
  } else {
    seen.add(term.id);
  }
});

// 結果を保存
data.terms = terms;
fs.writeFileSync(termsPath, JSON.stringify(data, null, 2));

console.log(`\n✅ 修正完了！`);
console.log(`  修正したレコード数: ${fixedCount}`);
console.log(`  最終的なユニークID数: ${seen.size}`);
console.log(`  Total terms: ${terms.length}`);
