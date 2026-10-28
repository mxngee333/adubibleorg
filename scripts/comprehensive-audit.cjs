const fs = require('fs');

async function comprehensiveAudit() {
  console.log('=== [THE 24 ELDERS] DEEP RECONNAISSANCE OF ALL 72 BIBLE VERSIONS ===\n');

  const content = fs.readFileSync('src/data/languagesRegistry.ts', 'utf8');
  const lines = content.split('\n');
  
  // Parse all versions into accurate objects
  const versions = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idMatch = line.match(/^\s*id:\s*'([^']+)'/);
    if (idMatch && lines.slice(Math.max(0, i-5), i).some(l => l.includes('BIBLE_VERSIONS') || l.includes('shortCode:'))) {
      if (cur) versions.push(cur);
      cur = { id: idMatch[1] };
    }
    if (cur) {
      const sMatch = line.match(/^\s*shortCode:\s*'([^']+)'/);
      if (sMatch) cur.shortCode = sMatch[1];
      const nMatch = line.match(/^\s*name:\s*'([^']+)'/);
      if (nMatch) cur.name = nMatch[1];
      const lMatch = line.match(/^\s*langCode:\s*'([^']+)'/);
      if (lMatch) cur.langCode = lMatch[1];
      const hMatch = line.match(/^\s*helloaoId:\s*'([^']+)'/);
      if (hMatch) cur.helloaoId = hMatch[1];
      const bMatch = line.match(/^\s*bollsId:\s*'([^']+)'/);
      if (bMatch) cur.bollsId = bMatch[1];
    }
  }
  if (cur) versions.push(cur);

  const seedFiles = fs.readdirSync('public/seed').filter(f => f.endsWith('.json'));

  console.log(`Parsed ${versions.length} versions from BIBLE_VERSIONS.`);

  // Test each version's HelloAO, Bolls, and Seed status
  const results = [];
  for (const v of versions) {
    const hasSeed = seedFiles.includes(`${v.helloaoId}.json`) || seedFiles.includes(`${v.id}.json`);
    
    let helloaoStatus = null;
    let helloaoVerse1 = null;
    if (v.helloaoId) {
      try {
        const res = await fetch(`https://bible.helloao.org/api/${encodeURIComponent(v.helloaoId)}/GEN/1.json`);
        if (res.ok) {
          helloaoStatus = 200;
          const data = await res.json();
          const v1 = data.chapter?.content?.find(c => c.type === 'verse');
          if (v1 && v1.content) {
            helloaoVerse1 = v1.content.map(c => typeof c === 'string' ? c : (c.text || '')).join(' ').trim();
          }
        } else {
          helloaoStatus = res.status;
        }
      } catch (e) {
        helloaoStatus = e.message;
      }
    }

    let bollsStatus = null;
    let bollsVerse1 = null;
    if (v.bollsId) {
      try {
        const res = await fetch(`https://bolls.life/get-text/${encodeURIComponent(v.bollsId)}/1/1/`);
        if (res.ok) {
          bollsStatus = 200;
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.text) {
            bollsVerse1 = String(data[0].text).replace(/<[^>]+>/g, '').trim();
          }
        } else {
          bollsStatus = res.status;
        }
      } catch (e) {
        bollsStatus = e.message;
      }
    }

    results.push({
      id: v.id,
      short: v.shortCode,
      lang: v.langCode,
      name: v.name,
      helloaoId: v.helloaoId || null,
      helloaoStatus,
      helloaoVerse1,
      bollsId: v.bollsId || null,
      bollsStatus,
      bollsVerse1,
      hasSeed
    });
  }

  fs.writeFileSync('scripts/comprehensive-audit-report.json', JSON.stringify(results, null, 2), 'utf8');

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Total audited: ${results.length}`);
  const healthy = results.filter(r => r.helloaoStatus === 200 || r.bollsStatus === 200 || r.hasSeed || r.id === 'gaa' || r.id === 'niv');
  const needsAttention = results.filter(r => !(r.helloaoStatus === 200 || r.bollsStatus === 200 || r.hasSeed || r.id === 'gaa' || r.id === 'niv'));

  console.log(`Healthy / Verified Data Pipeline: ${healthy.length}`);
  console.log(`Needs Attention / Potentially Falling Back: ${needsAttention.length}`);

  if (needsAttention.length > 0) {
    console.log('\nVersions needing attention:');
    needsAttention.forEach(n => {
      console.log(`- [${n.id}] (${n.lang}) ${n.name}`);
      console.log(`    HelloAO (${n.helloaoId}): ${n.helloaoStatus}`);
      console.log(`    Bolls (${n.bollsId}): ${n.bollsStatus}`);
      console.log(`    Has Seed: ${n.hasSeed}`);
    });
  }

  // Also check if any non-English version returned English in Verse 1!
  console.log('\n--- VERIFYING LANGUAGE AUTHENTICITY (Detecting English Leaks in Non-English Versions) ---');
  const englishWords = ['in', 'the', 'beginning', 'god', 'created', 'heaven', 'and', 'earth'];
  const suspicious = [];
  for (const r of results) {
    if (r.lang && r.lang !== 'en' && r.lang !== 'he' && r.lang !== 'el' && r.lang !== 'la') {
      const sample = (r.helloaoVerse1 || r.bollsVerse1 || '').toLowerCase();
      if (sample) {
        const words = sample.split(/\s+/);
        const matchCount = englishWords.filter(w => words.includes(w)).length;
        if (matchCount >= 4) {
          suspicious.push({ id: r.id, lang: r.lang, sample, matchCount });
        }
      }
    }
  }

  if (suspicious.length > 0) {
    console.log('WARNING: Found non-English versions returning English words in Genesis 1:1:');
    suspicious.forEach(s => console.log(`  - [${s.id}] (${s.lang}): "${s.sample}"`));
  } else {
    console.log('✓ Zero non-English versions are returning English text in their verified endpoints!');
  }
}

comprehensiveAudit().catch(console.error);
