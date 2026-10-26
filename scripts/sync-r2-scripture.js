/**
 * ADUBIBLE / ELOHIM BIBLE HUB — CLOUDFLARE R2 SCRIPTURE SYNC PIPELINE
 * Exports and uploads chapters directly to Cloudflare R2:
 * Bucket: adubible
 * Account: 2beae38bec708c3da9dee9f12c68cad8
 *
 * Usage:
 *   node scripts/sync-r2-scripture.js --export-only
 *   node scripts/sync-r2-scripture.js --upload
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, '../dist-r2');
const PUBLIC_SEED_DIR = path.join(__dirname, '../public/seed');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '2beae38bec708c3da9dee9f12c68cad8';
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'adubible';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

const shouldUpload = process.argv.includes('--upload') || Boolean(API_TOKEN);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('⚡ [ADUBIBLE R2 SYNC] Initializing Zero-Egress Scripture Vault Export...');
console.log(`📦 Cloudflare Account: ${ACCOUNT_ID} | Bucket: ${BUCKET_NAME}`);
if (shouldUpload) {
  console.log(`🚀 Automated Cloudflare R2 Direct Upload: ENABLED`);
} else {
  console.log(`📁 Local Export Mode Only (Pass --upload to sync to R2)`);
}

let exportedCount = 0;
let uploadedCount = 0;
const uploadQueue = [];

function writeChapterPayload(versionId, bookId, chapterNum, payload) {
  const targetDir = path.join(OUT_DIR, 'chapters', versionId.toLowerCase(), bookId.toUpperCase());
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, `${chapterNum}.json`);
  const content = JSON.stringify(payload, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');
  exportedCount++;

  const r2Key = `chapters/${versionId.toLowerCase()}/${bookId.toUpperCase()}/${chapterNum}.json`;
  uploadQueue.push({ key: r2Key, content });
}

// 1. Process 28-edition Wisdom Seed JSON files from public/seed/
if (fs.existsSync(PUBLIC_SEED_DIR)) {
  const seedFiles = fs.readdirSync(PUBLIC_SEED_DIR).filter((f) => f.endsWith('.json'));
  console.log(`📖 Processing ${seedFiles.length} Wisdom Edition seed files...`);

  for (const file of seedFiles) {
    const versionSlug = file.replace('.json', '').toLowerCase();
    try {
      const raw = fs.readFileSync(path.join(PUBLIC_SEED_DIR, file), 'utf-8');
      const json = JSON.parse(raw);

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

const manifestJson = JSON.stringify(manifest, null, 2);
fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), manifestJson, 'utf-8');
uploadQueue.push({ key: 'manifest.json', content: manifestJson });

console.log(`✅ [ADUBIBLE R2 SYNC] Generated ${exportedCount} R2 chapter payloads locally in ${OUT_DIR}`);

// 3. Automated Direct Upload to Cloudflare R2
async function executeUploads() {
  if (!shouldUpload || !API_TOKEN) {
    console.log('ℹ️ Upload skipped. Set CLOUDFLARE_API_TOKEN in .env or pass --upload to sync.');
    return;
  }

  console.log(`\n🚀 Uploading ${uploadQueue.length} files to Cloudflare R2 (${BUCKET_NAME})...`);

  for (const item of uploadQueue) {
    try {
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${item.key}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        },
        body: item.content,
      });

      if (res.ok) {
        uploadedCount++;
        process.stdout.write(`\r✅ Uploaded ${uploadedCount}/${uploadQueue.length}: ${item.key}`);
      } else {
        const errText = await res.text();
        console.warn(`\n⚠️ Upload failed for ${item.key}: HTTP ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.warn(`\n⚠️ Network error uploading ${item.key}:`, err.message);
    }
  }

  console.log(`\n\n🎉 [ADUBIBLE R2 SYNC] Successfully uploaded ${uploadedCount}/${uploadQueue.length} items to Cloudflare R2!`);
  console.log(`🌐 R2 Scripture Vault is now live on Cloudflare for 4 Billion Readers.`);
}

executeUploads();
