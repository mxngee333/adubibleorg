async function inspectScript() {
  const url = 'https://www.bible.com/bible/2205/GEN.1.NEGAB';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const text = await res.text();
  const scripts = [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scripts) {
    if (s[1].includes('"versionId":"2205"')) {
      console.log('Script length:', s[1].length);
      // Let's unescape and look for chapter content
      const unescaped = s[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\u003c/g, '<').replace(/\\u003e/g, '>');
      console.log('Snippet:', unescaped.substring(0, 1500));
    }
  }
}
inspectScript().catch(console.error);
