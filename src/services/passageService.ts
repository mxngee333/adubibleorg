import { BibleBook } from '../types/bible';

export interface ParsedPassage {
  book: BibleBook;
  chapter: number;
  verse?: number;
  endVerse?: number;
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
  'psam': 'psalms',
  'psams': 'psalms',
  'psal': 'psalms',
  'psals': 'psalms',
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
  'revelations': 'revelation',
  'apocalypse': 'revelation',

  // 16 Deuterocanonical Scriptures (Catholic & Orthodox)
  'tobit': 'tobit',
  'tob': 'tobit',
  'tb': 'tobit',
  'judith': 'judith',
  'jdt': 'judith',
  'jdth': 'judith',
  'baruch': 'baruch',
  'bar': 'baruch',
  'letter_of_jeremiah': 'letter_of_jeremiah',
  'letter of jeremiah': 'letter_of_jeremiah',
  'epjer': 'letter_of_jeremiah',
  'epistle of jeremiah': 'letter_of_jeremiah',
  'lje': 'letter_of_jeremiah',
  'sirach': 'sirach',
  'sir': 'sirach',
  'ecclesiasticus': 'sirach',
  'ecclus': 'sirach',
  '1_maccabees': '1_maccabees',
  '1 maccabees': '1_maccabees',
  '1maccabees': '1_maccabees',
  '1mac': '1_maccabees',
  '1macc': '1_maccabees',
  '1m': '1_maccabees',
  '2_maccabees': '2_maccabees',
  '2 maccabees': '2_maccabees',
  '2maccabees': '2_maccabees',
  '2mac': '2_maccabees',
  '2macc': '2_maccabees',
  '2m': '2_maccabees',
  'wisdom': 'wisdom',
  'wis': 'wisdom',
  'wisdom of solomon': 'wisdom',
  'wisdom_of_solomon': 'wisdom',
  'wisdomofsolomon': 'wisdom',
  'ws': 'wisdom',
  'add_esther': 'add_esther',
  'add esther': 'add_esther',
  'additions to esther': 'add_esther',
  'esg': 'add_esther',
  'add_daniel': 'add_daniel',
  'add daniel': 'add_daniel',
  'dag': 'add_daniel',
  'susanna': 'add_daniel',
  'sus': 'add_daniel',
  'bel': 'add_daniel',
  'bel and dragon': 'add_daniel',
  'bel and the dragon': 'add_daniel',
  'prayer_of_manasseh': 'prayer_of_manasseh',
  'prayer of manasseh': 'prayer_of_manasseh',
  'prman': 'prayer_of_manasseh',
  'manasseh': 'prayer_of_manasseh',
  'man': 'prayer_of_manasseh',
  '1_esdras': '1_esdras',
  '1 esdras': '1_esdras',
  '1esdras': '1_esdras',
  '1esd': '1_esdras',
  '1es': '1_esdras',
  '3 ezra': '1_esdras',
  '3_ezra': '1_esdras',
  '2_esdras': '2_esdras',
  '2 esdras': '2_esdras',
  '2esdras': '2_esdras',
  '2esd': '2_esdras',
  '2es': '2_esdras',
  '4 ezra': '2_esdras',
  '4_ezra': '2_esdras',
  '3_maccabees': '3_maccabees',
  '3 maccabees': '3_maccabees',
  '3mac': '3_maccabees',
  '3macc': '3_maccabees',
  '4_maccabees': '4_maccabees',
  '4 maccabees': '4_maccabees',
  '4mac': '4_maccabees',
  '4macc': '4_maccabees',
  'psalm_151': 'psalm_151',
  'psalm 151': 'psalm_151',
  'ps151': 'psalm_151',
  'psm151': 'psalm_151',
  'ps2': 'psalm_151',

