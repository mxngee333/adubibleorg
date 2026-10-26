import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://adubible.org';
const DIST_DIR = path.join(__dirname, 'dist');
const TODAY = new Date().toISOString().slice(0, 10);

const CANONICAL_ROUTES = [
  {
    route: '/',
    priority: '1.0',
    changefreq: 'weekly',
    title: "AduBible — Ad-Free Multilingual Parallel Bible, Twi (Twerɛ Kronkron), Strong's Concordance & Study Sync | Adubible.org",
    description:
      "Read the Holy Bible in parallel across Asante Twi (Twerɛ Kronkron), NKJV, KJV, Hebrew, Greek, and 35+ world languages on AduBible. Dedicated to the Legacy of Apostle Kwame Adu (Nushia, Ghana). Features Strong's Exhaustive Concordance and Cloud Study Sync with zero ads.",
    heading: 'AduBible — Multilingual Parallel Scripture & Exegetical Study Sanctuary',
    excerpt:
      'Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ (Ephesians 1:3) • Nhyira nka yɛn Awurade Yesu Kristo Nyankopɔn ne Agya a ɔnam Kristo so ahyira yɛn honhom mu nhyira nyinaa wɔ soro hɔnom (Efesofoɔ 1:3). Honoring the Legacy of Apostle Kwame Adu · Nushia, Ghana.',
  },
  {
    route: '/nkjv/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Ephesians 1 NKJV & Asante Twi Parallel Bible — Strong's Concordance & Matthew Henry Commentary | AduBible",
    description:
      "Study Ephesians Chapter 1 ( verses 1–23 ) in NKJV, KJV, Asante Twi (Efesofoɔ 1), and Original Greek Interlinear with Strong's numbers (G2128 eulogētos, G4309 proorizō) and Matthew Henry Commentary on AduBible.",
    heading: 'Ephesians Chapter 1 (Efesofoɔ 1) — Parallel Study, Greek Interlinear & Commentaries',
    excerpt:
      'Paul, an apostle of Jesus Christ by the will of God, To the saints who are in Ephesus, and faithful in Christ Jesus: Grace to you and peace from God our Father and the Lord Jesus Christ. Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.',
  },
  {
    route: '/twi/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Efesofoɔ 1 — Asante Twi Bible (Twerɛ Kronkron) & English Parallel Study | AduBible',
    description:
      'Kenkan Efesofoɔ Ti 1 (Ephesians 1) wɔ Asante Twi Twerɛ Kronkron ne Borɔfo (NKJV/KJV) mu. Read Asante Twi and Akuapem Twi Scripture side-by-side with Strong’s Lexicon and study notes on AduBible.',
    heading: 'Efesofoɔ Ti 1 (Asante Twi Twerɛ Kronkron) — Parallel Bible Study',
    excerpt:
      'Paulo, Yesu Kristo somafoɔ a ɛnam Onyankopɔn pɛ so, de kɔma akronkronfoɔ a wɔwɔ Efeso ne Kristo Yesu mu agyidifoɔ: Adom ne asomdwoeɛ a efi yɛn Agya Onyankopɔn ne Awurade Yesu Kristo nka mo.',
  },
  {
    route: '/kjv/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Ephesians 1 KJV with Strong's Concordance & Parallel Twi | AduBible",
    description:
      "Read Ephesians 1 in the Authorized King James Version (KJV) alongside Asante Twi, Greek Textus Receptus, and Strong's Exhaustive Concordance on AduBible.",
    heading: 'Ephesians Chapter 1 (KJV 1769) — Exhaustive Strong’s Concordance Edition',
    excerpt:
      'Blessed be the God and Father of our Lord Jesus Christ, who hath blessed us with all spiritual blessings in heavenly places in Christ: According as he hath chosen us in him before the foundation of the world.',
  },
  {
    route: '/parallel/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Ephesians 1 Multi-Language Parallel Bible (NKJV, Twi, Greek, French, Spanish) | AduBible',
    description:
      'Compare Ephesians 1 verse-by-verse across NKJV, KJV, Asante Twi, Koine Greek, French Louis Segond, Spanish Reina-Valera, and 35+ global languages on AduBible.',
    heading: 'Ephesians 1 — Synchronized Multi-Language Parallel Reader',
    excerpt:
      'Side-by-side comparison of Ephesians 1:1–23 across English, Asante Twi, Original Greek, French, Spanish, German, Arabic, Swahili, Yoruba, and Hausa.',
  },
  {
    route: '/nkjv/genesis/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Genesis 1 NKJV, Hebrew WLC & Asante Twi (Gyenesis 1) Parallel Bible | AduBible",
    description:
      "In the beginning God (Elohim H430) created the heavens and the earth. Read Genesis 1 in parallel across NKJV, KJV, Asante Twi, and Westminster Leningrad Codex Hebrew on AduBible.",
    heading: 'Genesis Chapter 1 (Gyenesis 1) — Creation Account in Parallel & Hebrew Interlinear',
    excerpt:
      'In the beginning God created the heavens and the earth. Mfitiaseɛ no Onyankopɔn bɔɔ ɔsoro ne asase. בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃',
  },
  {
    route: '/nkjv/psalms/23/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Psalm 23 NKJV & Asante Twi (Dwom 23) Parallel Bible — The LORD Is My Shepherd | AduBible',
    description:
      'The LORD is my shepherd; I shall not want (Awurade ne me hwɛfoɔ, hwee renni me bammɔ). Study Psalm 23 in NKJV, KJV, Asante Twi, Hebrew, and Matthew Henry Commentary on AduBible.',
    heading: 'Psalm 23 (Dwom 23) — Parallel Shepherd Psalm & Exegesis',
    excerpt:
      'The LORD is my shepherd; I shall not want. Awurade ne me hwɛfoɔ, hwee renni me bammɔ. Ɔma meda adidibea frɔmfrɔm so, ɔgya me kɔ nsuo a ɛtena komm ho.',
  },
  {
    route: '/nkjv/john/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'John 1 NKJV, Greek Interlinear & Asante Twi (Yohane 1) Parallel Bible | AduBible',
    description:
      'In the beginning was the Word (Logos G3056), and the Word was with God, and the Word was God. Study John 1 in parallel with Strong’s Greek Lexicon on AduBible.',
    heading: 'John Chapter 1 (Yohane 1) — The Eternal Logos in Parallel & Greek Interlinear',
    excerpt:
      'In the beginning was the Word, and the Word was with God, and the Word was God. Mfitiaseɛ no na Asɛm no wɔ hɔ, na Asɛm no ne Onyankopɔn na ɛwɔ hɔ, na Asɛm no yɛ Onyankopɔn.',
  },
  {
    route: '/nkjv/romans/8/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Romans 8 NKJV & Asante Twi (Romafoɔ 8) Parallel Bible Study | AduBible',
    description:
      'There is therefore now no condemnation to those who are in Christ Jesus. Read Romans 8 in parallel across NKJV, KJV, Asante Twi, and Open-Source Commentaries on AduBible.',
    heading: 'Romans Chapter 8 (Romafoɔ 8) — Life in the Spirit & More Than Conquerors',
    excerpt:
      'There is therefore now no condemnation to those who are in Christ Jesus, who do not walk according to the flesh, but according to the Spirit.',
  },
  {
    route: '/about/',
    priority: '0.6',
    changefreq: 'monthly',
    title: 'About AduBible — Honoring the Legacy of Apostle Kwame Adu | Adubible.org',
    description:
      'Learn how AduBible honors the ministry and legacy of Apostle Kwame Adu (Nushia, Ghana) through an ad-free parallel study sanctuary uniting Twi, English, Hebrew, and Greek.',
    heading: 'About AduBible — The Legacy of Apostle Kwame Adu (Nushia, Ghana)',
    excerpt:
      'AduBible was founded to honor the gospel life and generational ministry of Apostle Kwame Adu of Nushia, Ghana. Combining deep exegetical rigor with YouVersion study sync with zero ads.',
  },
  {
    route: '/how-to-use/',
    priority: '0.6',
    changefreq: 'monthly',
    title: "How to Use AduBible — Parallel Columns, Strong's Lexicon & Language Add-ons | Adubible.org",
    description:
      "Step-by-step guide to reading up to 4 Bible versions in parallel, swapping languages, inspecting Strong's Hebrew & Greek numbers, installing custom packs, and syncing highlights on AduBible.",
    heading: 'How to Use Parallel Reading, Language Swap, Strong’s Concordance & Add-ons',
    excerpt:
      'Open up to 4 parallel Bible translations side-by-side, tap the Swap (⇄) button to exchange languages, inspect Strong’s numbers, and sync your study notes across devices.',
  },
  {
    route: '/privacy/',
    priority: '0.6',
    changefreq: 'monthly',
    title: 'Privacy Policy — Zero Ads & Sovereign Study Vault | AduBible (Adubible.org)',
    description:
      'AduBible operates with zero behavioral tracking and zero advertisements. Your bookmarks, pins, highlights, and notes belong 100% to you.',
    heading: 'Sovereign Privacy Policy — Zero Ads, Zero Tracking',
    excerpt:
      'We never display intrusive ads or sell user data. All scripture study notes, highlights, and pins are stored locally in your device vault and optionally synced to your private cloud account.',
  },
  {
    route: '/terms/',
    priority: '0.6',
    changefreq: 'monthly',
    title: 'Terms of Service & Open-Source Scripture Licensing | AduBible (Adubible.org)',
    description:
      'Terms of use and open-access licensing for biblical translations, Strong’s Exhaustive Concordance, and classic theological commentaries on AduBible.',
    heading: 'Terms of Service & Open-Source Biblical Commons',
    excerpt:
      'All public-domain and open-access translations, lexicons, and commentaries are freely accessible for personal devotion, sermon preparation, and academic research.',
  },
];

