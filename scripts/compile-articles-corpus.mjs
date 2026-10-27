import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src', 'content', 'articles');
const targetFile = path.join(root, 'src', 'data', 'articlesCorpus.ts');

const ARTICLES_META = [
  {
    num: '01',
    slug: 'best-ad-free-bible-online',
    category: 'Platform Comparisons',
    readTimeMinutes: 18,
    datePublished: '2026-01-15',
    dateModified: '2026-10-27',
    author: 'AduBible Theological & Technical Research Group',
    icon: '🛡️',
    tags: ['Ad-Free Bible', 'Bible Study Tools', 'Digital Exegesis', 'Online Scripture', 'Parallel Bible', 'Distraction-Free Reading'],
    excerpt: 'A comprehensive evaluation of digital Bible platforms in 2026, comparing ad-supported web portals with clean, 100% ad-free parallel study sanctuaries. Learn how unmonetized scripture platforms protect devotional focus, eliminate data tracking, and provide lightning-fast exegesis across 35+ global languages.'
  },
  {
    num: '02',
    slug: 'best-bible-gateway-alternative',
    category: 'Platform Comparisons',
    readTimeMinutes: 19,
    datePublished: '2026-01-20',
    dateModified: '2026-10-27',
    author: 'AduBible Theological & Technical Research Group',
    icon: '⚡',
    tags: ['Bible Gateway Alternative', 'Ad-Free Bible', 'Parallel Bible', 'Strong Concordance', 'Bible Study Tools', 'Digital Exegesis'],
    excerpt: 'An exhaustive feature-by-feature comparison of Bible Gateway and its premier 2026 alternatives. Discover how AduBible delivers up to 4 synchronized reading columns across 35+ languages, full Strong’s concordance, and zero paywalls.'
  },
  {
    num: '03',
    slug: 'best-bible-hub-alternative',
    category: 'Platform Comparisons',
    readTimeMinutes: 18,
    datePublished: '2026-01-25',
    dateModified: '2026-10-27',
    author: 'AduBible Theological & Technical Research Group',
    icon: '🏛️',
    tags: ['Bible Hub Alternative', 'Greek Interlinear', 'Hebrew Interlinear', 'Strongs Concordance', 'Matthew Henry Commentary', 'Ad-Free Bible'],
    excerpt: 'Compare Bible Hub against modern original-language study platforms. Discover how AduBible integrates full Greek/Hebrew Strong’s data and classic commentaries into a sleek, responsive, 100% ad-free multi-column layout.'
  },
  {
    num: '04',
    slug: 'send-the-word-out-digital-scripture-mission',
    category: 'Mission & Access',
    readTimeMinutes: 19,
    datePublished: '2026-02-01',
    dateModified: '2026-10-27',
    author: 'Apostle Kwame Adu Memorial Gospel Foundation',
    icon: '🌍',
    tags: ['Send the Word Out', 'Global Missions', 'Free Scripture Access', 'Apostle Kwame Adu', 'Digital Evangelism', 'Great Commission'],
    excerpt: 'The global manifesto for sovereign, ad-free scripture broadcasting in 2026. Learn how unmonetized edge technology, open-access scholarship, and parallel multilingual translation fulfill the Great Commission without corporate paywalls.'
  },
  {
    num: '05',
    slug: 'multilingual-parallel-bible-study',
    category: 'Translations & Languages',
    readTimeMinutes: 20,
    datePublished: '2026-02-05',
    dateModified: '2026-10-27',
    author: 'AduBible Linguistic Research Team',
    icon: '🌐',
    tags: ['Multilingual Bible', 'Parallel Bible Study', 'Asante Twi', 'Greek Interlinear', 'African Vernaculars', 'Comparative Hermeneutics'],
    excerpt: 'A master guide to studying scripture across 35+ global languages simultaneously. Explore how parallel columns bridge Western translations with African tongues like Asante Twi and original Greek/Hebrew roots.'
  },
  {
    num: '06',
    slug: 'youversion-vs-gateway-vs-hub',
    category: 'Platform Comparisons',
    readTimeMinutes: 19,
    datePublished: '2026-02-10',
    dateModified: '2026-10-27',
    author: 'AduBible Theological & Technical Research Group',
    icon: '⚖️',
    tags: ['YouVersion vs Bible Gateway', 'Bible Hub vs Bible Gateway', 'Best Bible Apps 2026', 'AduBible Comparison', 'Ad-Free Scripture'],
    excerpt: 'The definitive head-to-head comparison of YouVersion, Bible Gateway, Bible Hub, and AduBible. Evaluate monetization, parallel reading, lexical depth, speed, and privacy to choose the ideal Bible study platform.'
  },
  {
    num: '07',
    slug: 'strongs-exhaustive-concordance-guide',
    category: 'Original Languages & Exegesis',
    readTimeMinutes: 19,
    datePublished: '2026-02-15',
    dateModified: '2026-10-27',
    author: 'AduBible Biblical Languages Faculty',
    icon: '🔍',
    tags: ['Strongs Concordance Online', 'Greek Word Study', 'Hebrew Lexicon', 'Biblical Exegesis', 'Thayer Lexicon', 'Gesenius Lexicon'],
    excerpt: 'Step-by-step masterclass on utilizing Strong’s Exhaustive Concordance for deep original-language Bible study. Avoid common exegetical fallacies and unlock Greek and Hebrew roots using 1-tap popovers.'
  },
  {
    num: '08',
    slug: 'hebrew-and-greek-interlinear-bible-study',
    category: 'Original Languages & Exegesis',
    readTimeMinutes: 19,
    datePublished: '2026-02-20',
    dateModified: '2026-10-27',
    author: 'AduBible Biblical Languages Faculty',
    icon: '📜',
    tags: ['Hebrew Interlinear', 'Greek Interlinear', 'Westminster Leningrad Codex', 'Textus Receptus', 'Original Languages', 'Morphological Parsing'],
    excerpt: 'Demystify original-language interlinear exegesis without needing a seminary degree. Learn how to read the Westminster Leningrad Codex and Greek Textus Receptus line-by-line with morphological tags.'
  },
  {
    num: '09',
    slug: 'parallel-bible-reading-methods',
    category: 'Bible Study Methods',
    readTimeMinutes: 20,
    datePublished: '2026-02-25',
    dateModified: '2026-10-27',
    author: 'AduBible Pastoral & Hermeneutics Group',
    icon: '📖',
    tags: ['Parallel Bible Study', 'Analogia Scripturae', 'Formal vs Dynamic Equivalence', 'Synoptic Gospels', 'Scripture Interprets Scripture'],
    excerpt: 'Master the classical Protestant hermeneutical method of comparing scripture with scripture. Discover translation synthesis, synoptic gospel harmonization, and typological cross-examination across 4 synchronized columns.'
  },
  {
    num: '10',
    slug: 'king-james-version-kjv-history-and-parallel-study',
    category: 'Translations & Languages',
    readTimeMinutes: 20,
    datePublished: '2026-03-01',
    dateModified: '2026-10-27',
    author: 'AduBible Historical Theology Group',
    icon: '👑',
    tags: ['KJV 1611 History', 'King James Version', 'Textus Receptus', 'KJV vs NKJV', 'Archaic Words Decoded', 'Jacobean English'],
    excerpt: 'Explore the monumental history, translation committees, and Textus Receptus manuscript foundation of the 1611 King James Bible. Decode archaic vocabulary and study the KJV alongside modern parallel translations.'
  },
  {
    num: '11',
    slug: 'twi-bible-translation-history-and-study',
    category: 'Translations & Languages',
    readTimeMinutes: 19,
    datePublished: '2026-03-05',
    dateModified: '2026-10-27',
    author: 'AduBible African Heritage & Languages Faculty',
    icon: '🇬🇭',
    tags: ['Asante Twi Bible', 'Twere Kronkron', 'Akuapem Twi', 'Johannes Christaller', 'Basel Mission Ghana', 'Apostle Kwame Adu'],
    excerpt: 'The inspiring story of the Akan Twi Bible (Twerɛ Kronkron), from Christaller’s Basel Mission scholarship to modern Asante Twi. Unpack indigenous theological concepts like Onyankopɔn, Nhyira, Adom, and Mpata.'
  },
  {
    num: '12',
    slug: 'matthew-henry-and-classic-bible-commentaries',
    category: 'Bible Study Methods',
    readTimeMinutes: 19,
    datePublished: '2026-03-10',
    dateModified: '2026-10-27',
    author: 'AduBible Pastoral & Expository Faculty',
    icon: '✍️',
    tags: ['Matthew Henry Commentary', 'Classic Bible Commentaries', 'Expository Preaching', 'Puritan Theology', 'Verse-by-Verse Study'],
    excerpt: 'How to enrich your spiritual life using classic biblical commentaries. Explore Matthew Henry’s life, spiritual genius, and practical rules for studying historic expository notes without substituting human words for scripture.'
  },
  {
    num: '13',
    slug: 'deuterocanon-and-biblical-apocrypha-guide',
    category: 'Ancient Manuscripts & Canons',
    readTimeMinutes: 20,
    datePublished: '2026-03-15',
    dateModified: '2026-10-27',
    author: 'AduBible Historical Theology Group',
    icon: '🏺',
    tags: ['Deuterocanonical Books', 'Biblical Apocrypha', '1 Maccabees', 'Wisdom of Solomon', 'Septuagint Canon', 'Second Temple History'],
    excerpt: 'The comprehensive guide to the 16 Deuterocanonical and Apocryphal books. Understand the Septuagint, the Council of Trent, Protestant views (Luther & 1611 KJV), and their vital historical context for the New Testament.'
  },
  {
    num: '14',
    slug: 'list-of-sixty-ancient-manuscripts-guide',
    category: 'Ancient Manuscripts & Canons',
    readTimeMinutes: 20,
    datePublished: '2026-03-20',
    dateModified: '2026-10-27',
    author: 'AduBible Historical Theology Group',
    icon: '📜',
    tags: ['List of Sixty Canonical Books', 'Apostolic Fathers', 'Didache', 'Shepherd of Hermas', '1 Enoch', 'Codex Sinaiticus'],
    excerpt: 'Explore the 7th-century manuscript canon index recording the 60 canonical books alongside the Apostolic Fathers (Didache, Clement, Barnabas, Hermas) and ancient Jewish pseudepigrapha (1 Enoch, Jubilees).'
  },
  {
    num: '15',
    slug: 'ephesians-1-in-depth-parallel-exposition',
    category: 'Original Languages & Exegesis',
    readTimeMinutes: 20,
    datePublished: '2026-03-25',
    dateModified: '2026-10-27',
    author: 'AduBible Expository Theology Faculty',
    icon: '🕊️',
    tags: ['Ephesians 1 Exposition', 'Spiritual Blessings in Heavenly Places', 'Predestination Greek', 'Proorizo Strongs', 'Matthew Henry Ephesians'],
    excerpt: 'An in-depth verse-by-verse parallel exposition of Ephesians 1. Examine election, adoption, blood redemption, and Holy Spirit sealing across NKJV, KJV, BSB, Asante Twi, and original Greek Textus Receptus.'
  }
];

