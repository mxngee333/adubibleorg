import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://adubible.org';
const DIST_DIR = path.join(__dirname, 'dist');
const TODAY = new Date().toISOString().slice(0, 10);

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Load compiled master articles corpus
const corpusPath = path.join(__dirname, 'src', 'data', 'articlesCorpus.json');
let articles = [];
if (fs.existsSync(corpusPath)) {
  try {
    articles = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse articlesCorpus.json:', err);
  }
}

const CANONICAL_ROUTES = [
  {
    route: '/',
    priority: '1.0',
    changefreq: 'weekly',
    title: "AduBible.org — Free Multilingual Parallel Bible Hub, Genesis 1, Strong's Concordance & Global Study",
    description:
      "Read Genesis 1 and the Holy Bible in parallel across 35+ languages including KJV, NKJV, BSB, Hebrew, Greek, French, Spanish, German, and Twi on AduBible (Adubible.org). Dedicated to Humanity in honor of the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://nsuhia.com/). 100% Ads-Free Reading Experience with Strong's Concordance and Cloud Study Sync.",
    heading: 'Genesis Chapter 1 (Genesis 1) — In the Beginning God Created the Heavens and the Earth',
    excerpt:
      'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, Let there be light: and there was light (Genesis 1:1–3). Honoring the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://nsuhia.com/) · adubible.org · Dedicated to Humanity · 100% Ads-Free Reading Experience.',
  },
  {
    route: '/articles/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Pillar Scripture Guides, Exegesis & Digital Translation Library | AduBible.org',
    description:
      "Explore 15 authoritative scripture and study guides: 100% ad-free parallel reading, Bible Gateway & Bible Hub comparisons, Greek/Hebrew Strong's concordance, Asante Twi, and ancient manuscripts on AduBible.",
    heading: 'AduBible Scripture & Study Articles — 15 Authoritative Research Pillars',
    excerpt:
      'A library of 15 comprehensive, 3,200+ word research guides covering ad-free Bible study, Bible Gateway and Bible Hub alternatives, Greek/Hebrew Strong concordance exegesis, multilingual parallel reading, and manuscript history.',
  },
  {
    route: '/editorial-policy/',
    priority: '0.6',
    changefreq: 'monthly',
    title: 'Editorial Policy, Translation Ethics & Scholarly Integrity | AduBible (Adubible.org)',
    description:
      'AduBible’s rigorous editorial and translation governance: unmonetized scripture access, primary manuscript fidelity (Masoretic, Textus Receptus, NA28), linguistic peer review, and zero advertising intrusion.',
    heading: 'Editorial Policy & Translation Standards — Sovereign Biblical Integrity',
    excerpt:
      'AduBible operates under strict ministerial and academic principles: 100% unmonetized scripture, primary witness fidelity (Masoretic text, Textus Receptus, Nestle-Aland 28th Edition), and verifiable exegesis.',
  },
  {
    route: '/glossary/',
    priority: '0.6',
    changefreq: 'monthly',
    title: 'Biblical Exegesis, Manuscripts & Hermeneutics Glossary | AduBible (Adubible.org)',
    description:
      'Comprehensive glossary of biblical exegesis, textual criticism, ancient manuscript codices, translation philosophies, and theological terms from Autographs to Vorlage on AduBible.',
    heading: 'Biblical Exegesis & Textual Criticism Glossary — Key Terms for Deep Study',
    excerpt:
      'Master essential terminology in biblical textual criticism, original language grammar, codicology, and hermeneutics, including Autograph, Textus Receptus, Septuagint, Vorlage, and Dynamic Equivalence.',
  },
  {
    route: '/sources/',
    priority: '0.6',
    changefreq: 'monthly',
    title: 'Ancient Manuscript Sources, Codex Archives & Scholarly Citations | AduBible (Adubible.org)',
    description:
      'Primary textual witnesses, academic archives, critical editions (BHS, NA28, LXX Rahlfs), and open-access theological resources powering AduBible.',
    heading: 'Manuscript Archives, Codex Witnesses & Primary Biblical Sources',
    excerpt:
      'Primary textual witnesses and critical editions supporting AduBible: Codex Sinaiticus, Codex Vaticanus, Codex Alexandrinus, Dead Sea Scrolls, Westminster Leningrad Codex, and classic commentaries.',
  },
  {
    route: '/nkjv/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Ephesians 1 NKJV Parallel Bible — Strong's Concordance & Matthew Henry Commentary | AduBible",
    description:
      "Study Ephesians Chapter 1 (verses 1–23) in NKJV, KJV, BSB, and Original Greek Interlinear with Strong's numbers (G2128 eulogētos, G4309 proorizō) and Matthew Henry Commentary on AduBible.",
    heading: 'Ephesians Chapter 1 (NKJV) — Parallel Study, Greek Interlinear & Commentaries',
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
    title: "Ephesians 1 KJV with Strong's Concordance & Parallel Study | AduBible",
    description:
      "Read Ephesians 1 in the Authorized King James Version (KJV) with Greek Textus Receptus and Strong's Exhaustive Concordance on AduBible.",
    heading: 'Ephesians Chapter 1 (KJV 1769) — Exhaustive Strong’s Concordance Edition',
    excerpt:
      'Blessed be the God and Father of our Lord Jesus Christ, who hath blessed us with all spiritual blessings in heavenly places in Christ: According as he hath chosen us in him before the foundation of the world.',
  },
  {
    route: '/parallel/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Ephesians 1 Multi-Language Parallel Bible (KJV, BSB, Greek, French, Spanish) | AduBible',
    description:
      'Compare Ephesians 1 verse-by-verse across KJV, BSB, NKJV, Koine Greek, French Louis Segond, Spanish Reina-Valera, and 35+ global languages on AduBible.',
    heading: 'Ephesians 1 — Synchronized Multi-Language Parallel Reader',
    excerpt:
      'Side-by-side comparison of Ephesians 1:1–23 across English, Original Greek, French, Spanish, German, Arabic, Swahili, Yoruba, and global editions.',
  },
  {
    route: '/nkjv/genesis/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Genesis 1 NKJV, Hebrew WLC & KJV Parallel Bible | AduBible",
    description:
      "In the beginning God (Elohim H430) created the heavens and the earth. Read Genesis 1 in parallel across NKJV, KJV, BSB, and Westminster Leningrad Codex Hebrew on AduBible.",
    heading: 'Genesis Chapter 1 (NKJV) — Creation Account in Parallel & Hebrew Interlinear',
    excerpt:
      'In the beginning God created the heavens and the earth. בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃',
  },
  {
    route: '/nkjv/psalms/23/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Psalm 23 NKJV & KJV Parallel Bible — The LORD Is My Shepherd | AduBible',
    description:
      'The LORD is my shepherd; I shall not want. Study Psalm 23 in NKJV, KJV, Hebrew, and Matthew Henry Commentary on AduBible.',
    heading: 'Psalm 23 (NKJV) — Parallel Shepherd Psalm & Exegesis',
    excerpt:
      'The LORD is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters.',
  },
  {
    route: '/nkjv/john/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'John 1 NKJV, Greek Interlinear & KJV Parallel Bible | AduBible',
    description:
      'In the beginning was the Word (Logos G3056), and the Word was with God, and the Word was God. Study John 1 in parallel with Strong’s Greek Lexicon on AduBible.',
    heading: 'John Chapter 1 (NKJV) — The Eternal Logos in Parallel & Greek Interlinear',
    excerpt:
      'In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.',
  },
  {
    route: '/nkjv/romans/8/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Romans 8 NKJV & KJV Parallel Bible Study | AduBible',
    description:
      'There is therefore now no condemnation to those who are in Christ Jesus. Read Romans 8 in parallel across NKJV, KJV, and Open-Source Commentaries on AduBible.',
    heading: 'Romans Chapter 8 (NKJV) — Life in the Spirit & More Than Conquerors',
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
  {
    route: '/donate/',
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Support the AduBible Scripture Mission — 100% Ad-Free Scripture for Humanity | Adubible.org',
    description:
      'Partner with AduBible in honoring the legacy of Apostle Kwame Adu of Nsuhia, Ghana. Support non-profit parallel Bible translation, Asante Twi digitizing, and zero-ad server operations via Stripe and PayPal.',
    heading: 'Support the AduBible Planetary Scripture Mission — Giving & Partnership',
    excerpt:
      'AduBible operates as a dedicated, 100% ad-free non-profit scripture sanctuary for 4 billion readers worldwide, honoring Apostle Kwame Adu of Nsuhia, Ghana (https://nsuhia.com/). Support our planetary scripture distribution via Stripe (Card, Apple Pay, Google Pay) and PayPal.',
  },
];

// Append all 15 Pillar Articles to CANONICAL_ROUTES
for (const art of articles) {
  CANONICAL_ROUTES.push({
    route: `/articles/${art.slug}/`,
    priority: '0.9',
    changefreq: 'weekly',
    title: art.metaTitle,
    description: art.metaDescription,
    heading: `${art.title} — ${art.subtitle}`,
    excerpt: art.excerpt,
    article: art,
  });
}

// 23 localization routes
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
    description: `Read and study the Holy Bible in ${loc.name} alongside English (NKJV/KJV/BSB) and Original Hebrew & Greek on AduBible with Strong's Concordance and zero ads.`,
    heading: `${loc.name} — Parallel Scripture & Exegetical Study Edition`,
    excerpt: `Read ${loc.name} in synchronized parallel columns with Strong's Exhaustive Concordance, Matthew Henry Commentary, and cloud-synced bookmarks, pins, highlights, and notes on AduBible.`,
  });
}

