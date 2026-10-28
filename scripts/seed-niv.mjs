import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const NIV_DIR = path.join(PROJECT_ROOT, 'public', 'seed', 'niv');

const BOOKS = [
  { name: 'Genesis', slug: 'genesis' },
  { name: 'Exodus', slug: 'exodus' },
  { name: 'Leviticus', slug: 'leviticus' },
  { name: 'Numbers', slug: 'numbers' },
  { name: 'Deuteronomy', slug: 'deuteronomy' },
  { name: 'Joshua', slug: 'joshua' },
  { name: 'Judges', slug: 'judges' },
  { name: 'Ruth', slug: 'ruth' },
  { name: '1 Samuel', slug: '1-samuel' },
  { name: '2 Samuel', slug: '2-samuel' },
  { name: '1 Kings', slug: '1-kings' },
  { name: '2 Kings', slug: '2-kings' },
  { name: '1 Chronicles', slug: '1-chronicles' },
  { name: '2 Chronicles', slug: '2-chronicles' },
  { name: 'Ezra', slug: 'ezra' },
  { name: 'Nehemiah', slug: 'nehemiah' },
  { name: 'Esther', slug: 'esther' },
  { name: 'Job', slug: 'job' },
  { name: 'Psalms', slug: 'psalms' },
  { name: 'Proverbs', slug: 'proverbs' },
  { name: 'Ecclesiastes', slug: 'ecclesiastes' },
  { name: 'Song Of Solomon', slug: 'song-of-solomon' },
  { name: 'Isaiah', slug: 'isaiah' },
  { name: 'Jeremiah', slug: 'jeremiah' },
  { name: 'Lamentations', slug: 'lamentations' },
  { name: 'Ezekiel', slug: 'ezekiel' },
  { name: 'Daniel', slug: 'daniel' },
  { name: 'Hosea', slug: 'hosea' },
  { name: 'Joel', slug: 'joel' },
  { name: 'Amos', slug: 'amos' },
  { name: 'Obadiah', slug: 'obadiah' },
  { name: 'Jonah', slug: 'jonah' },
  { name: 'Micah', slug: 'micah' },
  { name: 'Nahum', slug: 'nahum' },
  { name: 'Habakkuk', slug: 'habakkuk' },
  { name: 'Zephaniah', slug: 'zephaniah' },
  { name: 'Haggai', slug: 'haggai' },
  { name: 'Zechariah', slug: 'zechariah' },
  { name: 'Malachi', slug: 'malachi' },
  { name: 'Matthew', slug: 'matthew' },
  { name: 'Mark', slug: 'mark' },
  { name: 'Luke', slug: 'luke' },
  { name: 'John', slug: 'john' },
  { name: 'Acts', slug: 'acts' },
  { name: 'Romans', slug: 'romans' },
  { name: '1 Corinthians', slug: '1-corinthians' },
  { name: '2 Corinthians', slug: '2-corinthians' },
  { name: 'Galatians', slug: 'galatians' },
  { name: 'Ephesians', slug: 'ephesians' },
  { name: 'Philippians', slug: 'philippians' },
  { name: 'Colossians', slug: 'colossians' },
  { name: '1 Thessalonians', slug: '1-thessalonians' },
  { name: '2 Thessalonians', slug: '2-thessalonians' },
  { name: '1 Timothy', slug: '1-timothy' },
  { name: '2 Timothy', slug: '2-timothy' },
  { name: 'Titus', slug: 'titus' },
  { name: 'Philemon', slug: 'philemon' },
  { name: 'Hebrews', slug: 'hebrews' },
  { name: 'James', slug: 'james' },
  { name: '1 Peter', slug: '1-peter' },
  { name: '2 Peter', slug: '2-peter' },
  { name: '1 John', slug: '1-john' },
  { name: '2 John', slug: '2-john' },
  { name: '3 John', slug: '3-john' },
  { name: 'Jude', slug: 'jude' },
  { name: 'Revelation', slug: 'revelation' },
];

async function seedNiv() {
  if (!fs.existsSync(NIV_DIR)) {
    fs.mkdirSync(NIV_DIR, { recursive: true });
  }

  console.log(`⚡ [NIV Seed Engine] Seeding ${BOOKS.length} books of authentic NIV Scripture...`);

  let downloadedCount = 0;
  for (const b of BOOKS) {
    const dest = path.join(NIV_DIR, `${b.slug}.json`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      downloadedCount++;
      continue;
    }

    const encName = encodeURIComponent(b.name);
    const url = `https://raw.githubusercontent.com/aruljohn/Bible-niv/master/${encName}.json`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      const raw = await res.json();
      
      // Normalize raw format: { book: "...", chapters: [ { chapter: "1", verses: [ { verse: "1", text: "..." } ] } ] }
      const normalized = {
        book: b.name,
        slug: b.slug,
        chapters: (raw.chapters || []).map((ch) => ({
          chapter: Number(ch.chapter),
          verses: (ch.verses || []).map((v) => ({
            verse: Number(v.verse),
            text: String(v.text || '').replace(/\s+/g, ' ').trim(),
          })),
        })),
      };

      fs.writeFileSync(dest, JSON.stringify(normalized), 'utf-8');
      downloadedCount++;
      console.log(`✓ [NIV] Seeded ${b.slug} (${normalized.chapters.length} chapters, ${fs.statSync(dest).size} bytes)`);
    } catch (err) {
      console.error(`❌ Failed to seed ${b.slug}:`, err.message);
    }
  }

  // Create manifest
  const manifest = BOOKS.map((b) => ({
    name: b.name,
    slug: b.slug,
    path: `/seed/niv/${b.slug}.json`,
  }));
  fs.writeFileSync(path.join(NIV_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`🎉 [NIV Seed Engine] Completed: ${downloadedCount}/${BOOKS.length} books ready in public/seed/niv/`);
}

seedNiv().catch((err) => {
  console.error('Fatal NIV Seed error:', err);
  process.exit(1);
});
