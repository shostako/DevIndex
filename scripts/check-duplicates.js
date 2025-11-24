const data = require('../public/terms.json');

const ids = data.terms.map(t => t.id);
const uniqueIds = new Set(ids);

console.log('Total terms:', data.terms.length);
console.log('Unique IDs:', uniqueIds.size);
console.log('Duplicates:', data.terms.length - uniqueIds.size);

if (uniqueIds.size !== data.terms.length) {
  const counts = {};
  ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
  const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
  console.log('\nDuplicate IDs:');
  duplicates.forEach(([id, count]) => {
    console.log(`  ${id}: ${count} times`);
  });
}
