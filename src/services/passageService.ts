import { BibleBook } from '../types/bible';

export interface ParsedPassage {
  book: BibleBook;
  chapter: number;
  verse?: number;
}

// Canonical and historical Bible book aliases for rapid, forgiving auto-input
const BOOK_ALIASES: Record<string, string> = {
  // Pentateuch
  'gen': 'genesis',
  'ge': 'genesis',
  'gn': 'genesis',
  'genesis': 'genesis',
  'ex': 'exodus',
  'exo': 'exodus',
  'exod': 'exodus',
  'exodus': 'exodus',
  'lev': 'leviticus',
  'le': 'leviticus',
  'lv': 'leviticus',
  'leviticus': 'leviticus',
  'num': 'numbers',
  'nu': 'numbers',
  'nm': 'numbers',
  'numbers': 'numbers',
  'deut': 'deuteronomy',
  'dt': 'deuteronomy',
  'de': 'deuteronomy',
  'deuteronomy': 'deuteronomy',

  // Historical
  'josh': 'joshua',
  'jos': 'joshua',
  'joshua': 'joshua',
  'judg': 'judges',
  'jdg': 'judges',
  'judges': 'judges',
  'ruth': 'ruth',
  'ru': 'ruth',
  '1sam': '1_samuel',
  '1 sam': '1_samuel',
  '1s': '1_samuel',
  '2sam': '2_samuel',
  '2 sam': '2_samuel',
  '2s': '2_samuel',
  '1kgs': '1_kings',
  '1 kgs': '1_kings',
  '1ki': '1_kings',
  '1 ki': '1_kings',
  '1k': '1_kings',
  '2kgs': '2_kings',
  '2 kgs': '2_kings',
  '2ki': '2_kings',
  '2 ki': '2_kings',
  '2k': '2_kings',
  '1chr': '1_chronicles',
  '1 chr': '1_chronicles',
  '2chr': '2_chronicles',
  '2 chr': '2_chronicles',
  'ezra': 'ezra',
  'ezr': 'ezra',
  'neh': 'nehemiah',
  'ne': 'nehemiah',
  'esth': 'esther',
  'est': 'esther',
  'esther': 'esther',

  // Poetry & Wisdom
  'job': 'job',
  'jb': 'job',
  'ps': 'psalms',
  'psa': 'psalms',
  'psm': 'psalms',
  'pss': 'psalms',
  'psalm': 'psalms',
  'psalms': 'psalms',
  'prov': 'proverbs',
  'prv': 'proverbs',
  'pro': 'proverbs',
  'pr': 'proverbs',
  'proverbs': 'proverbs',
  'eccl': 'ecclesiastes',
  'ecc': 'ecclesiastes',
  'ecclesiastes': 'ecclesiastes',
  'song': 'song_of_solomon',
  'sos': 'song_of_solomon',
  'cant': 'song_of_solomon',
  'canticles': 'song_of_solomon',

  // Major Prophets
  'isa': 'isaiah',
  'is': 'isaiah',
  'isaiah': 'isaiah',
  'jer': 'jeremiah',
  'je': 'jeremiah',
  'jeremiah': 'jeremiah',
  'lam': 'lamentations',
  'la': 'lamentations',
  'lamentations': 'lamentations',
  'ezek': 'ezekiel',
  'eze': 'ezekiel',
  'ezk': 'ezekiel',
  'ezekiel': 'ezekiel',
  'dan': 'daniel',
  'da': 'daniel',
  'daniel': 'daniel',

  // Minor Prophets
  'hos': 'hosea',
  'hosea': 'hosea',
  'joel': 'joel',
  'jl': 'joel',
  'amos': 'amos',
  'am': 'amos',
  'obad': 'obadiah',
  'ob': 'obadiah',
  'jonah': 'jonah',
  'jon': 'jonah',
  'jnh': 'jonah',
  'mic': 'micah',
  'micah': 'micah',
  'nah': 'nahum',
  'na': 'nahum',
  'hab': 'habakkuk',
  'habakkuk': 'habakkuk',
  'zeph': 'zephaniah',
  'zep': 'zephaniah',
  'hag': 'haggai',
  'hg': 'haggai',
  'zech': 'zechariah',
  'zec': 'zechariah',
  'mal': 'malachi',
  'malachi': 'malachi',

  // Gospels & Acts
  'matt': 'matthew',
  'mat': 'matthew',
  'mt': 'matthew',
  'matthew': 'matthew',
  'mark': 'mark',
  'mrk': 'mark',
  'mk': 'mark',
  'luke': 'luke',
  'luk': 'luke',
  'lk': 'luke',
  'john': 'john',
  'jhn': 'john',
  'jn': 'john',
  'acts': 'acts',
  'act': 'acts',
  'ac': 'acts',

  // Epistles
  'rom': 'romans',
  'ro': 'romans',
  'rm': 'romans',
  'romans': 'romans',
  '1cor': '1_corinthians',
  '1 cor': '1_corinthians',
  '1co': '1_corinthians',
  '1 co': '1_corinthians',
  '2cor': '2_corinthians',
  '2 cor': '2_corinthians',
  '2co': '2_corinthians',
  '2 co': '2_corinthians',
  'gal': 'galatians',
  'ga': 'galatians',
  'galatians': 'galatians',
  'eph': 'ephesians',
  'ephes': 'ephesians',
  'ephesians': 'ephesians',
  'phil': 'philippians',
  'php': 'philippians',
  'philippians': 'philippians',
  'col': 'colossians',
  'colossians': 'colossians',
  '1thess': '1_thessalonians',
  '1 thess': '1_thessalonians',
  '1th': '1_thessalonians',
  '1 th': '1_thessalonians',
  '2thess': '2_thessalonians',
  '2 thess': '2_thessalonians',
  '2th': '2_thessalonians',
  '2 th': '2_thessalonians',
  '1tim': '1_timothy',
  '1 tim': '1_timothy',
  '1ti': '1_timothy',
  '1 ti': '1_timothy',
  '2tim': '2_timothy',
  '2 tim': '2_timothy',
  '2ti': '2_timothy',
  '2 ti': '2_timothy',
  'titus': 'titus',
  'tit': 'titus',
  'ti': 'titus',
  'phlm': 'philemon',
  'phm': 'philemon',
  'philemon': 'philemon',
  'heb': 'hebrews',
  'hebrew': 'hebrews',
  'hebrews': 'hebrews',
  'jas': 'james',
  'jm': 'james',
  'james': 'james',
  '1pet': '1_peter',
  '1 pet': '1_peter',
  '1pe': '1_peter',
  '1 pe': '1_peter',
  '2pet': '2_peter',
  '2 pet': '2_peter',
  '2pe': '2_peter',
  '2 pe': '2_peter',
  '1jn': '1_john',
  '1 jn': '1_john',
  '1john': '1_john',
  '1 john': '1_john',
  '2jn': '2_john',
  '2 jn': '2_john',
  '2john': '2_john',
  '2 john': '2_john',
  '3jn': '3_john',
  '3 jn': '3_john',
  '3john': '3_john',
  '3 john': '3_john',
  'jude': 'jude',
  'jud': 'jude',
  'rev': 'revelation',
  're': 'revelation',
  'revelation': 'revelation',
  'apocalypse': 'revelation',
};

