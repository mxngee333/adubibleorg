/**
 * Authentic Asante Twi & Akuapem Twi Audio Service
 *
 * Routes Asante Twi and Akuapem Twi chapters directly through the 24kHz Neural Voice
 * and Akan Phonemic TTS Engine for instant, crash-free verse-by-verse narration on
 * iOS Safari, iOS Chrome, Android, and Desktop.
 */

// Canonical Book mapping to standard DBP / Faith Comes By Hearing book codes
export const CANONICAL_BOOK_CODES: Record<string, { code: string; order: number; testament: 'OT' | 'NT' }> = {
  // Old Testament (OT)
  genesis: { code: 'GEN', order: 1, testament: 'OT' },
  exodus: { code: 'EXO', order: 2, testament: 'OT' },
  leviticus: { code: 'LEV', order: 3, testament: 'OT' },
  numbers: { code: 'NUM', order: 4, testament: 'OT' },
  deuteronomy: { code: 'DEU', order: 5, testament: 'OT' },
  joshua: { code: 'JOS', order: 6, testament: 'OT' },
  judges: { code: 'JDG', order: 7, testament: 'OT' },
  ruth: { code: 'RUT', order: 8, testament: 'OT' },
  '1-samuel': { code: '1SA', order: 9, testament: 'OT' },
  '2-samuel': { code: '2SA', order: 10, testament: 'OT' },
  '1-kings': { code: '1KI', order: 11, testament: 'OT' },
  '2-kings': { code: '2KI', order: 12, testament: 'OT' },
  '1-chronicles': { code: '1CH', order: 13, testament: 'OT' },
  '2-chronicles': { code: '2CH', order: 14, testament: 'OT' },
  ezra: { code: 'EZR', order: 15, testament: 'OT' },
  nehemiah: { code: 'NEH', order: 16, testament: 'OT' },
  esther: { code: 'EST', order: 17, testament: 'OT' },
  job: { code: 'JOB', order: 18, testament: 'OT' },
  psalms: { code: 'PSA', order: 19, testament: 'OT' },
  proverbs: { code: 'PRO', order: 20, testament: 'OT' },
  ecclesiastes: { code: 'ECC', order: 21, testament: 'OT' },
  'song-of-solomon': { code: 'SNG', order: 22, testament: 'OT' },
  isaiah: { code: 'ISA', order: 23, testament: 'OT' },
  jeremiah: { code: 'JER', order: 24, testament: 'OT' },
  lamentations: { code: 'LAM', order: 25, testament: 'OT' },
  ezekiel: { code: 'EZK', order: 26, testament: 'OT' },
  daniel: { code: 'DAN', order: 27, testament: 'OT' },
  hosea: { code: 'HOS', order: 28, testament: 'OT' },
  joel: { code: 'JOL', order: 29, testament: 'OT' },
  amos: { code: 'AMO', order: 30, testament: 'OT' },
  obadiah: { code: 'OBA', order: 31, testament: 'OT' },
  jonah: { code: 'JON', order: 32, testament: 'OT' },
  micah: { code: 'MIC', order: 33, testament: 'OT' },
  nahum: { code: 'NAM', order: 34, testament: 'OT' },
  habakkuk: { code: 'HAB', order: 35, testament: 'OT' },
  zephaniah: { code: 'ZEP', order: 36, testament: 'OT' },
  haggai: { code: 'HAG', order: 37, testament: 'OT' },
  zechariah: { code: 'ZEC', order: 38, testament: 'OT' },
  malachi: { code: 'MAL', order: 39, testament: 'OT' },

  // New Testament (NT)
  matthew: { code: 'MAT', order: 40, testament: 'NT' },
  mark: { code: 'MRK', order: 41, testament: 'NT' },
  luke: { code: 'LUK', order: 42, testament: 'NT' },
  john: { code: 'JHN', order: 43, testament: 'NT' },
  acts: { code: 'ACT', order: 44, testament: 'NT' },
  romans: { code: 'ROM', order: 45, testament: 'NT' },
  '1-corinthians': { code: '1CO', order: 46, testament: 'NT' },
  '2-corinthians': { code: '2CO', order: 47, testament: 'NT' },
  galatians: { code: 'GAL', order: 48, testament: 'NT' },
  ephesians: { code: 'EPH', order: 49, testament: 'NT' },
  philippians: { code: 'PHP', order: 50, testament: 'NT' },
  colossians: { code: 'COL', order: 51, testament: 'NT' },
  '1-thessalonians': { code: '1TH', order: 52, testament: 'NT' },
  '2-thessalonians': { code: '2TH', order: 53, testament: 'NT' },
  '1-timothy': { code: '1TI', order: 54, testament: 'NT' },
  '2-timothy': { code: '2TI', order: 55, testament: 'NT' },
  titus: { code: 'TIT', order: 56, testament: 'NT' },
  philemon: { code: 'PHM', order: 57, testament: 'NT' },
  hebrews: { code: 'HEB', order: 58, testament: 'NT' },
  james: { code: 'JAS', order: 59, testament: 'NT' },
  '1-peter': { code: '1PE', order: 60, testament: 'NT' },
  '2-peter': { code: '2PE', order: 61, testament: 'NT' },
  '1-john': { code: '1JN', order: 62, testament: 'NT' },
  '2-john': { code: '2JN', order: 63, testament: 'NT' },
  '3-john': { code: '3JN', order: 64, testament: 'NT' },
  jude: { code: 'JUD', order: 65, testament: 'NT' },
  revelation: { code: 'REV', order: 66, testament: 'NT' },
};

/**
 * Checks whether a language code or version ID corresponds to Twi / Akan
 */
export function isTwiLanguage(versionOrLang: string): boolean {
  if (!versionOrLang) return false;
  const lower = versionOrLang.toLowerCase().trim();
  return (
    lower === 'tw' ||
    lower === 'ak' ||
    lower === 'twi' ||
    lower === 'ak-twi' ||
    lower === 'twi-apoc' ||
    lower === 'asante' ||
    lower === 'asante-twi' ||
    lower === 'akuapem' ||
    lower === 'akuapem-twi' ||
    lower.startsWith('twi_') ||
    lower.includes('twi')
  );
}

/**
 * Detects legacy broken external audio URLs so they are stripped from any cached chapter objects.
 */
export function isDeadLegacyAudioUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.includes('seven1m/open-bibles') ||
    url.includes('audio.bible.is/bibles/filesets')
  );
}

/**
 * Returns null so Twi chapters route directly to the 24kHz Neural Voice & Akan Phonemic Engine
 * without attempting dead external MP3 streams.
 */
export function resolveTwiAudioUrl(
  _bookSlug: string,
  _chapter: number,
  _versionId: string = 'twi'
): string | null {
  return null;
}

/**
 * Returns null so Twi chapters route directly to the 24kHz Neural Voice & Akan Phonemic Engine.
 */
export function getCornerstoneTwiAudioUrl(_bookSlug: string, _chapter: number): string | null {
  return null;
}
