const fs = require('fs');

async function getEweChapter(book, ch) {
  const url = `https://bible.helloao.org/api/ewe_bib/${book}/${ch}.json`;
  const res = await fetch(url);
  const data = await res.json();
  const verses = [];
  for (const item of data.chapter.content) {
    if (item.type === 'verse') {
      const text = item.content.map(c => typeof c === 'string' ? c : (c.text || '')).join(' ').replace(/\s+/g, ' ').trim();
      verses.push(text);
    }
  }
  return { fullPayload: data, verses };
}

async function getGaChapter(bookUsfm, chapter) {
  const url = `https://www.bible.com/bible/2708/${bookUsfm}.${chapter}.NEGAB`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  
  const strippedText = text.replace(/<span class="[^"]*note[^"]*"[\s\S]*?<\/span>\s*<\/span>/gi, '');
  const regex = new RegExp(`data-usfm="${bookUsfm}\\.${chapter}\\.(\\d+)"[^>]*>([\\s\\S]*?)(?=<span class="[^"]*verse" data-usfm="${bookUsfm}\\.${chapter}\\.|\\<\\/div\\>|$)`, 'gi');
  
  const verseMap = {};
  let match;
  while ((match = regex.exec(strippedText)) !== null) {
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
  const count = Math.max(...Object.keys(verseMap).map(Number));
  const arr = [];
  for (let i = 1; i <= count; i++) {
    arr.push(verseMap[i] || '');
  }
  return arr;
}

async function generateData() {
  console.log('Fetching Ewe chapters...');
  const ephEwe = await getEweChapter('EPH', 1);
  const genEwe = await getEweChapter('GEN', 1);
  const psaEwe = await getEweChapter('PSA', 23);
  const jhn1Ewe = await getEweChapter('JHN', 1);
  const jhn3Ewe = await getEweChapter('JHN', 3);
  const romEwe = await getEweChapter('ROM', 8);

  console.log('Fetching Ga chapters...');
  const ephGa = await getGaChapter('EPH', 1);
  const genGa = await getGaChapter('GEN', 1);
  const psaGa = await getGaChapter('PSA', 23);
  const jhn1Ga = await getGaChapter('JHN', 1);
  const jhn3Ga = await getGaChapter('JHN', 3);
  const romGa = await getGaChapter('ROM', 8);

  console.log('Saving seed files...');
  fs.writeFileSync('public/seed/ewe_bib.json', JSON.stringify(ephEwe.fullPayload, null, 2), 'utf8');

  // Create authentic Ga Ephesians 1 seed
  const gaaPayload = {
    translation: {
      id: 'gaa_bible',
      name: 'Ŋmalɛ Krɔŋkrɔŋ Lɛ (Ga Bible)',
      language: 'gaa',
      languageName: 'Ga',
      website: 'https://biblesociety-ghana.org',
      licenseUrl: 'https://biblesociety-ghana.org',
      shortName: 'NEGAB',
      englishName: 'Ga Bible (NEGAB)'
    },
    book: {
      id: 'EPH',
      name: 'Efeso',
      commonName: 'Efesobii'
    },
    chapter: {
      number: 1,
      content: ephGa.map((text, idx) => ({
        type: 'verse',
        number: idx + 1,
        content: [text]
      }))
    },
    numberOfVerses: ephGa.length
  };
  fs.writeFileSync('public/seed/gaa_bible.json', JSON.stringify(gaaPayload, null, 2), 'utf8');
  fs.writeFileSync('public/seed/gaa.json', JSON.stringify(gaaPayload, null, 2), 'utf8');

  // Output all arrays into a JSON file so we can easily inspect and inject into featuredChaptersCorpus.ts
  const output = {
    ewe: {
      ephesians_1: ephEwe.verses,
      genesis_1: genEwe.verses,
      psalm_23: psaEwe.verses,
      john_1: jhn1Ewe.verses,
      john_3: jhn3Ewe.verses,
      romans_8: romEwe.verses,
    },
    ga: {
      ephesians_1: ephGa,
      genesis_1: genGa,
      psalm_23: psaGa,
      john_1: jhn1Ga,
      john_3: jhn3Ga,
      romans_8: romGa,
    }
  };

  fs.writeFileSync('scripts/extracted-vernacular.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('Finished successfully!');
  console.log('Ewe counts:', Object.fromEntries(Object.entries(output.ewe).map(([k, v]) => [k, v.length])));
  console.log('Ga counts:', Object.fromEntries(Object.entries(output.ga).map(([k, v]) => [k, v.length])));
}

generateData().catch(console.error);
