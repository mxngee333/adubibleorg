import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legalSourceFile = path.join(root, 'src', 'data', 'legalPagesCorpus.ts');
const targetJson = path.join(root, 'src', 'data', 'legalPagesCorpus.json');

// Read TypeScript file and extract LEGAL_PAGES_CORPUS
const tsContent = fs.readFileSync(legalSourceFile, 'utf8');
const match = tsContent.match(/export const LEGAL_PAGES_CORPUS:\s*Record<string,\s*LegalPageData>\s*=\s*(\{[\s\S]*?\n\};)/);

if (!match) {
  console.error('Failed to locate LEGAL_PAGES_CORPUS in legalPagesCorpus.ts');
  process.exit(1);
}

// Evaluate cleanly into JSON
const rawObjectCode = match[1].replace(/;\s*$/, '');
const legalObject = eval(`(${rawObjectCode})`);

fs.writeFileSync(targetJson, JSON.stringify(legalObject, null, 2), 'utf8');
console.log(`[LEGAL CORPUS COMPILED] Successfully wrote ${Object.keys(legalObject).length} legal pages to ${targetJson}`);
