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
    title: "AduBible.org — Ad-Free Multilingual Parallel Bible, Genesis 1, Asante Twi & Strong's Concordance",
    description:
      "Read Genesis 1 and the Holy Bible in parallel across Asante Twi (Twerɛ Kronkron), NKJV, KJV, Hebrew, Greek, and 35+ world languages on AduBible (Adubible.org). Dedicated to Humanity in honor of the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://nsuhia.com/). 100% Ads-Free Reading Experience with Strong's Concordance and Cloud Study Sync.",
    heading: 'Genesis Chapter 1 (Genesis 1) — In the Beginning God Created the Heavens and the Earth',
    excerpt:
      'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, Let there be light: and there was light (Genesis 1:1–3). Mfitiaseɛ no Onyankopɔn bɔɔ ɔsoro ne asase... Honoring the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://nsuhia.com/) · adubible.org · Dedicated to Humanity · 100% Ads-Free Reading Experience.',
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
    title: 'About AduBible — Honoring the Legacy of Apostle Kwame Adu | Nsuhia, Ghana | Adubible.org',
    description:
      'Learn how AduBible honors the ministry and legacy of Apostle Kwame Adu (Nsuhia, Ghana · https://nsuhia.com/) through a dedicated, 100% ad-free parallel study sanctuary uniting Twi, English, Hebrew, and Greek.',
    heading: 'About AduBible — The Legacy of Apostle Kwame Adu (Nsuhia, Ghana)',
    excerpt:
      'AduBible was founded to honor the gospel life and generational ministry of Apostle Kwame Adu of Nsuhia, Ghana (https://nsuhia.com/). Dedicated to humanity with a permanent 100% ad-free reading covenant, YouVersion-style personal study sync, and deep exegetical tools.',
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
  {
    route: '/deuterocanon/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Deuterocanonical Scriptures & Apocrypha — 16 Sacred Books in Parallel | AduBible',
    description:
      'Read the 16 Deuterocanonical Books (Tobit, Judith, Wisdom of Solomon, Sirach, Baruch, 1 & 2 Maccabees, Septuagint additions) in parallel across KJV 1611 Apocrypha, Douay-Rheims, Greek LXX, and Asante Twi on AduBible.',
    heading: 'Deuterocanonical Scriptures & Biblical Apocrypha (16 Books) — Parallel Study',
    excerpt:
      'Sacred scriptures canonical for Catholic, Eastern Orthodox, and Oriental traditions. Features Wisdom of Solomon, Sirach (Ecclesiasticus), Tobit, Judith, and Maccabees in parallel translations with 24kHz audio.',
  },
  {
    route: '/list-of-sixty/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'List of Sixty Canonical & Apocryphal Books — 7th-Century Manuscript Index & Apostolic Fathers | AduBible',
    description:
      'Explore the ancient 7th-century List of Sixty and Apocrypha (1 Enoch, Didache, Shepherd of Hermas, Clement, Testament of the Twelve Patriarchs) in parallel across R.H. Charles, Lightfoot, and Asante Twi translations on AduBible.',
    heading: 'List of Sixty & Ancient Apocrypha (25 Historic Books) — Apostolic Fathers & Pseudepigrapha',
    excerpt:
      'Historic 7th-century manuscript canon index preserved in Codex Sinaiticus, Ethiopian Orthodox canon, and Early Church collections. Read 1 Enoch, Didache, Epistle of Barnabas, and Shepherd of Hermas in parallel.',
  },
  {
    route: '/apocrypha/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Biblical Apocrypha & Ancient Pseudepigrapha — 25 Historic Sacred Books | AduBible',
    description:
      'Read 25 ancient Apocrypha and Pseudepigrapha books (1 Enoch, Book of Jasher, Jubilees, 2 Esdras, Didache, Shepherd of Hermas) in parallel across R.H. Charles, Lightfoot, and Asante Twi on AduBible.',
    heading: 'Biblical Apocrypha & Ancient Pseudepigrapha (25 Sacred Books) — Parallel Study',
    excerpt:
      'Ancient Jewish and early Christian sacred literature including 1 Enoch (Book of Enoch), Book of Jasher, Book of Jubilees, 2 Esdras (4 Ezra), and Apostolic Fathers with 24kHz neural audio and sovereign offline storage.',
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
    const ssrMainBlock = `<div id="root"><main style="max-width:960px;margin:0 auto;padding:2rem;font-family:Georgia,serif;color:#f5f5f4;"><h1>${item.heading}</h1><p>${item.excerpt}</p><nav><a href="/">AduBible Home</a> | <a href="/nkjv/ephesians/1/">Ephesians 1 NKJV</a> | <a href="/twi/ephesians/1/">Efesofoɔ 1 Twi</a> | <a href="/about/">About</a> | <a href="/how-to-use/">How to Use</a> | <a href="/privacy/">Privacy</a> | <a href="/terms/">Terms</a></nav><footer style="margin-top:2rem;font-size:12px;color:#a8a29e;border-top:1px solid #292524;padding-top:1.5rem;"><div style="margin-bottom:1rem;font-style:italic;">&ldquo;Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.&rdquo; &mdash; Ephesians 1:3 &bull; &ldquo;For the word of God is living and active, sharper than any two-edged sword...&rdquo; &mdash; Hebrews 4:12 &bull; &ldquo;All Scripture is breathed out by God and profitable for teaching...&rdquo; &mdash; 2 Timothy 3:16</div>Honoring the Legacy of Apostle Kwame Adu &middot; <a href="https://nsuhia.com/" target="_blank" rel="noopener noreferrer" style="color:#f59e0b;">Nsuhia, Ghana ↗</a> &middot; <a href="https://adubible.org/" style="color:#f59e0b;">adubible.org</a> &middot; <span style="color:#f5f5f4;">Dedicated to Humanity</span> &middot; <span style="color:#10b981;">100% Ads-Free Reading Experience</span></footer></main></div>`;
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