// Simple markdown-to-HTML parser for rich rendering
function mdToHtml(md) {
  let html = md;
  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3 id="$1" class="article-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 id="$1" class="article-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="article-h1">$1</h1>');
  
  // Format ids in headings
  html = html.replace(/id="([^"]+)"/g, (match, p1) => {
    const slug = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `id="${slug}"`;
  });

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="article-quote">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="article-link" target="_blank" rel="noopener noreferrer">$1</a>');

  // Code blocks / inline code
  html = html.replace(/`([^`]+)`/gim, '<code class="article-code">$1</code>');

  // Unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="article-li">$1</li>');

  // Ordered list items
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="article-oli">$1</li>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="article-divider" />');

  // Tables
  const lines = html.split('\n');
  const processed = [];
  let inTable = false;
  let tableHeader = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        processed.push('<div class="table-container"><table class="article-table">');
        inTable = true;
        tableHeader = true;
      }
      if (line.includes('---')) {
        // separator line
        tableHeader = false;
        continue;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (tableHeader) {
        processed.push('<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>');
        tableHeader = false;
      } else {
        processed.push('<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>');
      }
    } else {
      if (inTable) {
        processed.push('</tbody></table></div>');
        inTable = false;
      }
      processed.push(lines[i]);
    }
  }
  if (inTable) {
    processed.push('</tbody></table></div>');
  }

  html = processed.join('\n');

  // Paragraphs
  const paragraphs = html.split(/\n\s*\n/);
  const result = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') ||
        trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr') || trimmed.startsWith('<div class="table-container"') ||
        trimmed.startsWith('<li') || trimmed.startsWith('<table')) {
      return trimmed;
    }
    return `<p class="article-p">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('\n\n');

  return result;
}

