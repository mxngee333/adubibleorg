import {
  BIBLE_BOOKS,
  getBookById,
  getBookBySlug,
} from '../data/bibleBooks';
import {
  BIBLE_VERSIONS,
  LANGUAGES_REGISTRY,
  getVersionById,
} from '../data/languagesRegistry';
import {
  getPrebundledChapter,
  adaptVerseToLanguage,
} from '../data/featuredChaptersCorpus';
import licensesJson from '../data/wisdom/licenses.json';
import {
  BibleBook,
  BibleVersion,
  ChapterData,
  ChapterFootnote,
  CustomBibleAddon,
  LanguageMetadata,
  VerseData,
  VersePiece,
} from '../types/bible';
import { getCachedChapter, setCachedChapter } from './studyVaultService';

const licensesMap = licensesJson as Record<string, { url: string; text: string }>;
const memoryCache = new Map<string, ChapterData>();

function parseHelloaoChapterPayload(
  json: any,
  versionId: string,
  helloaoId: string,
  book: { id: string; slug: string; names: Record<string, string> },
  validChapter: number,
  sourceLabel: string
): ChapterData | null {
  // If json is already in normalized ChapterData format
  if (json && Array.isArray(json.verses) && json.verses.length > 0) {
    return {
      versionId,
      bookId: book.id,
      bookSlug: book.slug,
      bookLocalName: json.bookLocalName || book.names.en,
      chapter: validChapter,
      verses: json.verses,
      chapterFootnotes: json.chapterFootnotes || [],
      audioUrl: json.audioUrl,
      source: sourceLabel,
      licenseUrl: json.licenseUrl,
      licenseText: json.licenseText,
    };
  }

  const contentArr = json?.chapter?.content;
  if (!Array.isArray(contentArr)) return null;

  const verses: VerseData[] = [];
  let pendingHeading: string | undefined;

  for (const item of contentArr) {
    if (item.type === 'heading' && Array.isArray(item.content)) {
      pendingHeading = item.content
        .map((c: any) => (typeof c === 'string' ? c : c?.text || ''))
        .join(' ')
        .trim();
    } else if (item.type === 'verse' && Array.isArray(item.content)) {
      const textParts: string[] = [];
      const pieces: VersePiece[] = [];
      for (const piece of item.content) {
        if (typeof piece === 'string') {
          textParts.push(piece);
          pieces.push(piece);
        } else if (piece && typeof piece === 'object') {
          if ('text' in piece && piece.text) {
            textParts.push(String(piece.text));
            pieces.push({
              text: String(piece.text),
              lineBreak: Boolean(piece.lineBreak),
            });
          } else if (piece.lineBreak) {
            textParts.push(' ');
            pieces.push({ lineBreak: true });
          } else if (typeof piece.noteId === 'number') {
            pieces.push({ noteId: piece.noteId });
          } else if (piece.heading) {
            textParts.push(String(piece.heading));
            pieces.push({ heading: String(piece.heading) });
          }
        }
      }
      const joined = textParts.join(' ').replace(/\s+/g, ' ').trim();
      if (joined || pieces.length > 0) {
        verses.push({
          verse: Number(item.number) || verses.length + 1,
          text: joined,
          heading: pendingHeading,
          pieces,
        });
        pendingHeading = undefined;
      }
    }
  }

  if (verses.length === 0) return null;

  const rawFootnotes = Array.isArray(json?.chapter?.footnotes)
    ? json.chapter.footnotes
    : [];
  const chapterFootnotes: ChapterFootnote[] = rawFootnotes.map((fn: any, idx: number) => ({
    noteId: typeof fn.noteId === 'number' ? fn.noteId : idx,
    caller: fn.caller || '+',
    text: String(fn.text || ''),
    reference: fn.reference,
  }));

  const audioLinks = json?.thisChapterAudioLinks || {};
  const firstAudioUrl =
    typeof audioLinks === 'object' && audioLinks !== null
      ? (Object.values(audioLinks)[0] as string | undefined)
      : undefined;

  const lic = licensesMap[helloaoId];

  return {
    versionId,
    bookId: book.id,
    bookSlug: book.slug,
    bookLocalName:
      json?.book?.commonName || json?.book?.name || book.names.en,
    chapter: validChapter,
    verses,
    chapterFootnotes,
    audioUrl: firstAudioUrl,
    source: sourceLabel,
    licenseUrl: lic?.url || json?.translation?.licenseUrl || json?.translation?.website,
    licenseText: lic?.text,
  };
}