function extractFaqSchema(contentHtml, canonicalUrl) {
  const faqRegex = /<h3[^>]*>(?:Q\d+:?\s*)?([^<]+)<\/h3>\s*<p><strong>Answer:<\/strong>\s*([\s\S]*?)<\/p>/gi;
  const questions = [];
  let match;
  while ((match = faqRegex.exec(contentHtml)) !== null) {
    const q = match[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
    const a = match[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
    if (q && a) {
      questions.push({
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': a,
        },
      });
    }
  }
  if (questions.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions,
  };
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

    if (item.article) {
      const art = item.article;
      const heroWebpUrl = `${BASE_URL}/assets/articles/${art.slug}-16x9.webp`;

      // Update OG Image to article hero
      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:image" content="${heroWebpUrl}" />\n    <meta property="og:image:width" content="1600" />\n    <meta property="og:image:height" content="900" />\n    <meta property="og:type" content="article" />\n    <meta property="article:published_time" content="${art.datePublished}" />\n    <meta property="article:modified_time" content="${art.dateModified}" />\n    <meta property="article:section" content="${art.category}" />`
      );

      // Inject preload for LCP hero image
      const preloadTag = `<link rel="preload" as="image" href="/assets/articles/${art.slug}-16x9.webp" type="image/webp" />`;
      html = html.replace('</head>', `    ${preloadTag}\n  </head>`);

      // Schemas: BlogPosting + BreadcrumbList + FAQPage
      const blogPostingSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': art.title,
        'alternativeHeadline': art.subtitle,
        'description': art.metaDescription,
        'url': canonicalUrl,
        'datePublished': art.datePublished,
        'dateModified': art.dateModified,
        'wordCount': art.wordCount,
        'articleSection': art.category,
        'inLanguage': 'en-US',
        'image': [
          `${BASE_URL}/assets/articles/${art.slug}-16x9.webp`,
          `${BASE_URL}/assets/articles/${art.slug}-4x3.webp`,
          `${BASE_URL}/assets/articles/${art.slug}-1x1.webp`,
        ],
        'author': {
          '@type': 'Organization',
          'name': art.author,
          'url': BASE_URL,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'AduBible.org',
          'url': BASE_URL,
          'logo': {
            '@type': 'ImageObject',
            'url': `${BASE_URL}/favicon-96x96.png`,
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Articles',
            'item': `${BASE_URL}/articles/`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': art.title,
            'item': canonicalUrl,
          },
        ],
      };

      const faqSchema = extractFaqSchema(art.contentHtml, canonicalUrl);

      const schemas = [blogPostingSchema, breadcrumbSchema];
      if (faqSchema) schemas.push(faqSchema);

      const jsonLdBlock = `\n    <script type="application/ld+json">\n${JSON.stringify(schemas, null, 2)}\n    </script>\n  </head>`;
      html = html.replace('</head>', jsonLdBlock);

      // Inject full article body inside #root
      const articleSsrBlock = `<div id="root"><main style="max-width:960px;margin:0 auto;padding:2rem 1.25rem;font-family:Georgia,serif;color:#f5f5f4;background:#1c1917;line-height:1.75;"><header style="margin-bottom:2rem;border-bottom:1px solid #292524;padding-bottom:1.5rem;"><nav aria-label="Breadcrumb" style="font-size:13px;color:#a8a29e;margin-bottom:1rem;"><a href="/" style="color:#f59e0b;text-decoration:none;">AduBible</a> &rsaquo; <a href="/articles/" style="color:#f59e0b;text-decoration:none;">Articles</a> &rsaquo; <span>${art.category}</span></nav><div style="font-size:12px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem;">${art.category} &bull; ${art.readTimeMinutes} Min Read</div><h1 style="font-size:2.25rem;line-height:1.2;color:#fafaf9;margin:0 0 1rem 0;">${art.title}</h1><p style="font-size:1.15rem;color:#d6d3d1;font-style:italic;margin:0 0 1rem 0;">${art.subtitle}</p><div style="font-size:13px;color:#a8a29e;">By <strong>${art.author}</strong> &bull; Published ${art.datePublished} &bull; Updated ${art.dateModified} &bull; <span>${art.wordCount.toLocaleString()} Words</span></div><div style="margin-top:1.5rem;"><picture><source srcset="/assets/articles/${art.slug}-16x9.webp" type="image/webp" /><img src="/assets/articles/${art.slug}-16x9.webp" alt="${art.title}" width="1600" height="900" style="width:100%;height:auto;border-radius:12px;border:1px solid #292524;" loading="eager" fetchpriority="high" /></picture></div></header><article class="article-body" style="font-size:1.05rem;line-height:1.8;">${art.contentHtml}</article><footer style="margin-top:3rem;padding-top:2rem;border-top:1px solid #292524;font-size:13px;color:#a8a29e;"><nav style="margin-bottom:1rem;"><a href="/articles/" style="color:#f59e0b;">&larr; Back to All Articles</a> | <a href="/" style="color:#f59e0b;">AduBible Home</a> | <a href="/about/" style="color:#a8a29e;">About</a> | <a href="/editorial-policy/" style="color:#a8a29e;">Editorial Policy</a> | <a href="/privacy/" style="color:#a8a29e;">Privacy</a></nav><p>&copy; 2026 AduBible.org &middot; Dedicated to Humanity in Honor of the Legacy of Apostle Kwame Adu &middot; Nsuhia, Ghana &middot; 100% Ads-Free Reading Experience.</p></footer></main></div>`;
      html = html.replace('<div id="root"></div>', articleSsrBlock);
    } else {
      // Standard crawlable <main> for chapters and legal pages
      const ssrMainBlock = `<div id="root"><main style="max-width:960px;margin:0 auto;padding:2rem;font-family:Georgia,serif;color:#f5f5f4;"><h1>${item.heading}</h1><p>${item.excerpt}</p><nav><a href="/">AduBible Home</a> | <a href="/articles/">Pillar Articles</a> | <a href="/nkjv/ephesians/1/">Ephesians 1 NKJV</a> | <a href="/twi/ephesians/1/">Efesofoɔ 1 Twi</a> | <a href="/about/">About</a> | <a href="/editorial-policy/">Editorial Policy</a> | <a href="/how-to-use/">How to Use</a> | <a href="/privacy/">Privacy</a> | <a href="/terms/">Terms</a></nav><footer style="margin-top:2rem;font-size:12px;color:#a8a29e;border-top:1px solid #292524;padding-top:1.5rem;"><div style="margin-bottom:1rem;font-style:italic;">&ldquo;Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.&rdquo; &mdash; Ephesians 1:3 &bull; &ldquo;For the word of God is living and active, sharper than any two-edged sword...&rdquo; &mdash; Hebrews 4:12 &bull; &ldquo;All Scripture is breathed out by God and profitable for teaching...&rdquo; &mdash; 2 Timothy 3:16</div>&copy; 2026 <a href="https://adubible.org/" style="color:inherit;text-decoration:none;">AduBible.org</a> &middot; Dedicated to Humanity by the Ministry of Apostle Kwame Adu &middot; <a href="https://nsuhia.com/" target="_blank" rel="noopener noreferrer" style="color:#f59e0b;">Nsuhia, Ghana ↗</a> &middot; <span style="color:#10b981;">100% Ads-Free Reading Experience</span></footer></main></div>`;
      html = html.replace('<div id="root"></div>', ssrMainBlock);
    }

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

  // Generate image-sitemap.xml for all 45 WebP images
  const imageSitemapEntries = articles.map((art) => `  <url>
    <loc>${BASE_URL}/articles/${art.slug}/</loc>
    <image:image>
      <image:loc>${BASE_URL}/assets/articles/${art.slug}-16x9.webp</image:loc>
      <image:title>${escapeXml(art.title)} — 16:9 Landscape Artwork</image:title>
      <image:caption>${escapeXml(art.excerpt)}</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/articles/${art.slug}-4x3.webp</image:loc>
      <image:title>${escapeXml(art.title)} — 4:3 Standard Artwork</image:title>
      <image:caption>${escapeXml(art.excerpt)}</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/articles/${art.slug}-1x1.webp</image:loc>
      <image:title>${escapeXml(art.title)} — 1:1 Square Artwork</image:title>
      <image:caption>${escapeXml(art.excerpt)}</image:caption>
    </image:image>
  </url>`).join('\n');

  const imageSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageSitemapEntries}