const articlesData = [];

for (const meta of ARTICLES_META) {
  const mdFile = fs.readdirSync(contentDir).find(f => f.startsWith(meta.num) && f.endsWith('.md'));
  if (!mdFile) {
    console.error(`Could not find markdown file for ${meta.num}-${meta.slug}`);
    continue;
  }

  const rawMd = fs.readFileSync(path.join(contentDir, mdFile), 'utf8');
  const lines = rawMd.split('\n');
  const title = lines[0].replace(/^#\s*/, '').trim();

  // Extract sections
  const sections = [];
  const secRegex = /^##\s+(.*$)/gm;
  let match;
  while ((match = secRegex.exec(rawMd)) !== null) {
    const h2Title = match[1].trim();
    const id = h2Title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    sections.push({ id, title: h2Title });
  }

  const wordCount = (rawMd.match(/[\p{L}\p{N}][\p{L}\p{N}''\\-]*/gu)||[]).length;
  const contentHtml = mdToHtml(rawMd);

  articlesData.push({
    slug: meta.slug,
    order: parseInt(meta.num, 10),
    category: meta.category,
    title,
    subtitle: meta.excerpt,
    metaTitle: `${title} | AduBible`,
    metaDescription: meta.excerpt,
    readTimeMinutes: meta.readTimeMinutes,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    author: meta.author,
    icon: meta.icon,
    tags: meta.tags,
    excerpt: meta.excerpt,
    wordCount,
    sections,
    contentHtml
  });
}

// Generate the TypeScript corpus file
const outputTs = `// AUTOGENERATED MASTER ARTICLES CORPUS
// Total Pillar Articles: ${articlesData.length}
// Generated at: ${new Date().toISOString()}

export interface PillarArticle {
  slug: string;
  order: number;
  category: string;
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  readTimeMinutes: number;
  datePublished: string;
  dateModified: string;
  author: string;
  icon: string;
  tags: string[];
  excerpt: string;
  wordCount: number;
  sections: Array<{ id: string; title: string }>;
  contentHtml: string;
}

export const PILLAR_ARTICLES: PillarArticle[] = ${JSON.stringify(articlesData, null, 2)};

export function getAllArticles(): PillarArticle[] {
  return PILLAR_ARTICLES;
}

export function getArticleBySlug(slug: string): PillarArticle | undefined {
  const clean = slug.toLowerCase().replace(/^\\/+|\\/+$/g, '').replace(/^articles\\//, '');
  return PILLAR_ARTICLES.find((a) => a.slug === clean);
}

export function getArticlesByCategory(category: string): PillarArticle[] {
  return PILLAR_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}

export function getAllArticleCategories(): string[] {
  const cats = new Set(PILLAR_ARTICLES.map((a) => a.category));
  return Array.from(cats);
}
`;

fs.writeFileSync(targetFile, outputTs, 'utf8');
console.log(`[CORPUS COMPILED] Successfully wrote ${articlesData.length} articles to ${targetFile}`);