/**
 * Robust Bible Book Resolver
 * Finds a book by slug, English name, Twi name, standard abbreviation, or shorthand alias
 */
export function findBookByQuery(bookQuery: string, books: BibleBook[]): BibleBook | undefined {
  if (!bookQuery) return undefined;
  const clean = bookQuery.trim().toLowerCase().replace(/[-_.]/g, ' ').replace(/\s+/g, ' ');
  const cleanCondensed = clean.replace(/\s+/g, '');
  const cleanSlug = clean.replace(/\s+/g, '_');
  const cleanSlugHyphen = clean.replace(/\s+/g, '-');

  // 1. Alias lookup (e.g. ps -> psalms, jn -> john, 1cor -> 1_corinthians)
  const aliasSlug = BOOK_ALIASES[clean] || BOOK_ALIASES[cleanCondensed];
  if (aliasSlug) {
    const found = books.find(
      (b) => b.slug.toLowerCase() === aliasSlug || b.id.toLowerCase() === aliasSlug
    );
    if (found) return found;
  }

  // 2. Exact match on slug, id, abbreviation, English name, or Twi name
  let found = books.find((b) => {
    const slug = b.slug.toLowerCase();
    const id = b.id.toLowerCase();
    const abbrev = (b.abbreviation || '').toLowerCase().replace(/[-_.]/g, ' ').trim();
    const en = b.names.en.toLowerCase();
    const tw = (b.names.tw || '').toLowerCase();
    return (
      slug === cleanSlug ||
      slug === cleanSlugHyphen ||
      id === clean ||
      abbrev === clean ||
      en === clean ||
      tw === clean
    );
  });
  if (found) return found;

  // 3. Starts with match on abbreviation or English name
  found = books.find((b) => {
    const abbrev = (b.abbreviation || '').toLowerCase().replace(/[-_.]/g, ' ').trim();
    const en = b.names.en.toLowerCase();
    const slug = b.slug.toLowerCase();
    return (
      en.startsWith(clean) ||
      slug.startsWith(cleanSlug) ||
      (clean.length >= 2 && abbrev.startsWith(clean))
    );
  });

  return found;
}

