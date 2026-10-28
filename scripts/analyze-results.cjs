const fs = require('fs');
const results = JSON.parse(fs.readFileSync('scripts/live-test-results.json', 'utf8'));

console.log('=== VERSIONS ANALYSIS ===\n');

const failing = results.filter(r => r.helloaoStatus !== 200 && r.bollsStatus !== 200);
console.log('Total failing endpoints (neither HelloAO nor Bolls returned 200):', failing.length, '\n');
failing.forEach(f => {
  console.log(`- [${f.id}] (${f.lang}) ${f.name}`);
  console.log(`    HelloAO (${f.helloaoId}): ${f.helloaoStatus}`);
  console.log(`    Bolls (${f.bollsId}): ${f.bollsStatus}`);
});

console.log('\n=== CHECKING IF ANY NON-ENGLISH VERSION ACTUALLY RETURNED ENGLISH ===\n');
for (const r of results) {
  if (r.lang !== 'en') {
    const text = (r.helloaoVerse || r.bollsVerse || '').toLowerCase();
    const hasEnglish = text.includes('in the beginning') || text.includes('created the heaven') || text.includes('god created');
    if (hasEnglish) {
      console.log(`🚨 DETECTED ENGLISH SPOOFING IN NON-ENGLISH VERSION: [${r.id}] (${r.lang}) ${r.name}`);
      console.log(`   Text: "${text}"`);
    }
  }
}