  // 25 Ancient Apocrypha, Pseudepigrapha & Apostolic Fathers
  'enoch': 'enoch',
  '1enoch': 'enoch',
  '1 enoch': 'enoch',
  '1_enoch': 'enoch',
  'eno': 'enoch',
  'adam_and_eve': 'adam_and_eve',
  'adam and eve': 'adam_and_eve',
  'ade': 'adam_and_eve',
  'book_of_lamech': 'book_of_lamech',
  'book of lamech': 'book_of_lamech',
  'lamech': 'book_of_lamech',
  'lamk': 'book_of_lamech',
  'twelve_patriarchs': 'twelve_patriarchs',
  'twelve patriarchs': 'twelve_patriarchs',
  '12 patriarchs': 'twelve_patriarchs',
  't12p': 'twelve_patriarchs',
  'prayer_of_joseph': 'prayer_of_joseph',
  'prayer of joseph': 'prayer_of_joseph',
  'prj': 'prayer_of_joseph',
  'eldad_and_modad': 'eldad_and_modad',
  'eldad and modad': 'eldad_and_modad',
  'elm': 'eldad_and_modad',
  'testament_of_moses': 'testament_of_moses',
  'testament of moses': 'testament_of_moses',
  'assumption of moses': 'testament_of_moses',
  'asmo': 'testament_of_moses',
  'psalms_of_solomon': 'psalms_of_solomon',
  'psalms of solomon': 'psalms_of_solomon',
  'pssol': 'psalms_of_solomon',
  'apocalypse_of_elijah': 'apocalypse_of_elijah',
  'apocalypse of elijah': 'apocalypse_of_elijah',
  'apel': 'apocalypse_of_elijah',
  'ascension_of_isaiah': 'ascension_of_isaiah',
  'ascension of isaiah': 'ascension_of_isaiah',
  'asi': 'ascension_of_isaiah',
  'apocalypse_of_zephaniah': 'apocalypse_of_zephaniah',
  'apocalypse of zephaniah': 'apocalypse_of_zephaniah',
  'apze': 'apocalypse_of_zephaniah',
  'apocalypse_of_zechariah': 'apocalypse_of_zechariah',
  'apocalypse of zechariah': 'apocalypse_of_zechariah',
  'apzc': 'apocalypse_of_zechariah',
  'apocalyptic_ezra': 'apocalyptic_ezra',
  'apocalyptic ezra': 'apocalyptic_ezra',
  'vision of ezra': 'apocalyptic_ezra',
  'aezr': 'apocalyptic_ezra',
  'history_of_james': 'history_of_james',
  'history of james': 'history_of_james',
  'protoevangelium of james': 'history_of_james',
  'prja': 'history_of_james',
  'apocalypse_of_peter': 'apocalypse_of_peter',
  'apocalypse of peter': 'apocalypse_of_peter',
  'appe': 'apocalypse_of_peter',
  'didache': 'didache',
  'did': 'didache',
  'epistle_of_barnabas': 'epistle_of_barnabas',
  'epistle of barnabas': 'epistle_of_barnabas',
  'barnabas': 'epistle_of_barnabas',
  'ebar': 'epistle_of_barnabas',
  'acts_of_paul': 'acts_of_paul',
  'acts of paul': 'acts_of_paul',
  'apau': 'acts_of_paul',
  'apocalypse_of_paul': 'apocalypse_of_paul',
  'apocalypse of paul': 'apocalypse_of_paul',
  'appa': 'apocalypse_of_paul',
  'shepherd_of_hermas': 'shepherd_of_hermas',
  'shepherd of hermas': 'shepherd_of_hermas',
  'hermas': 'shepherd_of_hermas',
  'herm': 'shepherd_of_hermas',
  '1_clement': '1_clement',
  '1 clement': '1_clement',
  '1clement': '1_clement',
  '1cle': '1_clement',
  '2_clement': '2_clement',
  '2 clement': '2_clement',
  '2clement': '2_clement',
  '2cle': '2_clement',
  'didascalia': 'didascalia',
  'dida': 'didascalia',
  'gospel_of_barnabas': 'gospel_of_barnabas',
  'gospel of barnabas': 'gospel_of_barnabas',
  'gbar': 'gospel_of_barnabas',
  'gospel_of_hebrews': 'gospel_of_hebrews',
  'gospel of the hebrews': 'gospel_of_hebrews',
  'gospel of hebrews': 'gospel_of_hebrews',
  'gheb': 'gospel_of_hebrews',
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
 *   "1 cor 13:4", "2 cor 5;17", "Jn 3:16", "jn 3;16", "Gen 1:1",
 *   "psalm 3 3", "psalm 3:3", "psam 3;3", "Song of Solomon 2:1", "1 cor 13 4"
 * Supports delimiters: colon (:), semicolon (;), comma (,), dot (.), dash (-), space,
 * or "v" / "verse" keywords (e.g. "psalm 3 v 3", "psalm 3v3").
 */
export function parsePassageQuery(query: string, books: BibleBook[]): ParsedPassage | null {
  const raw = query.trim();
  if (!raw) return null;

  // Normalize "chapter", "ch", and "v", "v.", "verse", "verses" between chapter and verse numbers
  const normalized = raw
    .replace(/(\w+)\s+(?:chapters?|ch\.?)\s+(\d+)/i, '$1 $2')
    .replace(/(\d+)\s*(?:verses?|v\.?)\s*(\d+)/i, '$1:$2');

  // Pattern A: Multi-word or single-word book followed by chapter and optional delimiter + verse
  // e.g. "Song of Solomon 2:1", "1 Cor 13 4", "psalm 3 3", "psalm 3:3", "psalm 3", "psalm 3;3"
  const patA = /^([1-4]?\s*[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+(?:\s+[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+)*)\s+(\d+)(?:\s*[:;,\.\s\-]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?(?:\s+.*)?$/i;

  // Pattern B: Compact no-space e.g. "ps2:2", "jn3:16", "psalm3"
  const patB = /^([1-4]?\s*[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+)(\d+)(?:\s*[:;,\.\s\-]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?(?:\s+.*)?$/i;

  // Pattern C: Book only e.g. "psalm", "song of solomon", "1 cor"
  const patC = /^([1-4]?\s*[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+(?:\s+[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+)*)$/i;

  let match = normalized.match(patA) || normalized.match(patB);
  let bookPart = '';
  let rawCh: number | undefined;
  let rawVerse: number | undefined;
  let rawEndVerse: number | undefined;

  if (match) {
    bookPart = match[1].trim();
    rawCh = match[2] ? parseInt(match[2], 10) : undefined;
    rawVerse = match[3] ? parseInt(match[3], 10) : undefined;
    rawEndVerse = match[4] ? parseInt(match[4], 10) : undefined;
  } else {
    const matchC = normalized.match(patC);
    if (!matchC) return null;
    bookPart = matchC[1].trim();
  }

  const matchedBook = findBookByQuery(bookPart, books);
  if (!matchedBook) return null;

  const validChapter = rawCh ? Math.min(Math.max(1, rawCh), matchedBook.chapters) : 1;
  const validVerse = rawVerse && rawVerse > 0 ? rawVerse : undefined;
  const validEndVerse = rawEndVerse && rawVerse && rawEndVerse >= rawVerse ? rawEndVerse : undefined;

  return {
    book: matchedBook,
    chapter: validChapter,
    verse: validVerse,
    endVerse: validEndVerse,
  };
}

/**
 * Synchronous, real-time master state check for Auto-Scroll Reader Sync.
 * Guarantees zero latency and immune to asynchronous state delays.
 */
export function isAutoScrollActive(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof (window as any).__adubible_auto_scroll_enabled === 'boolean') {
    return (window as any).__adubible_auto_scroll_enabled;
  }
  try {
    const saved = localStorage.getItem('adubible_auto_sync_reader');
    if (saved !== null) {
      const val = saved === 'true';
      (window as any).__adubible_auto_scroll_enabled = val;
      return val;
    }
  } catch {}
  (window as any).__adubible_auto_scroll_enabled = true;
  return true;
}

/**
 * Synchronously sets the master Auto-Scroll state across window, localStorage,
 * immediately halts any active browser smooth-scroll animation if turned OFF,
 * and notifies all listeners in real-time (0ms latency).
 */
export function setAutoScrollActive(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  (window as any).__adubible_auto_scroll_enabled = enabled;
  try {
    localStorage.setItem('adubible_auto_sync_reader', String(enabled));
  } catch {}

  // CRITICAL FIX: If turning Auto-Scroll OFF, IMMEDIATELY halt any in-flight
  // browser smooth scrolling so the page freezes instantaneously on current position!
  if (!enabled) {
    try {
      const currentScrollY = window.scrollY || window.pageYOffset;
      window.scrollTo({
        top: currentScrollY,
        behavior: 'instant' as ScrollBehavior,
      });
    } catch {}
  }

  // Dispatch real-time global event so all components react synchronously
  try {
    window.dispatchEvent(
      new CustomEvent('adubible_autoscroll_toggle', { detail: { enabled } })
    );
  } catch {}
}

/**
 * Smoothly brings the active scripture verse into the golden reading / screen projection zone.
 *
 * CRITICAL FIXES FOR CHURCH / SANCTUARY SCREEN PROJECTION:
 * 1. Hard Master Kill-Switch: If Auto-Scroll is OFF, aborts in 0ms (absolute hard freeze).
 * 2. Golden Center Focus: Automatically elevates the active verse directly into the upper-middle
 *    reading zone (~28% to 34% of viewport height). This guarantees the active verse is NEVER
 *    at the bottom, NEVER stuck behind the floating audio bar, and always in prime view for
 *    congregations watching screen projections!
 * 3. In-View Stability: If the verse is already within 30px of the golden projection line,
 *    it avoids micro-jitter.
 */
export function scrollVerseIntoViewIfNeeded(
  el: HTMLElement | null,
  force: boolean = false
): void {
  if (typeof window === 'undefined' || !el) return;

  // HARD MASTER GATE: If Auto-Scroll is OFF, abort immediately!
  if (!force && !isAutoScrollActive()) {
    return;
  }

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  // Golden Projection Focus Target: Place the top of the active verse comfortably
  // in the upper-middle zone (~28% to 34% of viewport height, minimum 140px below sticky header).
  // This provides massive clearance above the bottom audio bar and maximum readability on projectors!
  const idealTopOffset = Math.max(140, Math.min(260, viewportHeight * 0.32));

  // If the verse is already resting right around the golden focal line (within +/- 30px), skip
  if (Math.abs(rect.top - idealTopOffset) < 30) {
    return;
  }

  const currentScrollY = window.scrollY || window.pageYOffset;
  const targetScrollY = currentScrollY + rect.top - idealTopOffset;

  window.scrollTo({
    top: Math.max(0, targetScrollY),
    behavior: 'smooth',
  });
}