</urlset>
`;
  fs.writeFileSync(path.join(DIST_DIR, 'image-sitemap.xml'), imageSitemapXml, 'utf-8');

  // Generate llms.txt for LLM crawlers
  const llmsTxt = `# AduBible.org — Sovereign Multilingual Parallel Bible Engine

> Free, unmonetized, 100% ad-free Scripture study platform uniting 35+ global translations, Strong's Greek and Hebrew Lexicon, classic commentaries, and ancient manuscripts. Dedicated to humanity in honor of the ministry of Apostle Kwame Adu (Nsuhia, Ghana · https://nsuhia.com/).

## Core Features
- Synchronized multi-column parallel reading (up to 4 versions simultaneously)
- 100% ad-free forever with zero tracking and zero monetization
- 35+ global language translations including Asante Twi, Akuapem Twi, Hebrew, Greek, French, Spanish, German, Hausa, Yoruba, Swahili, Arabic, Chinese, and Hindi
- Strong's Exhaustive Concordance with instant morphological word studies
- Matthew Henry, Gill, and classic commentaries
- 16 Deuterocanonical books and 25 ancient Apocryphal works from the 7th-century List of Sixty
- 24kHz Neural Audio Bible streaming
- Private Study Vault (bookmarks, pins, highlights, notes) with cross-device sync