export function getAllCanonicalBooks(): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.testament === 'OT' || b.testament === 'NT').map((b) => ({
    id: b.id,
    slug: b.slug,
    number: b.number,
    testament: b.testament,
    category: b.category,
    chapters: b.chapters,
    author: b.author,
    canonStatus: b.canonStatus,
    historicalEra: b.historicalEra,
    names: b.names,
  }));
}

export function getAllHistoricalBooks(): BibleBook[] {
  return BIBLE_BOOKS.map((b) => ({
    id: b.id,
    slug: b.slug,
    number: b.number,
    testament: b.testament,
    category: b.category,
    chapters: b.chapters,
    author: b.author,
    canonStatus: b.canonStatus,
    historicalEra: b.historicalEra,
    names: b.names,
  }));
}

export function getAllLanguagesMetadata(): LanguageMetadata[] {
  return LANGUAGES_REGISTRY.map((l) => ({
    code: l.code,
    hreflang: l.code.toLowerCase(),
    routePrefix: l.code === 'en' ? '/' : `/${l.code.toLowerCase()}/`,
    name: l.name,
    nativeName: l.nativeName,
    script: l.dir === 'rtl' ? 'RTL' : 'LTR',
    dir: l.dir,
    region: l.region,
    flag: l.flag,
    isMegaMultilingual: true,
  }));
}

export function getAllBibleVersions(customAddons: CustomBibleAddon[] = []): BibleVersion[] {
  const builtIn: BibleVersion[] = BIBLE_VERSIONS.map((v) => ({
    id: v.id,
    code: v.shortCode,
    name: v.name,
    shortName: v.shortCode,
    languageCode: v.langCode,
    languageName: v.languageName,
    nativeLanguageName: v.nativeTitle,
    year: v.year,
    copyright: v.copyright,
    hasStrongs: v.hasStrongs,
    isInterlinear: v.isOriginalLanguage,
    dir: v.dir,
    sourceType: 'bundled',
    helloaoId: v.helloaoId,
    bollsId: v.bollsId,
    description: v.description,
  }));

  const customMapped: BibleVersion[] = customAddons.map((ca) => ({
    id: ca.id,
    code: ca.code,
    name: ca.name,
    shortName: ca.shortName,
    languageCode: ca.languageCode,
    languageName: ca.languageName,
    nativeLanguageName: ca.nativeLanguageName,
    year: 'Add-on',
    copyright: 'User Add-on / Open Source',
    dir: ca.dir,
    sourceType: ca.id.startsWith('helloao-') ? 'helloao' : 'custom',
    helloaoId: ca.id.startsWith('helloao-') ? ca.code : undefined,
    description: ca.description,
  }));

  return [...builtIn, ...customMapped];
}

function stripHtmlAndExtractStrongs(rawHtml: string): {
  cleanText: string;
  strongsCodes: string[];
} {
  const strongsCodes: string[] = [];
  const withExtracted = rawHtml.replace(/<S>(\d+)<\/S>/gi, (_, num) => {
    strongsCodes.push(num);
    return '';
  });
  const cleanText = withExtracted
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { cleanText, strongsCodes };
}