/**
 * Universal Scripture Passage Reference Parser
 * Accepts inputs like:
 *   "Psalm 2:2", "ps 2;2", "ps2:2", "ps2;2", "psalm 125",
 *   "1 cor 13:4", "2 cor 5;17", "Jn 3:16", "jn 3;16", "Gen 1:1"
 * Supports delimiters: colon (:), semicolon (;), comma (,), dot (.), or space
 */
export function parsePassageQuery(query: string, books: BibleBook[]): ParsedPassage | null {
  const raw = query.trim();
  if (!raw) return null;

  // Regex matches: [Book part] [optional space] [Chapter digits] [optional delimiter] [optional Verse digits]
  // Examples matched:
  // "Psalm 2:2", "ps 2;2", "ps2:2", "ps 2 2", "psalm 125", "1 cor 13:4", "2 Cor 5;17"
  const pattern = /^([1-4]?\s*[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+)\s*(\d+)?(?:[:;,\.\s](\d+))?$/i;
  const match = raw.match(pattern);
  if (!match) return null;

  const bookPart = match[1].trim();
  const rawCh = match[2] ? parseInt(match[2], 10) : undefined;
  const rawVerse = match[3] ? parseInt(match[3], 10) : undefined;

  const matchedBook = findBookByQuery(bookPart, books);
  if (!matchedBook) return null;

  const validChapter = rawCh ? Math.min(Math.max(1, rawCh), matchedBook.chapters) : 1;
  const validVerse = rawVerse && rawVerse > 0 ? rawVerse : undefined;

  return {
    book: matchedBook,
    chapter: validChapter,
    verse: validVerse,
  };
}

/**
 * Smoothly and gently brings a verse into the comfortable reading zone
 * ONLY if it is not already visible. Uses 'nearest' block positioning to
 * guarantee that scrolling never overshoots or slides past the active verse.
 */
export function scrollVerseIntoViewIfNeeded(el: HTMLElement | null): void {
  if (typeof window === 'undefined' || !el) return;
  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  // Safe comfortable reading zone boundaries:
  // Top nav/toolbar area (~130px)
  // Bottom fixed audio bar area (~110px)
  const safeTop = 130;
  const safeBottom = viewportHeight - 110;

  // If the verse is already comfortably visible within the user's viewport, DO NOT scroll!
  const isAlreadyVisible = rect.top >= safeTop && rect.bottom <= safeBottom;
  if (isAlreadyVisible) {
    return;
  }

  // Gently bring it into view using 'nearest' block alignment to prevent jumping or overshooting
  el.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
  });
}

