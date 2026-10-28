const fs = require('fs');

const extracted = JSON.parse(fs.readFileSync('scripts/extracted-vernacular.json', 'utf8'));
let corpus = fs.readFileSync('src/data/featuredChaptersCorpus.ts', 'utf8');

function formatArray(arr, indent = '    ') {
  return '[\n' + arr.map(v => `${indent}${JSON.stringify(v)},`).join('\n') + `\n  ],`;
}

// 1. Inject into EPHESIANS_1_RAW
console.log('Injecting Ephesians 1...');
const ephTarget = '  ha: [';
const ephReplacement = `  ee: ${formatArray(extracted.ewe.ephesians_1)}\n  gaa: ${formatArray(extracted.ga.ephesians_1)}\n  ha: [`;
if (!corpus.includes('ee: [') || !corpus.includes('gaa: [')) {
  corpus = corpus.replace(ephTarget, ephReplacement);
}

// 2. Inject into GENESIS_1_RAW
console.log('Injecting Genesis 1...');
const genTarget = `const GENESIS_1_RAW: Record<string, string[]> = {\n  nkjv: [`;
const genReplacement = `const GENESIS_1_RAW: Record<string, string[]> = {\n  ee: ${formatArray(extracted.ewe.genesis_1)}\n  gaa: ${formatArray(extracted.ga.genesis_1)}\n  nkjv: [`;
corpus = corpus.replace(genTarget, genReplacement);

// 3. Inject into PSALM_23_RAW
console.log('Injecting Psalm 23...');
const psaTarget = `const PSALM_23_RAW: Record<string, string[]> = {\n  nkjv: [`;
const psaReplacement = `const PSALM_23_RAW: Record<string, string[]> = {\n  ee: ${formatArray(extracted.ewe.psalm_23)}\n  gaa: ${formatArray(extracted.ga.psalm_23)}\n  nkjv: [`;
corpus = corpus.replace(psaTarget, psaReplacement);

// 4. Inject into JOHN_1_RAW
console.log('Injecting John 1...');
const jhn1Target = `const JOHN_1_RAW: Record<string, string[]> = {\n  nkjv: [`;
const jhn1Replacement = `const JOHN_1_RAW: Record<string, string[]> = {\n  ee: ${formatArray(extracted.ewe.john_1)}\n  gaa: ${formatArray(extracted.ga.john_1)}\n  nkjv: [`;
corpus = corpus.replace(jhn1Target, jhn1Replacement);

// 5. Inject into JOHN_3_RAW
console.log('Injecting John 3...');
const jhn3Target = `const JOHN_3_RAW: Record<string, string[]> = {\n  nkjv: [`;
const jhn3Replacement = `const JOHN_3_RAW: Record<string, string[]> = {\n  ee: ${formatArray(extracted.ewe.john_3)}\n  gaa: ${formatArray(extracted.ga.john_3)}\n  nkjv: [`;
corpus = corpus.replace(jhn3Target, jhn3Replacement);

// 6. Inject into ROMANS_8_RAW
console.log('Injecting Romans 8...');
const romTarget = `const ROMANS_8_RAW: Record<string, string[]> = {\n  nkjv: [`;
const romReplacement = `const ROMANS_8_RAW: Record<string, string[]> = {\n  ee: ${formatArray(extracted.ewe.romans_8)}\n  gaa: ${formatArray(extracted.ga.romans_8)}\n  nkjv: [`;
corpus = corpus.replace(romTarget, romReplacement);

// 7. Update getPrebundledChapter and adaptVerseToLanguage
console.log('Updating resolution logic...');
const targetBaseArray = `  const baseArray =
    chMap[cleanVer] ||
    chMap[langCode] ||
    (langCode === 'ak' ? chMap['ak-twi'] || chMap['twi'] : undefined) ||`;

const replacementBaseArray = `  const baseArray =
    chMap[cleanVer] ||
    chMap[langCode] ||
    (langCode === 'ee' || cleanVer === 'ee' ? chMap['ee'] : undefined) ||
    (langCode === 'gaa' || cleanVer === 'gaa' ? chMap['gaa'] : undefined) ||
    (langCode === 'ak' ? chMap['ak-twi'] || chMap['twi'] : undefined) ||`;

corpus = corpus.replace(targetBaseArray, replacementBaseArray);

const targetAdapt = `    if (cleanVer === 'ak-twi' && chMap['twi']?.[verse - 1]) {`;
const replacementAdapt = `    if ((cleanVer === 'ee' || cleanVer === 'ewe') && chMap['ee']?.[verse - 1]) {
      return chMap['ee'][verse - 1];
    }
    if ((cleanVer === 'gaa' || cleanVer === 'ga') && chMap['gaa']?.[verse - 1]) {
      return chMap['gaa'][verse - 1];
    }
    if (cleanVer === 'ak-twi' && chMap['twi']?.[verse - 1]) {`;

corpus = corpus.replace(targetAdapt, replacementAdapt);

fs.writeFileSync('src/data/featuredChaptersCorpus.ts', corpus, 'utf8');
console.log('Successfully injected all authentic Ewe and Ga scripture arrays!');