export async function resolveChapterData(
  versionId: string,
  bookSlugOrId: string,
  chapterNum: number,
  customAddons: CustomBibleAddon[] = []
): Promise<ChapterData> {
  const book =
    getBookBySlug(bookSlugOrId) ||
    getBookById(bookSlugOrId) ||
    BIBLE_BOOKS.find((b) => b.slug === 'ephesians') ||
    BIBLE_BOOKS[0];

  const validChapter = Math.min(Math.max(1, chapterNum || 1), book.chapters);
  const memKey = `${versionId}:${book.id}:${validChapter}`;

  if (memoryCache.has(memKey)) {
    return memoryCache.get(memKey)!;
  }

  // 1. Check Custom User Add-on local chapters
  const customAddon = customAddons.find((a) => a.id === versionId);
  if (customAddon) {
    const chKey = `${book.id}.${validChapter}`;
    const slugKey = `${book.slug}.${validChapter}`;
    const customVerses = customAddon.chapters[chKey] || customAddon.chapters[slugKey];
    if (customVerses && customVerses.length > 0) {
      const result: ChapterData = {
        versionId,
        bookId: book.id,
        bookSlug: book.slug,
        chapter: validChapter,
        verses: customVerses,
        source: 'Custom Language Add-on Vault',
      };
      memoryCache.set(memKey, result);
      return result;
    }
  }

  const verMeta = getVersionById(versionId);
  const helloaoId =
    customAddon && customAddon.id.startsWith('helloao-')
      ? customAddon.code
      : verMeta?.helloaoId;
  const bollsId = verMeta?.bollsId;
  const licInfo = helloaoId ? licensesMap[helloaoId] : undefined;

  // 2A. For Ephesians 1, check local 28-edition Wisdom Bible Seed JSON (/seed/${helloaoId}.json) first!
  // (Except for NKJV which uses our dedicated NKJV Study Corpus)
  if (
    book.id === 'EPH' &&
    validChapter === 1 &&
    helloaoId &&
    versionId !== 'nkjv' &&
    typeof window !== 'undefined'
  ) {
    try {
      const seedRes = await fetch(`/seed/${encodeURIComponent(helloaoId)}.json`);
      if (seedRes.ok) {
        const seedJson = await seedRes.json();
        const parsedSeed = parseHelloaoChapterPayload(
          seedJson,
          versionId,
          helloaoId,
          book,
          validChapter,
          `Wisdom Seed Corpus (${helloaoId})`
        );
        if (parsedSeed) {
          memoryCache.set(memKey, parsedSeed);
          return parsedSeed;
        }
      }
    } catch {
      // Fall through to prebundled corpus
    }
  }

  // 2B. Check 0ms Pre-bundled Corpus (Ephesians 1, Genesis 1, Psalm 23, John 1, John 3, Romans 8)
  const prebundled = getPrebundledChapter(book.slug, validChapter, versionId);
  if (prebundled && prebundled.length > 0) {
    const verses: VerseData[] = prebundled.map((v) => ({
      verse: v.verse,
      text: v.text,
      heading: v.heading,
      footnotes: v.footnotes,
      crossRefs: v.strongsTags,
    }));
    const result: ChapterData = {
      versionId,
      bookId: book.id,
      bookSlug: book.slug,
      bookLocalName: book.names[verMeta.langCode] || book.names.en,
      chapter: validChapter,
      verses,
      source: 'Elohim Bundled Parallel Corpus (0ms)',
      licenseUrl: licInfo?.url,
      licenseText: licInfo?.text || verMeta.copyright,
    };
    memoryCache.set(memKey, result);
    return result;
  }

  // 3. Check IndexedDB Offline Vault Cache
  const cached = await getCachedChapter(versionId, book.id, validChapter);
  if (cached && cached.verses && cached.verses.length > 0) {
    memoryCache.set(memKey, cached);
    return cached;
  }

  // Helper for resilient timeout-bounded fetch
  const fetchWithTimeout = async (url: string, timeoutMs = 2500): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  };

  // 4A. Cloudflare Planetary Edge & R2 Zero-Egress Vault (Scale: 4 Billion Readers)
  const edgeBaseUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_EDGE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_R2_SCRIPTURE_URL) ||
    ''
  ).trim().replace(/\/$/, '');

  if (edgeBaseUrl) {
    try {
      const edgeUrl = `${edgeBaseUrl}/api/v1/chapters/${encodeURIComponent(versionId.toLowerCase())}/${encodeURIComponent(book.id.toUpperCase())}/${validChapter}.json`;
      const edgeRes = await fetchWithTimeout(edgeUrl, 2500);
      if (edgeRes.ok) {
        const edgeJson = await edgeRes.json();
        const parsed = parseHelloaoChapterPayload(
          edgeJson,
          versionId,
          helloaoId || versionId,
          book,
          validChapter,
          'Cloudflare Planetary Edge (R2 Zero-Egress Vault)'
        );
        if (parsed) {
          memoryCache.set(memKey, parsed);
          await setCachedChapter(parsed);
          return parsed;
        }
      }
    } catch {
      // Fall through to Hetzner Origin
    }
  }

  // 4B. Hetzner Dedicated Origin Cluster (Bare-Metal High-Throughput Fallback)
  const hetznerBaseUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HETZNER_ORIGIN_URL) ||
    ''
  ).trim().replace(/\/$/, '');

  if (hetznerBaseUrl) {
    try {
      const hetznerUrl = `${hetznerBaseUrl}/api/v1/chapters/${encodeURIComponent(versionId.toLowerCase())}/${encodeURIComponent(book.id.toUpperCase())}/${validChapter}`;
      const hetznerRes = await fetchWithTimeout(hetznerUrl, 3000);
      if (hetznerRes.ok) {
        const hetznerJson = await hetznerRes.json();
        const parsed = parseHelloaoChapterPayload(
          hetznerJson,
          versionId,
          helloaoId || versionId,
          book,
          validChapter,
          'Hetzner High-Throughput Origin Cluster'
        );
        if (parsed) {
          memoryCache.set(memKey, parsed);
          await setCachedChapter(parsed);
          return parsed;
        }
      }
    } catch {
      // Fall through to public APIs
    }
  }

  // 4C. Try Free Use Bible API (bible.helloao.org)
  if (helloaoId) {
    try {
      const res = await fetch(
        `https://bible.helloao.org/api/${encodeURIComponent(helloaoId)}/${book.id}/${validChapter}.json`
      );
      if (res.ok) {
        const json = await res.json();
        const parsed = parseHelloaoChapterPayload(
          json,
          versionId,
          helloaoId,
          book,
          validChapter,
          `Free Use Bible Cloud (${helloaoId})`
        );
        if (parsed) {
          memoryCache.set(memKey, parsed);
          await setCachedChapter(parsed);
          return parsed;
        }
      }
    } catch {
      // Fall through to Bolls API
    }
  }

  // 4B. Try Bolls.life API
  if (bollsId) {
    try {
      const res = await fetch(
        `https://bolls.life/get-text/${encodeURIComponent(bollsId)}/${book.number}/${validChapter}/`
      );
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length > 0) {
          const verses: VerseData[] = arr.map(
            (item: { verse?: number; text?: string }, i: number) => {
              const { cleanText, strongsCodes } = stripHtmlAndExtractStrongs(
                String(item.text || '')
              );
              return {
                verse: Number(item.verse) || i + 1,
                text: cleanText,
                crossRefs: strongsCodes.map(
                  (num) => `${book.testament === 'OT' ? 'H' : 'G'}${num}`
                ),
              };
            }
          );
          const result: ChapterData = {
            versionId,
            bookId: book.id,
            bookSlug: book.slug,
            chapter: validChapter,
            verses,
            source: `Bolls Exegetical Cloud (${bollsId})`,
          };
          memoryCache.set(memKey, result);
          await setCachedChapter(result);
          return result;
        }
      }
    } catch {
      // Fall through to bible-api.com
    }
  }

  // 4C. Try bible-api.com base English + adapt to target language if needed
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(book.names.en)}+${validChapter}?translation=kjv`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.verses) && data.verses.length > 0) {
        const verses: VerseData[] = data.verses.map(
          (v: { verse?: number; text?: string }, i: number) => {
            const vNum = Number(v.verse) || i + 1;
            const raw = String(v.text || '').replace(/\s+/g, ' ').trim();
            return {
              verse: vNum,
              text: adaptVerseToLanguage(raw, book.slug, validChapter, vNum, versionId),
            };
          }
        );
        const result: ChapterData = {
          versionId,
          bookId: book.id,
          bookSlug: book.slug,
          chapter: validChapter,
          verses,
          source: 'Open Scripture Cloud Stream',
        };
        memoryCache.set(memKey, result);
        await setCachedChapter(result);
        return result;
      }
    }
  } catch {
    // Offline fallback below
  }

  // 5. Ultimate Offline Sanctuary Fallback
  const fallbackPrebundled = getPrebundledChapter('ephesians', 1, versionId) || [];
  const fallbackVerses: VerseData[] = fallbackPrebundled.map((v) => ({
    verse: v.verse,
    text: v.text,
    heading: v.heading,
  }));

  return {
    versionId,
    bookId: book.id,
    bookSlug: book.slug,
    chapter: validChapter,
    verses: fallbackVerses,
    source: 'Offline Sanctuary Vault',
  };
}

/**
 * Parse BibleHub-compatible URL paths:
 * - /:version/:book/:chapter (e.g., /nkjv/ephesians/1 or /nkjv/ephesians/1.htm or /twi/ephesians/1)
 * - /parallel/:book/:chapter
 * - /:locale/ (e.g., /tw/, /fr/, /es/, /de/)
 */
export function parseBibleHubUrlPath(pathname: string): {
  versionId?: string;
  bookSlug?: string;
  chapter?: number;
  isParallelRoute?: boolean;
  legalPage?: 'about' | 'how-to-use' | 'privacy' | 'terms';
  targetTab?: 'canonical' | 'deuterocanon' | 'list-of-sixty';
} {
  const cleanPath = pathname
    .replace(/\.html?$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .trim();

  if (!cleanPath) {
    return { versionId: 'nkjv', bookSlug: 'ephesians', chapter: 1 };
  }

  const lower = cleanPath.toLowerCase();
  if (lower === 'deuterocanon' || lower === 'deuterocanonical' || lower === 'apocrypha') {
    return {
      versionId: 'kjv-apoc',
      bookSlug: 'wisdom',
      chapter: 1,
      targetTab: 'deuterocanon',
    };
  }
  if (lower === 'list-of-sixty' || lower === 'list-of-60' || lower === 'pseudepigrapha' || lower === 'ancient-apocrypha') {
    return {
      versionId: 'charles',
      bookSlug: 'enoch',
      chapter: 1,
      targetTab: 'list-of-sixty',
    };
  }

  if (
    lower === 'about' ||
    lower === 'how-to-use' ||
    lower === 'privacy' ||
    lower === 'terms'
  ) {
    return {
      versionId: 'nkjv',
      bookSlug: 'ephesians',
      chapter: 1,
      legalPage: lower as 'about' | 'how-to-use' | 'privacy' | 'terms',
    };
  }

  const segments = lower.split('/').filter(Boolean);

  // e.g. /nkjv/ephesians/1 or /twi/ephesians/1 or /parallel/ephesians/1
  if (segments.length >= 3) {
    const [segVer, segBook, segCh] = segments;
    const book = getBookBySlug(segBook) || getBookById(segBook);
    const chNum = parseInt(segCh, 10) || 1;
    if (segVer === 'parallel') {
      return {
        isParallelRoute: true,
        bookSlug: book?.slug || 'ephesians',
        chapter: chNum,
      };
    }
    const ver = getVersionById(segVer);
    return {
      versionId: ver.id,
      bookSlug: book?.slug || 'ephesians',
      chapter: chNum,
    };
  }

  // e.g. /ephesians/1
  if (segments.length === 2) {
    const [segFirst, segSecond] = segments;
    const maybeBook = getBookBySlug(segFirst) || getBookById(segFirst);
    if (maybeBook && /^\d+$/.test(segSecond)) {
      return {
        versionId: 'nkjv',
        bookSlug: maybeBook.slug,
        chapter: parseInt(segSecond, 10) || 1,
      };
    }
  }

  // e.g. /tw/ or /fr/ or /de/
  if (segments.length === 1) {
    const code = segments[0];
    const langMatch = LANGUAGES_REGISTRY.find((l) => l.code.toLowerCase() === code);
    if (langMatch) {
      return {
        versionId: langMatch.defaultVersionId,
        bookSlug: 'ephesians',
        chapter: 1,
      };
    }
    const verMatch = BIBLE_VERSIONS.find(
      (v) => v.id.toLowerCase() === code || v.shortCode.toLowerCase() === code
    );
    if (verMatch) {
      return {
        versionId: verMatch.id,
        bookSlug: 'ephesians',
        chapter: 1,
      };
    }
  }

  return { versionId: 'nkjv', bookSlug: 'ephesians', chapter: 1 };
}
