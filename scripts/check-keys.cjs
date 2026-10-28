const fs = require('fs');
const content = fs.readFileSync('src/data/featuredChaptersCorpus.ts', 'utf8');

function getKeys(name) {
  const idx = content.indexOf('const ' + name);
  if (idx === -1) return [];
  const endIdx = content.indexOf('};', idx);
  const slice = content.substring(idx, endIdx);
  const lines = slice.split('\n');
  return lines.filter(l => l.includes(': [')).map(l => l.split(':')[0].trim().replace(/['"]/g, ''));
}

console.log('EPHESIANS_1:', getKeys('EPHESIANS_1_RAW'));
console.log('GENESIS_1:', getKeys('GENESIS_1_RAW'));
console.log('PSALM_23:', getKeys('PSALM_23_RAW'));
console.log('JOHN_1:', getKeys('JOHN_1_RAW'));
console.log('JOHN_3:', getKeys('JOHN_3_RAW'));
console.log('ROMANS_8:', getKeys('ROMANS_8_RAW'));
