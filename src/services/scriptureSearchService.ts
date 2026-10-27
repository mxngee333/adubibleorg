import { BIBLE_BOOKS, BibleBook } from '../data/bibleBooks';
import { getVersionById } from '../data/languagesRegistry';
import { getPrebundledChapter } from '../data/featuredChaptersCorpus';

export interface BibleSearchResult {
  id: string;
  bookSlug: string;
  bookName: string;
  testament: 'OT' | 'NT' | 'DC' | 'PSEUD';
  category: string;
  chapter: number;
  verse: number;
  reference: string;
  text: string;
  highlightedHtml: string;
  snippetHtml: string;
  isExactMatch: boolean;
  score: number;
  versionId: string;
}

interface BollsSearchRawItem {
  pk: number;
  translation: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

// In-memory cache for fast responsive scripture queries
const searchCache = new Map<string, BibleSearchResult[]>();

/**
 * Strips HTML tags except for <mark> tags used for search keyword highlighting.
 */
function cleanSearchHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  // Normalize <mark> tags to have the search-highlight class
  return rawHtml
    .replace(/<mark>/gi, '<mark class="search-highlight">')
    .replace(/<\/?(i|b|em|strong|span|p|div|u)[^>]*>/gi, '') // strip styling tags but keep mark
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts pure plain text with zero HTML tags.
 */
function stripAllHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Generates a clean preview snippet around the first highlighted match.
 */
function generateSnippet(highlightedHtml: string, maxLength = 150): string {
  if (!highlightedHtml) return '';
  const firstMarkIndex = highlightedHtml.indexOf('<mark');
  if (firstMarkIndex === -1 || highlightedHtml.length <= maxLength) {
    return highlightedHtml;
  }

  // Calculate window around the first match
  const start = Math.max(0, firstMarkIndex - 40);
  let snippet = highlightedHtml.substring(start, start + maxLength);

  // Avoid cutting off tags
  if (start > 0) {
    const firstSpace = snippet.indexOf(' ');
    if (firstSpace !== -1 && firstSpace < 20) {
      snippet = '…' + snippet.substring(firstSpace + 1);
    } else {
      snippet = '…' + snippet;
    }
  }

  if (start + maxLength < highlightedHtml.length) {
    const lastSpace = snippet.lastIndexOf(' ');
    if (lastSpace > snippet.length - 25) {
      snippet = snippet.substring(0, lastSpace) + '…';
    } else {
      snippet = snippet + '…';
    }
  }

  // Ensure unclosed <mark> tags are properly balanced
  const openMarks = (snippet.match(/<mark/g) || []).length;
  const closeMarks = (snippet.match(/<\/mark>/g) || []).length;
  if (openMarks > closeMarks) {
    snippet += '</mark>';
  } else if (closeMarks > openMarks) {
    snippet = '<mark class="search-highlight">' + snippet;
  }

  return snippet;
}

/**
 * Offline / prebundled corpus search fallback.
 */
function searchPrebundledCorpus(
  query: string,
  targetVersion: string
): BibleSearchResult[] {
  const qLower = query.toLowerCase();
  const tokens = qLower.split(/\s+/).filter(Boolean);
  const results: BibleSearchResult[] = [];

  const keyChapters = [
    { slug: 'john', chapter: 3, bookName: 'John', testament: 'NT' as const, category: 'Gospels' },
    { slug: 'john', chapter: 1, bookName: 'John', testament: 'NT' as const, category: 'Gospels' },
    { slug: 'ephesians', chapter: 1, bookName: 'Ephesians', testament: 'NT' as const, category: 'Pauline Epistles' },
    { slug: 'romans', chapter: 8, bookName: 'Romans', testament: 'NT' as const, category: 'Pauline Epistles' },
    { slug: 'psalms', chapter: 23, bookName: 'Psalms', testament: 'OT' as const, category: 'Poetry' },
    { slug: 'genesis', chapter: 1, bookName: 'Genesis', testament: 'OT' as const, category: 'Law' },
  ];

  for (const ch of keyChapters) {
    const pre = getPrebundledChapter(ch.slug, ch.chapter, targetVersion);
    if (!pre) continue;

    for (const v of pre) {
      const vText = v.text || '';
      const vLower = vText.toLowerCase();

      // Check if it matches exact phrase or contains keywords
      const isExact = vLower.includes(qLower);
      const matchesSomeToken = tokens.some((t) => vLower.includes(t));

      if (isExact || matchesSomeToken) {
        // Highlight tokens in text
        let highlighted = vText;
        if (isExact) {
          const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          highlighted = vText.replace(regex, '<mark class="search-highlight">$1</mark>');
        } else {
          for (const token of tokens) {
            if (token.length > 2) {
              const regex = new RegExp(`\\b(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
              highlighted = highlighted.replace(regex, '<mark class="search-highlight">$1</mark>');
            }
          }
        }

        const score = isExact ? 100 : tokens.filter((t) => vLower.includes(t)).length * 10;

        results.push({
          id: `${targetVersion}-${ch.slug}-${ch.chapter}-${v.verse}`,
          bookSlug: ch.slug,
          bookName: ch.bookName,
          testament: ch.testament,
          category: ch.category,
          chapter: ch.chapter,
          verse: v.verse,
          reference: `${ch.bookName} ${ch.chapter}:${v.verse}`,
          text: vText,
          highlightedHtml: highlighted,
          snippetHtml: generateSnippet(highlighted),
          isExactMatch: isExact,
          score,
          versionId: targetVersion,
        });
      }
    }
  }

  return results;
}

/**
 * Searches the entire Bible for a word, phrase, or keyword.
 * Returns verses containing the search term, prioritized by exact matches, with snippet and reference.
 */
export async function searchScripture(
  query: string,
  options: {
    versionId?: string;
    limit?: number;
    testamentFilter?: 'ALL' | 'OT' | 'NT';
  } = {}
): Promise<BibleSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const targetVersion = (options.versionId || 'nkjv').toLowerCase();
  const limit = options.limit || 25;
  const cacheKey = `${targetVersion}:${trimmed.toLowerCase()}:${options.testamentFilter || 'ALL'}:${limit}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  // Determine Bolls translation ID (NKJV, KJV, ESV, etc.)
  const verMeta = getVersionById(targetVersion);
  const bollsId = verMeta?.bollsId || 'NKJV';

  let rawResults: BollsSearchRawItem[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://bolls.life/search/${encodeURIComponent(bollsId)}/?search=${encodeURIComponent(trimmed)}`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        rawResults = data;
      }
    }
  } catch (err) {
    // Network timeout or error - will fallback to prebundled corpus
  }

  const qLower = trimmed.toLowerCase();
  const qTokens = qLower.split(/\s+/).filter((t) => t.length > 1);

  let formattedResults: BibleSearchResult[] = [];

  if (rawResults.length > 0) {
    formattedResults = rawResults
      .map((item) => {
        const book = BIBLE_BOOKS.find((b) => b.number === item.book);
        if (!book) return null;

        const cleanHtml = cleanSearchHtml(item.text);
        const plainText = stripAllHtml(cleanHtml);
        const plainLower = plainText.toLowerCase();

        // Exact phrase check
        const isExactMatch = plainLower.includes(qLower);

        // Scoring: exact matches get +100, plus points for each matched token
        let score = isExactMatch ? 100 : 0;
        for (const token of qTokens) {
          if (plainLower.includes(token)) score += 10;
        }
        if (plainLower.startsWith(qLower)) score += 20;

        return {
          id: `${targetVersion}-${book.slug}-${item.chapter}-${item.verse}`,
          bookSlug: book.slug,
          bookName: book.names.en,
          testament: book.testament,
          category: book.category,
          chapter: item.chapter,
          verse: item.verse,
          reference: `${book.names.en} ${item.chapter}:${item.verse}`,
          text: plainText,
          highlightedHtml: cleanHtml,
          snippetHtml: generateSnippet(cleanHtml),
          isExactMatch,
          score,
          versionId: targetVersion,
        };
      })
      .filter((r): r is BibleSearchResult => r !== null);
  } else {
    // Fallback: search our prebundled featured chapters corpus
    formattedResults = searchPrebundledCorpus(trimmed, targetVersion);
  }

  // Filter by testament if requested
  if (options.testamentFilter && options.testamentFilter !== 'ALL') {
    formattedResults = formattedResults.filter(
      (r) => r.testament === options.testamentFilter
    );
  }

  // Sort: Exact phrase matches first, then highest token score
  formattedResults.sort((a, b) => {
    if (a.isExactMatch && !b.isExactMatch) return -1;
    if (!a.isExactMatch && b.isExactMatch) return 1;
    return b.score - a.score;
  });

  const finalResults = formattedResults.slice(0, limit);

  // Cache up to 100 queries
  if (searchCache.size > 100) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }
  searchCache.set(cacheKey, finalResults);

  return finalResults;
}
