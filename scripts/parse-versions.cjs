const fs = require('fs');

function extractVersions() {
  const content = fs.readFileSync('src/data/languagesRegistry.ts', 'utf8');
  const startIdx = content.indexOf('export const BIBLE_VERSIONS: BibleVersion[] = [');
  const endIdx = content.indexOf('];', startIdx);
  const arrayText = content.substring(startIdx + 'export const BIBLE_VERSIONS: BibleVersion[] = ['.length, endIdx);

  // Split by "  {"
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

const vList = extractVersions();
console.log('Total extracted:', vList.length);
console.log('Versions:', vList.map(v => `${v.id} (${v.langCode}) -> helloao: ${v.helloaoId}, bolls: ${v.bollsId}`));
