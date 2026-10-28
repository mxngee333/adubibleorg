const fs = require('fs');

async function runAudit() {
  console.log('=== [THE 24 ELDERS: WAVE 1] AUDITING ALL LANGUAGES & VERSIONS ===\n');

  // Read languagesRegistry.ts
  const regCode = fs.readFileSync('src/data/languagesRegistry.ts', 'utf8');

  // Parse LANGUAGES_REGISTRY
  const langRegex = /{\s*code:\s*'([^']+)',\s*name:\s*'([^']+)',\s*nativeName:\s*'([^']+)',[\s\S]*?defaultVersionId:\s*'([^']+)'/g;
  const languages = [];
  let m;
  while ((m = langRegex.exec(regCode)) !== null) {
    languages.push({
      code: m[1],
      name: m[2],
      nativeName: m[3],
      defaultVersionId: m[4]
    });
  }

  // Parse BIBLE_VERSIONS
  // We can look for id: '...', shortCode: '...', name: '...', langCode: '...'
  const verRegex = /{\s*id:\s*'([^']+)',\s*shortCode:\s*'([^']+)',\s*name:\s*'([^']+)',[\s\S]*?langCode:\s*'([^']+)',[\s\S]*?(?:helloaoId:\s*'([^']+)',)?[\s\S]*?(?:bollsId:\s*'([^']+)',)?/g;
  const versions = [];
  while ((m = verRegex.exec(regCode)) !== null) {
    // Only capture within BIBLE_VERSIONS array
    versions.push({
      id: m[1],
      shortCode: m[2],
      name: m[3],
      langCode: m[4],
      helloaoId: m[5],
      bollsId: m[6]
    });
  }

  console.log(`Found ${languages.length} registered languages in LANGUAGES_REGISTRY.`);
  console.log(`Found ${versions.length} registered Bible versions in BIBLE_VERSIONS.\n`);

  // Check public/seed directory
  const seedFiles = fs.readdirSync('public/seed').filter(f => f.endsWith('.json'));
  console.log(`Found ${seedFiles.length} seed files in public/seed/:\n${seedFiles.join(', ')}\n`);

  // Audit each language
  console.log('--- 1. AUDITING LANGUAGES IN LANGUAGES_REGISTRY ---');
  const langAudit = [];
  for (const l of languages) {
    const matchedVer = versions.find(v => v.id === l.defaultVersionId);
    langAudit.push({
      code: l.code,
      name: l.name,
      defaultVersionId: l.defaultVersionId,
      versionFound: !!matchedVer,
      versionLangMatch: matchedVer ? (matchedVer.langCode === l.code || (l.code === 'en' && matchedVer.langCode === 'en')) : false
    });
  }

  const missingVer = langAudit.filter(l => !l.versionFound);
  if (missingVer.length > 0) {
    console.error('CRITICAL: Languages whose defaultVersionId does not exist in BIBLE_VERSIONS:');
    console.error(missingVer);
  } else {
    console.log('✓ All languages map to valid version IDs in BIBLE_VERSIONS.');
  }

  // Audit each version's data sources
  console.log('\n--- 2. AUDITING VERSIONS DATA SOURCES & RESOLUTION CHANNELS ---');
  const verAudit = [];
  for (const v of versions) {
    // Check if HelloAO endpoint works
    let helloaoStatus = 'N/A';
    if (v.helloaoId) {
      try {
        const res = await fetch(`https://bible.helloao.org/api/${encodeURIComponent(v.helloaoId)}/GEN/1.json`, { method: 'HEAD' });
        helloaoStatus = res.status === 200 ? 'OK (200)' : `HTTP ${res.status}`;
      } catch (e) {
        helloaoStatus = `ERROR: ${e.message}`;
      }
    }

    // Check if Bolls endpoint works
    let bollsStatus = 'N/A';
    if (v.bollsId) {
      try {
        const res = await fetch(`https://bolls.life/get-text/${encodeURIComponent(v.bollsId)}/1/1/`, { method: 'HEAD' });
        bollsStatus = res.status === 200 ? 'OK (200)' : `HTTP ${res.status}`;
      } catch (e) {
        bollsStatus = `ERROR: ${e.message}`;
      }
    }

    // Check seed file
    const hasSeed = seedFiles.includes(`${v.helloaoId}.json`) || seedFiles.includes(`${v.id}.json`);

    verAudit.push({
      id: v.id,
      short: v.shortCode,
      lang: v.langCode,
      name: v.name,
      helloaoId: v.helloaoId || null,
      helloaoStatus,
      bollsId: v.bollsId || null,
      bollsStatus,
      hasSeed
    });
  }

  fs.writeFileSync('scripts/warroom-audit-results.json', JSON.stringify({ langAudit, verAudit }, null, 2), 'utf8');

  console.log('\nAudit complete! Results saved to scripts/warroom-audit-results.json');
  console.log('Summary of Version Statuses:');
  const problems = verAudit.filter(v => 
    v.lang !== 'en' && 
    v.helloaoStatus !== 'OK (200)' && 
    v.bollsStatus !== 'OK (200)' && 
    !v.hasSeed &&
    v.id !== 'gaa' // handled by custom NEGAB
  );
  console.log(`Non-English versions with neither working API nor seed: ${problems.length}`);
  if (problems.length > 0) {
    console.log('Issues found in:');
    problems.forEach(p => console.log(`  - [${p.id}] (${p.lang}) ${p.name}: HelloAO=${p.helloaoStatus}, Bolls=${p.bollsStatus}, Seed=${p.hasSeed}`));
  }
}

runAudit().catch(console.error);
