const fs = require('fs');

function extractVersions() {
  const content = fs.readFileSync('src/data/languagesRegistry.ts', 'utf8');
  const startIdx = content.indexOf('export const BIBLE_VERSIONS: BibleVersion[] = [');
  const endIdx = content.indexOf('];', startIdx);
  const arrayText = content.substring(startIdx + 'export const BIBLE_VERSIONS: BibleVersion[] = ['.length, endIdx);

  const chunks = arrayText.split(/\n\s*\{\s*\n/);
  const versions = [];
  for (const chunk of chunks) {
    if (!chunk.trim()) continue;
    const getVal = (prop) => {
      const m = chunk.match(new RegExp(`${prop}:\\s*'([^']+)'`));
      return m ? m[1] : null;
    };
    const id = getVal('id');
    if (!id) continue;
    versions.push({
      id,
      shortCode: getVal('shortCode'),
      name: getVal('name'),
      langCode: getVal('langCode'),
      helloaoId: getVal('helloaoId'),
      bollsId: getVal('bollsId')
    });
  }
  return versions;
}

async function testAll() {
  const versions = extractVersions();
  console.log(`Starting Live Verification of all ${versions.length} versions...\n`);

  const results = [];

  for (const v of versions) {
    let helloaoStatus = 'none';
    let helloaoVerse = '';
    if (v.helloaoId) {
      try {
        const res = await fetch(`https://bible.helloao.org/api/${encodeURIComponent(v.helloaoId)}/GEN/1.json`);
        helloaoStatus = res.status;
        if (res.ok) {
          const data = await res.json();
          const v1 = data.chapter?.content?.find(c => c.type === 'verse');
          if (v1 && v1.content) {
            helloaoVerse = v1.content.map(c => typeof c === 'string' ? c : (c.text || '')).join(' ').trim();
          }
        }
      } catch (e) {
        helloaoStatus = e.message;
      }
    }

    let bollsStatus = 'none';
    let bollsVerse = '';
    if (v.bollsId) {
      try {
        const res = await fetch(`https://bolls.life/get-text/${encodeURIComponent(v.bollsId)}/1/1/`);
        bollsStatus = res.status;
        if (res.ok) {
          const arr = await res.json();
          if (Array.isArray(arr) && arr[0]?.text) {
            bollsVerse = String(arr[0].text).replace(/<[^>]+>/g, '').trim();
          }
        }
      } catch (e) {
        bollsStatus = e.message;
      }
    }

    results.push({
      id: v.id,
      lang: v.langCode,
      name: v.name,
      helloaoId: v.helloaoId,
      helloaoStatus,
      helloaoVerse: helloaoVerse.substring(0, 80),
      bollsId: v.bollsId,
      bollsStatus,
      bollsVerse: bollsVerse.substring(0, 80)
    });

    console.log(`[${v.id}] (${v.langCode}) -> HelloAO: ${helloaoStatus} ${helloaoVerse ? '✓' : ''} | Bolls: ${bollsStatus} ${bollsVerse ? '✓' : ''}`);
  }

  fs.writeFileSync('scripts/live-test-results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\nAudit complete! Saved to scripts/live-test-results.json');
}

testAll().catch(console.error);