// Also include the 23 localization routes from mega-multilingual-seo-transformer
const MEGA_LOCALES = [
  { code: 'tw', name: 'Asante Twi (Twerɛ Kronkron)' },
  { code: 'de', name: 'Deutsch (German Luther Bible)' },
  { code: 'es', name: 'Español (Reina-Valera)' },
  { code: 'fr', name: 'Français (Louis Segond)' },
  { code: 'pt', name: 'Português (Almeida)' },
  { code: 'it', name: 'Italiano (Riveduta)' },
  { code: 'ar', name: 'العربية (Arabic Smith & Van Dyke)' },
  { code: 'hi', name: 'हिन्दी (Hindi Bible)' },
  { code: 'bn', name: 'বাংলা (Bengali Bible)' },
  { code: 'ta', name: 'தமிழ் (Tamil Bible)' },
  { code: 'te', name: 'తెలుగు (Telugu Bible)' },
  { code: 'id', name: 'Bahasa Indonesia (Terjemahan Baru)' },
  { code: 'tl', name: 'Tagalog (Ang Dating Biblia)' },
  { code: 'ko', name: '한국어 (Korean Revised Version)' },
  { code: 'ja', name: '日本語 (Japanese Kougo-yaku)' },
  { code: 'zh-hans', name: '简体中文 (Simplified Chinese CUV)' },
  { code: 'zh-hant', name: '繁體中文 (Traditional Chinese CUV)' },
  { code: 'sw', name: 'Kiswahili (Swahili Union Version)' },
  { code: 'ha', name: 'Hausa (Littafi Mai Tsarki)' },
  { code: 'yo', name: 'Èdè Yorùbá (Bíbélì Mímọ́)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese Bible)' },
  { code: 'tr', name: 'Türkçe (Kutsal Kitap)' },
  { code: 'ru', name: 'Русский (Russian Synodal Bible)' },
];

