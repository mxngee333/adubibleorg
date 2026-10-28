async function testExtract(versionId, usfm, label) {
  const url = `https://www.bible.com/bible/${versionId}/${usfm}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  const strippedText = text.replace(/<span class="[^"]*note[^"]*"[\s\S]*?<\/span>\s*<\/span>/gi, '');
  const [b, c] = usfm.split('.');
  const reg = new RegExp(`data-usfm="${b}\\.${c}\\.1"[^>]*>([\\s\\S]*?)(?=<span class="[^"]*verse" data-usfm="${b}\\.${c}\\.|\\<\\/div\\>|$)`, 'gi');
  const m = reg.exec(strippedText);
  if (m) {
    const contentMatches = [...m[1].matchAll(/class="[^"]*content"[^>]*>([\s\S]*?)<\/span>/gi)];
    const cleanVerse = contentMatches.map(cm => cm[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
    console.log(`[${label}] ${usfm} => "${cleanVerse.substring(0, 80)}"`);
  } else {
    console.log(`[${label}] ${usfm} => NOT FOUND (status: ${res.status})`);
  }
}

async function run() {
  await testExtract('1260', 'GEN.1', 'Amharic 1260');
  await testExtract('1260', 'EPH.1', 'Amharic 1260');
  await testExtract('286', 'GEN.1', 'Zulu 286');
  await testExtract('286', 'EPH.1', 'Zulu 286');
}

run().catch(console.error);