## Authoritative Exegesis & Study Guides (/articles/)
${articles.map((a, idx) => `${idx + 1}. ${a.title}: ${BASE_URL}/articles/${a.slug}/`).join('\n')}

## Institutional & Standards
- Editorial Policy: ${BASE_URL}/editorial-policy/
- Biblical Glossary: ${BASE_URL}/glossary/
- Manuscript Sources: ${BASE_URL}/sources/
- About AduBible: ${BASE_URL}/about/
- Terms & Open Access: ${BASE_URL}/terms/
- Privacy: ${BASE_URL}/privacy/
`;
  fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), llmsTxt, 'utf-8');

  // Copy robots.txt
  try {
    const publicRobots = fs.readFileSync(path.join(__dirname, 'public', 'robots.txt'), 'utf-8');
    fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), publicRobots, 'utf-8');
  } catch (err) {
    const fallbackRobots = `User-agent: *
Allow: /

User-agent: Googlebot-Image
Allow: /
Allow: /assets/
Allow: /assets/articles/
Allow: /favicon.ico
Allow: /favicon.svg
Allow: /favicon-48x48.png
Allow: /favicon-96x96.png
Allow: /apple-touch-icon.png

Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), fallbackRobots, 'utf-8');
  }

  console.log(
    `[ADUBIBLE SSG] Generated ${CANONICAL_ROUTES.length} static routes (including ${articles.length} pillar articles) + sitemap.xml (${CANONICAL_ROUTES.length} URLs) + image-sitemap.xml (${articles.length * 3} images) + llms.txt in dist/ for ${BASE_URL}`
  );
}

buildSSG();
