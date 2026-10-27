import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'assets', 'articles');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
}

const ARTICLES_ART = [
  { slug: 'best-ad-free-bible-online', icon: '🛡️', title: 'Best Ad-Free Bible Online', subtitle: 'Distraction-Free Scripture Study in 2026', bg: '#0c0a09', accent: '#f59e0b', ring: '#10b981' },
  { slug: 'best-bible-gateway-alternative', icon: '⚡', title: 'Top Bible Gateway Alternative', subtitle: '4-Column Parallel Study · Zero Ads', bg: '#09090b', accent: '#38bdf8', ring: '#f59e0b' },
  { slug: 'best-bible-hub-alternative', icon: '🏛️', title: 'Top Bible Hub Alternative', subtitle: 'Ad-Free Interlinear & Strong’s Lexicon', bg: '#050505', accent: '#fbbf24', ring: '#6366f1' },
  { slug: 'send-the-word-out-digital-scripture-mission', icon: '🌍', title: 'Send The Word Out', subtitle: 'Global Digital Scripture Access Mission', bg: '#030712', accent: '#34d399', ring: '#fbbf24' },
  { slug: 'multilingual-parallel-bible-study', icon: '🌐', title: 'Multilingual Parallel Bible', subtitle: '35+ Global Languages Compared', bg: '#0f172a', accent: '#38bdf8', ring: '#ec4899' },
  { slug: 'youversion-vs-gateway-vs-hub', icon: '⚖️', title: 'Platform Head-to-Head 2026', subtitle: 'YouVersion vs Gateway vs Hub vs AduBible', bg: '#18181b', accent: '#f59e0b', ring: '#10b981' },
  { slug: 'strongs-exhaustive-concordance-guide', icon: '🔍', title: 'Strong’s Concordance Guide', subtitle: 'Hebrew & Greek Original Word Studies', bg: '#09090b', accent: '#fbbf24', ring: '#3b82f6' },
  { slug: 'hebrew-and-greek-interlinear-bible-study', icon: '📜', title: 'Hebrew & Greek Interlinear', subtitle: 'Original Biblical Languages Made Simple', bg: '#171717', accent: '#f59e0b', ring: '#8b5cf6' },
  { slug: 'parallel-bible-reading-methods', icon: '📖', title: 'Parallel Bible Reading Methods', subtitle: 'Comparing Scripture with Scripture', bg: '#0b0f19', accent: '#60a5fa', ring: '#f59e0b' },
  { slug: 'king-james-version-kjv-history-and-parallel-study', icon: '👑', title: 'King James Version 1611', subtitle: 'Textus Receptus & Parallel Exegesis', bg: '#140c06', accent: '#f59e0b', ring: '#d97706' },
  { slug: 'twi-bible-translation-history-and-study', icon: '🇬🇭', title: 'Asante Twi Twerɛ Kronkron', subtitle: 'History, Dialects & Akan Theology', bg: '#06170d', accent: '#10b981', ring: '#f59e0b' },
  { slug: 'matthew-henry-and-classic-bible-commentaries', icon: '✍️', title: 'Matthew Henry & Commentaries', subtitle: 'Timeless Verse-by-Verse Exegesis', bg: '#1a100a', accent: '#fbbf24', ring: '#eab308' },
  { slug: 'deuterocanon-and-biblical-apocrypha-guide', icon: '🏺', title: 'Deuterocanon & Apocrypha', subtitle: '16 Historic Sacred Books in Parallel', bg: '#150824', accent: '#c084fc', ring: '#f59e0b' },
  { slug: 'list-of-sixty-ancient-manuscripts-guide', icon: '📜', title: 'The Ancient List of Sixty', subtitle: 'Apostolic Fathers & Ancient Codices', bg: '#09151f', accent: '#38bdf8', ring: '#fbbf24' },
  { slug: 'ephesians-1-in-depth-parallel-exposition', icon: '🕊️', title: 'Ephesians 1 In-Depth Exposition', subtitle: 'Spiritual Blessings in Heavenly Places', bg: '#0c0a09', accent: '#f59e0b', ring: '#38bdf8' }
];

