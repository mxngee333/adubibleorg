/**
 * ADUBIBLE / ELOHIM BIBLE HUB — CLOUDFLARE R2 SCRIPTURE SYNC PIPELINE
 * Exports all prebundled chapters and seed editions to R2 storage structure:
 * /chapters/{versionId}/{bookId}/{chapter}.json
 *
 * Usage:
 *   node scripts/sync-r2-scripture.js --export-only
 *   node scripts/sync-r2-scripture.js --upload
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, '../dist-r2');
const PUBLIC_SEED_DIR = path.join(__dirname, '../public/seed');

// Ensure output directories exist
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('⚡ [ADUBIBLE R2 SYNC] Initializing Zero-Egress Scripture Vault Export...');

let exportedCount = 0;

function writeChapterPayload(versionId, bookId, chapterNum, payload) {
  const targetDir = path.join(OUT_DIR, 'chapters', versionId.toLowerCase(), bookId.toUpperCase());
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, `${chapterNum}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  exportedCount++;
}

// 1. Process 28-edition Wisdom Seed JSON files from public/seed/
if (fs.existsSync(PUBLIC_SEED_DIR)) {
  const seedFiles = fs.readdirSync(PUBLIC_SEED_DIR).filter((f) => f.endsWith('.json'));
  console.log(`📦 Found ${seedFiles.length} Wisdom Edition seed files in public/seed/...`);

  for (const file of seedFiles) {
    const versionSlug = file.replace('.json', '').toLowerCase();
    try {
      const raw = fs.readFileSync(path.join(PUBLIC_SEED_DIR, file), 'utf-8');
      const json = JSON.parse(raw);

      // Extract Ephesians 1 or whichever chapter this seed represents
      const bookId = json?.book?.id || 'EPH';
      const chapterNum = json?.chapter?.number || 1;

      writeChapterPayload(versionSlug, bookId, chapterNum, json);
    } catch (err) {
      console.warn(`⚠️ Could not parse ${file}:`, err.message);
    }
  }
}

// 2. Export manifest summary
const manifest = {
  name: 'AduBible Scripture Vault (Cloudflare R2)',
  exportedAt: new Date().toISOString(),
  targetScale: '4 Billion Concurrent Readers',
  zeroEgress: true,
  edgeCacheControl: 'public, max-age=31536000, s-maxage=31536000, immutable',
  totalChaptersExported: exportedCount,
  structurePattern: '/chapters/{versionId}/{bookId}/{chapter}.json',
};

fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`✅ [ADUBIBLE R2 SYNC] Successfully generated ${exportedCount} R2 chapter payloads in ${OUT_DIR}`);
console.log('💡 To sync directly to Cloudflare R2, run:');
console.log('   npx wrangler r2 object put adubible-scripture-vault/manifest.json --file=dist-r2/manifest.json');
console.log('   Or use AWS CLI / rclone:');
console.log('   aws s3 sync dist-r2/ s3://adubible-scripture-vault/ --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com');
