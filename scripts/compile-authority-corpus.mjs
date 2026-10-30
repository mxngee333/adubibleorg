import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// 1. Read topVersesCorpus.ts and extract TOP_VERSES_CORPUS
const topVersesTs = fs.readFileSync(path.join(root, 'src', 'data', 'topVersesCorpus.ts'), 'utf-8');
const versesMatch = topVersesTs.match(/export const TOP_VERSES_CORPUS:\s*TopVerseEntry\[\]\s*=\s*(\[[\s\S]*?\]);\s*export function/);

if (versesMatch) {
  try {
    // Safely evaluate array literal using Function
    const fn = new Function(`return ${versesMatch[1]}`);
    const data = fn();
    fs.writeFileSync(
      path.join(root, 'src', 'data', 'topVersesCorpus.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`✅ [AUTHORITY CORPUS] Wrote ${data.length} top verses to topVersesCorpus.json`);
  } catch (err) {
    console.error('Failed to parse TOP_VERSES_CORPUS:', err);
  }
}

// 2. Read topicalScriptureCorpus.ts and extract TOPICAL_HUBS_CORPUS
const topicalTs = fs.readFileSync(path.join(root, 'src', 'data', 'topicalScriptureCorpus.ts'), 'utf-8');
const topicalMatch = topicalTs.match(/export const TOPICAL_HUBS_CORPUS:\s*TopicalHubEntry\[\]\s*=\s*(\[[\s\S]*?\]);\s*export function/);

if (topicalMatch) {
  try {
    const fn = new Function(`return ${topicalMatch[1]}`);
    const data = fn();
    fs.writeFileSync(
      path.join(root, 'src', 'data', 'topicalScriptureCorpus.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`✅ [AUTHORITY CORPUS] Wrote ${data.length} topical hubs to topicalScriptureCorpus.json`);
  } catch (err) {
    console.error('Failed to parse TOPICAL_HUBS_CORPUS:', err);
  }
}

// 3. Read strongsLexicon.ts and extract STRONGS_DICTIONARY
const strongsTs = fs.readFileSync(path.join(root, 'src', 'data', 'strongsLexicon.ts'), 'utf-8');
const strongsMatch = strongsTs.match(/export const STRONGS_DICTIONARY:\s*Record<string,\s*StrongsLexiconEntry>\s*=\s*(\{[\s\S]*?\n\};)/);

if (strongsMatch) {
  try {
    const fn = new Function(`return ${strongsMatch[1]}`);
    const data = fn();
    fs.writeFileSync(
      path.join(root, 'src', 'data', 'strongsLexicon.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`✅ [AUTHORITY CORPUS] Wrote ${Object.keys(data).length} Strong's lexicon entries to strongsLexicon.json`);
  } catch (err) {
    console.error('Failed to parse STRONGS_DICTIONARY:', err);
  }
}
