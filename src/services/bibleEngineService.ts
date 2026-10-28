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
import {
  isTwiLanguage,
  resolveTwiAudioUrl,
  getCornerstoneTwiAudioUrl,
} from './twiAudioService';
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

// Helper for resilient timeout-bounded fetch with zero-hang guarantee
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
    if ((item.type === 'heading' || item.type === 'hebrew_subtitle') && Array.isArray(item.content)) {
      const sub = item.content
        .map((c: any) => (typeof c === 'string' ? c : c?.text || ''))
        .join(' ')
        .trim();
      pendingHeading = pendingHeading ? `${pendingHeading} — ${sub}` : sub;
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
  let resolvedAudioUrl =
    typeof audioLinks === 'object' && audioLinks !== null
      ? (Object.values(audioLinks)[0] as string | undefined)
      : undefined;

  if (!resolvedAudioUrl && isTwiLanguage(versionId)) {
    resolvedAudioUrl =
      getCornerstoneTwiAudioUrl(book.slug, validChapter) ||
      resolveTwiAudioUrl(book.slug, validChapter, versionId) ||
      undefined;
  }

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
    audioUrl: resolvedAudioUrl,
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
    const cachedMem = memoryCache.get(memKey)!;
    // Auto-heal: Purge any legacy poisoned responses containing legal disputes
    const isPoisoned = cachedMem.verses?.some((v) => {
      const t = String(v.text || '');
      return (
        t.includes('prohibited me') ||
        t.includes('Biblica, Inc.') ||
        t.includes('choose truly free translations')
      );
    });
    if (isPoisoned) {
      memoryCache.delete(memKey);
    } else {
      return cachedMem;
    }
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

  // 2A. For Ephesians 1, check local Wisdom Bible Seed JSON (/seed/${seedName}.json) first!
  // (Except for NKJV which uses our dedicated NKJV Study Corpus)
  const seedName = helloaoId || versionId;
  if (
    book.id === 'EPH' &&
    validChapter === 1 &&
    seedName &&
    versionId !== 'nkjv' &&
    typeof window !== 'undefined'
  ) {
    try {
      const seedRes = await fetch(`/seed/${encodeURIComponent(seedName)}.json`);
      if (seedRes.ok) {
        const seedJson = await seedRes.json();
        const parsedSeed = parseHelloaoChapterPayload(
          seedJson,
          versionId,
          seedName,
          book,
          validChapter,
          `Wisdom Seed Corpus (${seedName})`
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
      audioUrl: isTwiLanguage(versionId)
        ? getCornerstoneTwiAudioUrl(book.slug, validChapter) ||
          resolveTwiAudioUrl(book.slug, validChapter, versionId) ||
          undefined
        : undefined,
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

  // 3B. Dedicated Authentic NIV Scripture Vault (Local 0ms Seed + Worldwide CDN Fallback)
  if (versionId === 'niv') {
    try {
      const nivRes = await fetchWithTimeout(`/seed/niv/${encodeURIComponent(book.slug)}.json`, 1800);
      if (nivRes.ok) {
        const nivBookData = await nivRes.json();
        const chObj = nivBookData.chapters?.find((c: any) => Number(c.chapter) === validChapter);
        if (chObj && Array.isArray(chObj.verses) && chObj.verses.length > 0) {
          const verses: VerseData[] = chObj.verses.map((v: any) => ({
            verse: Number(v.verse),
            text: String(v.text || '').replace(/\s+/g, ' ').trim(),
          }));
          const result: ChapterData = {
            versionId: 'niv',
            bookId: book.id,
            bookSlug: book.slug,
            bookLocalName: book.names.en,
            chapter: validChapter,
            verses,
            source: 'AduBible Authentic NIV Corpus (0ms)',
          };
          memoryCache.set(memKey, result);
          await setCachedChapter(result);
          return result;
        }
      }
    } catch {
      // Fallback to jsDelivr CDN
      try {
        const cdnRes = await fetchWithTimeout(
          `https://cdn.jsdelivr.net/gh/aruljohn/Bible-niv@master/${encodeURIComponent(book.names.en)}.json`,
          2500
        );
        if (cdnRes.ok) {
          const cdnData = await cdnRes.json();
          const chObj = cdnData.chapters?.find((c: any) => Number(c.chapter) === validChapter);
          if (chObj && Array.isArray(chObj.verses) && chObj.verses.length > 0) {
            const verses: VerseData[] = chObj.verses.map((v: any) => ({
              verse: Number(v.verse),
              text: String(v.text || '').replace(/\s+/g, ' ').trim(),
            }));
            const result: ChapterData = {
              versionId: 'niv',
              bookId: book.id,
              bookSlug: book.slug,
              bookLocalName: book.names.en,
              chapter: validChapter,
              verses,
              source: 'Authentic NIV Cloud Corpus',
            };
            memoryCache.set(memKey, result);
            await setCachedChapter(result);
            return result;
          }
        }
      } catch {
        // Fall through
      }
    }
  }

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
      const res = await fetchWithTimeout(
        `https://bible.helloao.org/api/${encodeURIComponent(helloaoId)}/${book.id}/${validChapter}.json`,
        2500
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

  // 4D. Try Bolls.life API with strict anti-poison & dispute message rejection
  if (bollsId && versionId !== 'niv') {
    try {
      const res = await fetchWithTimeout(
        `https://bolls.life/get-text/${encodeURIComponent(bollsId)}/${book.number}/${validChapter}/`,
        2500
      );
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length > 0) {
          // Reject any copyright/legal rant message returned instead of Scripture
          const isPoisonedNotice = arr.some((item: any) => {
            const str = String(item?.text || '');
            return (
              str.includes('prohibited me') ||
              str.includes('Biblica, Inc.') ||
              str.includes('choose truly free translations')
            );
          });

          if (!isPoisonedNotice) {
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
          } else {
            console.warn(`[BibleEngine] Rejected poisoned Bolls text for ${versionId} ${book.id} ${validChapter}`);
          }
        }
      }
    } catch {
      // Fall through to bible-api.com
    }
  }

  // 4D-Native. Dedicated Authentic Regional Vernacular Provider (Ga, Amharic, Zulu)
  const nativeProviders: Record<string, { verId: string; tag: string; source: string; lic: string }> = {
    gaa: {
      verId: '2708',
      tag: 'NEGAB',
      source: 'Bible Society of Ghana (NEGAB Ŋmalɛ Krɔŋkrɔŋ Lɛ)',
      lic: 'The Bible Society of Ghana (NEGAB)',
    },
    am: {
      verId: '1260',
      tag: 'NASV',
      source: 'Bible Society of Ethiopia / Biblica (NASV አዲሱ መደበኛ ትርጒም)',
      lic: 'Bible Society of Ethiopia / Biblica',
    },
    zu: {
      verId: '286',
      tag: 'ZUL59',
      source: 'Bible Society of South Africa (IBhayibheli Eliyingcwele 1959)',
      lic: 'Bible Society of South Africa (ZUL59)',
    },
  };

  const matchedNative = nativeProviders[versionId] || nativeProviders[verMeta?.langCode];
  if (matchedNative) {
    try {
      const usfmBook = book.id.toUpperCase();
      const nativeRes = await fetchWithTimeout(
        `https://www.bible.com/bible/${matchedNative.verId}/${encodeURIComponent(usfmBook)}.${validChapter}.${matchedNative.tag}`,
        3500
      );
      if (nativeRes.ok) {
        const nativeHtml = await nativeRes.text();
        const strippedHtml = nativeHtml.replace(/<span class="[^"]*note[^"]*"[\s\S]*?<\/span>\s*<\/span>/gi, '');
        const reg = new RegExp(
          `data-usfm="${usfmBook}\\.${validChapter}\\.(\\d+)"[^>]*>([\\s\\S]*?)(?=<span class="[^"]*verse" data-usfm="${usfmBook}\\.${validChapter}\\.|\\<\\/div\\>|$)`,
          'gi'
        );
        const versesMap: Record<number, string> = {};
        let m: RegExpExecArray | null;
        while ((m = reg.exec(strippedHtml)) !== null) {
          const vNum = parseInt(m[1], 10);
          const segment = m[2];
          const contentMatches = [...segment.matchAll(/class="[^"]*content"[^>]*>([\s\S]*?)<\/span>/gi)];
          const cleanVerse = contentMatches
            .map((cm) => cm[1].replace(/<[^>]+>/g, '').trim())
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (cleanVerse) {
            if (!versesMap[vNum]) {
              versesMap[vNum] = cleanVerse;
            } else if (!versesMap[vNum].includes(cleanVerse)) {
              versesMap[vNum] += ' ' + cleanVerse;
            }
          }
        }

        const vKeys = Object.keys(versesMap)
          .map(Number)
          .sort((a, b) => a - b);
        if (vKeys.length > 0) {
          const verses: VerseData[] = vKeys.map((vNum) => ({
            verse: vNum,
            text: versesMap[vNum],
          }));
          const result: ChapterData = {
            versionId,
            bookId: book.id,
            bookSlug: book.slug,
            bookLocalName: book.names[verMeta?.langCode] || book.names.en,
            chapter: validChapter,
            verses,
            source: matchedNative.source,
            licenseText: matchedNative.lic,
          };
          memoryCache.set(memKey, result);
          await setCachedChapter(result);
          return result;
        }
      }
    } catch {
      // Fall through to prebundled or safe fallback
    }
  }

  // 4E. Try bible-api.com base English + adapt to target language if needed
  // (Strict rule: ONLY for English translations — NEVER disguise English KJV text as vernacular translations)
  if (
    verMeta?.langCode === 'en' ||
    versionId === 'nkjv' ||
    versionId === 'kjv' ||
    versionId === 'bsb' ||
    versionId === 'asv' ||
    versionId === 'web'
  ) {
    try {
      const res = await fetchWithTimeout(
        `https://bible-api.com/${encodeURIComponent(book.names.en)}+${validChapter}?translation=kjv`,
        2500
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
  legalPage?:
    | 'about'
    | 'how-to-use'
    | 'privacy'
    | 'terms'
    | 'editorial-policy'
    | 'glossary'
    | 'sources'
    | 'contact'
    | 'cookie-policy';
  targetTab?: 'canonical' | 'deuterocanon' | 'list-of-sixty' | 'articles' | 'donate';
  articleSlug?: string;
} {
  const cleanPath = pathname
    .replace(/\.html?$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .trim();

  if (!cleanPath) {
    return { versionId: 'nkjv', bookSlug: 'genesis', chapter: 1 };
  }

  const lower = cleanPath.toLowerCase();

  // Support /donate/ or /give/
  if (lower === 'donate' || lower === 'donation' || lower === 'donations' || lower === 'give') {
    return {
      versionId: 'nkjv',
      bookSlug: 'ephesians',
      chapter: 1,
      targetTab: 'donate',
    };
  }

  // Articles & Scripture Pillar Guides
  if (lower === 'articles' || lower === 'blog' || lower.startsWith('articles/') || lower.startsWith('blog/')) {
    const slug = lower.replace(/^(articles|blog)\/?/, '').trim();
    return {
      versionId: 'nkjv',
      bookSlug: 'ephesians',
      chapter: 1,
      targetTab: 'articles',
      articleSlug: slug || undefined,
    };
  }

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

  // Legal & Institutional Governance Pages
  if (
    lower === 'about' ||
    lower === 'about-us' ||
    lower === 'how-to-use' ||
    lower === 'guide' ||
    lower === 'privacy' ||
    lower === 'privacy-policy' ||
    lower === 'terms' ||
    lower === 'terms-of-service' ||
    lower === 'terms-and-conditions' ||
    lower === 'contact' ||
    lower === 'contact-us' ||
    lower === 'cookie-policy' ||
    lower === 'cookies' ||
    lower === 'editorial-policy' ||
    lower === 'glossary' ||
    lower === 'sources'
  ) {
    let resolvedKey:
      | 'about'
      | 'how-to-use'
      | 'privacy'
      | 'terms'
      | 'editorial-policy'
      | 'glossary'
      | 'sources'
      | 'contact'
      | 'cookie-policy' = 'about';

    if (lower === 'about' || lower === 'about-us') resolvedKey = 'about';
    else if (lower === 'privacy' || lower === 'privacy-policy') resolvedKey = 'privacy';
    else if (lower === 'terms' || lower === 'terms-of-service' || lower === 'terms-and-conditions') resolvedKey = 'terms';
    else if (lower === 'contact' || lower === 'contact-us') resolvedKey = 'contact';
    else if (lower === 'cookie-policy' || lower === 'cookies') resolvedKey = 'cookie-policy';
    else if (lower === 'how-to-use' || lower === 'guide') resolvedKey = 'how-to-use';
    else if (lower === 'editorial-policy') resolvedKey = 'editorial-policy';
    else if (lower === 'glossary') resolvedKey = 'glossary';
    else if (lower === 'sources') resolvedKey = 'sources';

    return {
      versionId: 'nkjv',
      bookSlug: 'ephesians',
      chapter: 1,
      legalPage: resolvedKey,
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

  return { versionId: 'nkjv', bookSlug: 'genesis', chapter: 1 };
}