async function generateAllImages() {
  console.log(`[ART PIPELINE] Generating 45 bespoke Triple-Ratio WebP images in ${outputDir}...`);
  let count = 0;

  for (const art of ARTICLES_ART) {
    const ratios = [
      { suffix: '1600x900', w: 1600, h: 900, fontSizeT: 58, fontSizeS: 32 },
      { suffix: '1200x900', w: 1200, h: 900, fontSizeT: 48, fontSizeS: 28 },
      { suffix: '1200x1200', w: 1200, h: 1200, fontSizeT: 52, fontSizeS: 30 }
    ];

    for (const r of ratios) {
      const outPath = path.join(outputDir, `${art.slug}-${r.suffix}.webp`);
      const radius = Math.min(r.w, r.h) * 0.38;
      const iconSize = Math.min(r.w, r.h) * 0.12;
      const brandY = r.h * 0.22;
      const iconY = r.h * 0.40;
      const titleY = r.h * 0.58;
      const subY = r.h * 0.69;
      const badgeY = r.h * 0.82;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r.w}" height="${r.h}" viewBox="0 0 ${r.w} ${r.h}">
  <defs>
    <radialGradient id="grad-${art.slug}-${r.suffix}" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="${art.accent}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${art.bg}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="1"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="${r.w}" height="${r.h}" fill="url(#grad-${art.slug}-${r.suffix})"/>

  <!-- Ornate Sacred Concentric Rings -->
  <circle cx="${r.w/2}" cy="${iconY}" r="${radius}" fill="none" stroke="${art.accent}" stroke-width="2" opacity="0.25"/>
  <circle cx="${r.w/2}" cy="${iconY}" r="${radius * 0.85}" fill="none" stroke="${art.ring}" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.35"/>
  <circle cx="${r.w/2}" cy="${iconY}" r="${radius * 0.45}" fill="${art.bg}" stroke="${art.accent}" stroke-width="2.5" opacity="0.8"/>

  <!-- Brand Eyebrow -->
  <text x="${r.w/2}" y="${brandY}" font-family="Cinzel, Georgia, serif" font-size="${r.fontSizeS * 0.85}" font-weight="700" fill="${art.accent}" letter-spacing="5" text-anchor="middle" opacity="0.95">ADUBIBLE.ORG · SACRED STUDY SANCTUARY</text>

  <!-- Central Emblem Icon -->
  <text x="${r.w/2}" y="${iconY + iconSize * 0.38}" font-size="${iconSize}" text-anchor="middle" filter="url(#glow)">${art.icon}</text>

  <!-- Primary Headline Title -->
  <text x="${r.w/2}" y="${titleY}" font-family="Cinzel, Georgia, serif" font-weight="700" font-size="${r.fontSizeT}" fill="#ffffff" text-anchor="middle" filter="url(#glow)">${escapeXml(art.title)}</text>

  <!-- Subtitle Tagline -->
  <text x="${r.w/2}" y="${subY}" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="${r.fontSizeS}" fill="#fcd34d" text-anchor="middle" opacity="0.95">${escapeXml(art.subtitle)}</text>

  <!-- 100% Ads-Free & Sovereign Badge -->
  <g transform="translate(${r.w/2 - 190}, ${badgeY})">
    <rect width="380" height="42" rx="21" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5"/>
    <text x="190" y="27" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="${r.fontSizeS * 0.6}" fill="#34d399" text-anchor="middle" letter-spacing="2">100% ADS-FREE · MULTILINGUAL PARALLEL</text>
  </g>
</svg>`;

      await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(outPath);
      count++;
    }
  }

  console.log(`[ART PIPELINE COMPLETE] Successfully generated ${count} unique WebP images!`);
}

generateAllImages().catch(err => {
  console.error('[ART PIPELINE ERROR]', err);
  process.exit(1);
});