for (const loc of MEGA_LOCALES) {
  CANONICAL_ROUTES.push({
    route: `/${loc.code}/`,
    priority: '0.8',
    changefreq: 'weekly',
    title: `AduBible (${loc.name}) — Parallel Bible, Strong's Concordance & Study Sync | Adubible.org`,
    description: `Read and study the Holy Bible in ${loc.name} alongside English (NKJV/KJV), Asante Twi, and Original Hebrew & Greek on AduBible with Strong's Concordance and zero ads.`,
    heading: `${loc.name} — Parallel Scripture & Exegetical Study Edition`,
    excerpt: `Read ${loc.name} in synchronized parallel columns with Strong's Exhaustive Concordance, Matthew Henry Commentary, and cloud-synced bookmarks, pins, highlights, and notes on AduBible.`,
  });
}

function buildSSG() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }
  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  for (const item of CANONICAL_ROUTES) {
    const canonicalUrl = `${BASE_URL}${item.route}`;
    let html = baseHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${item.title}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${item.description}" />`
      )
      .replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${item.title}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${item.description}" />`
      )
      .replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );

    // Inject crawlable <main> inside #root for SEO and AdSense compliance
    const ssrMainBlock = `<div id="root"><main style="max-width:960px;margin:0 auto;padding:2rem;font-family:Georgia,serif;color:#f5f5f4;"><h1>${item.heading}</h1><p>${item.excerpt}</p><nav><a href="/">AduBible Home</a> | <a href="/nkjv/ephesians/1/">Ephesians 1 NKJV</a> | <a href="/twi/ephesians/1/">Efesofoɔ 1 Twi</a> | <a href="/about/">About</a> | <a href="/how-to-use/">How to Use</a> | <a href="/privacy/">Privacy</a> | <a href="/terms/">Terms</a></nav><footer style="margin-top:2rem;font-size:12px;color:#a8a29e;">Honoring the Legacy of Apostle Kwame Adu · Nushia, Ghana · <a href="https://adubible.org">adubible.org</a></footer></main></div>`;
    html = html.replace('<div id="root"></div>', ssrMainBlock);

    const outDir =
      item.route === '/'
        ? DIST_DIR
        : path.join(DIST_DIR, item.route.replace(/^\/|\/$/g, ''));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  }

  // Generate sitemap.xml
  const sitemapEntries = CANONICAL_ROUTES.map(
    (r) => `  <url>
    <loc>${BASE_URL}${r.route}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');

  // Ensure robots.txt in dist
  const robotsTxt = `User-agent: *
Allow: /

User-agent: Googlebot-Image
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(
    `[ADUBIBLE SSG] Generated ${CANONICAL_ROUTES.length} static routes + sitemap.xml + robots.txt in dist/ for ${BASE_URL}`
  );
}

buildSSG();
