const fs = require('fs');

async function extractYouVersionEphesians(versionId, langCode, langName, shortCode) {
  const url = `https://www.bible.com/bible/${versionId}/EPH.1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  const strippedText = text.replace(/<span class="[^"]*note[^"]*"[\s\S]*?<\/span>\s*<\/span>/gi, '');
  const reg = new RegExp(`data-usfm="EPH\\.1\\.(\\d+)"[^>]*>([\\s\\S]*?)(?=<span class="[^"]*verse" data-usfm="EPH\\.1\\.|\\<\\/div\\>|$)`, 'gi');
  
  const verseMap = {};
  let match;
  while ((match = reg.exec(strippedText)) !== null) {
    const vNum = parseInt(match[1]);
    const segment = match[2];
    const contentMatches = [...segment.matchAll(/class="[^"]*content"[^>]*>([\s\S]*?)<\/span>/gi)];
    const cleanVerse = contentMatches
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanVerse) {
      if (!verseMap[vNum]) {
        verseMap[vNum] = cleanVerse;
      } else if (!verseMap[vNum].includes(cleanVerse)) {
        verseMap[vNum] += ' ' + cleanVerse;
      }
    }
  }

  const keys = Object.keys(verseMap).map(Number).sort((a, b) => a - b);
  return {
    translation: {
      id: `${langCode}_bible`,
      name: `${langName} Holy Bible`,
      language: langCode,
      languageName: langName,
      shortName: shortCode
    },
    book: {
      id: 'EPH',
      name: 'Ephesians'
    },
    chapter: {
      number: 1,
      content: keys.map(k => ({
        type: 'verse',
        number: k,
        content: [verseMap[k]]
      }))
    },
    numberOfVerses: keys.length
  };
}

async function main() {
  console.log('--- DEPLOYING COMPREHENSIVE SEEDS ---');

  // 1. Igbo (ibo_bib)
  console.log('Fetching Igbo (ibo_bib) seed...');
  const igRes = await fetch('https://bible.helloao.org/api/ibo_bib/EPH/1.json');
  if (igRes.ok) {
    const igData = await igRes.json();
    fs.writeFileSync('public/seed/ibo_bib.json', JSON.stringify(igData, null, 2), 'utf8');
    console.log('✓ Saved public/seed/ibo_bib.json');
  }

  // 2. Amharic (1260)
  console.log('Fetching Amharic (1260) seed...');
  const amData = await extractYouVersionEphesians('1260', 'am', 'Amharic', 'NASV');
  fs.writeFileSync('public/seed/am.json', JSON.stringify(amData, null, 2), 'utf8');
  fs.writeFileSync('public/seed/amh.json', JSON.stringify(amData, null, 2), 'utf8');
  console.log(`✓ Saved public/seed/am.json (${amData.numberOfVerses} verses)`);

  // 3. Zulu (286)
  console.log('Fetching Zulu (286) seed...');
  const zuData = await extractYouVersionEphesians('286', 'zu', 'isiZulu', 'ZUL59');
  fs.writeFileSync('public/seed/zu.json', JSON.stringify(zuData, null, 2), 'utf8');
  fs.writeFileSync('public/seed/zul.json', JSON.stringify(zuData, null, 2), 'utf8');
  console.log(`✓ Saved public/seed/zu.json (${zuData.numberOfVerses} verses)`);

  console.log('All missing seeds deployed successfully!');
}

main().catch(console.error);
