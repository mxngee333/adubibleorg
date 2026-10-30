import {
  ChapterData,
  CustomBibleAddon,
  ReadingPreferences,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VersePin,
} from '../types/bible';

const DB_NAME = 'elohim_bible_vault_v1';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'chapters';
const STORE_ADDONS = 'addons';

const LS_HIGHLIGHTS = 'elohim_highlights_v1';
const LS_BOOKMARKS = 'elohim_bookmarks_v1';
const LS_PINS = 'elohim_pins_v1';
const LS_NOTES = 'elohim_notes_v1';
const LS_PREFS = 'elohim_prefs_v2';
const LS_ADDONS_META = 'elohim_addons_meta_v1';
const LS_HISTORY = 'elohim_reading_history_v1';
const LS_ACTIVE_VERSIONS = 'adubible_active_versions_v1';
const LS_PRIMARY_VERSION = 'adubible_primary_version_v1';

export const DEFAULT_PREFERENCES: ReadingPreferences = {
  theme: 'wisdom-legacy',
  customTheme: {
    id: 'custom-user',
    name: 'Wisdom Sage Studio',
    paper: '#20271f',
    surface: '#171d17',
    ink: '#e3e6d8',
    subtle: '#a5ae9e',
    line: '#394435',
    accent: '#b7c99f',
    isDark: true,
  },
  fontSize: 17, // BibleHub default font size
  lineHeight: 1.68,
  fontFamily: 'sans', // BibleHub default clean sans-serif
  layoutMode: 'parallel-columns',
  showStrongsInline: false,
  showCommentaries: false,
  showStudyBadges: true,
  showMorphology: false,
  showCrossRefs: true,
  showHeadings: true,
  zenMode: false,
  preferredVersionId: 'nkjv',
};

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'cacheKey' });
      }
      if (!db.objectStoreNames.contains(STORE_ADDONS)) {
        db.createObjectStore(STORE_ADDONS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedChapter(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<ChapterData | null> {
  try {
    const db = await openVaultDB();
    const cacheKey = `${versionId}:${bookId}:${chapter}`;
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.get(cacheKey);
      req.onsuccess = () => {
        if (!req.result) return resolve(null);
        const chapterData = req.result.data as ChapterData;
        // Auto-heal: Purge any legacy poisoned responses containing legal disputes
        const isPoisoned = chapterData.verses?.some((v) => {
          const t = String(v.text || '');
          return (
            t.includes('prohibited me') ||
            t.includes('Biblica, Inc.') ||
            t.includes('choose truly free translations')
          );
        });
        if (isPoisoned) {
          try {
            const delTx = db.transaction(STORE_CHAPTERS, 'readwrite');
            delTx.objectStore(STORE_CHAPTERS).delete(cacheKey);
          } catch {}
          return resolve(null);
        }
        resolve(chapterData);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedChapter(data: ChapterData): Promise<void> {
  try {
    const db = await openVaultDB();
    const cacheKey = `${data.versionId}:${data.bookId}:${data.chapter}`;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
      const store = tx.objectStore(STORE_CHAPTERS);
      store.put({ cacheKey, data, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Fallback silent if private browsing restricts IDB
  }
}

export async function saveCustomAddon(addon: CustomBibleAddon): Promise<void> {
  try {
    const db = await openVaultDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_ADDONS, 'readwrite');
      tx.objectStore(STORE_ADDONS).put(addon);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Also persist in localStorage if small enough
  }
  const existing = getCustomAddonsSync();
  const filtered = existing.filter((a) => a.id !== addon.id);
  filtered.push(addon);
  try {
    localStorage.setItem(LS_ADDONS_META, JSON.stringify(filtered));
  } catch {
    // Ignore quota errors
  }
}

export async function deleteCustomAddon(addonId: string): Promise<void> {
  try {
    const db = await openVaultDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_ADDONS, 'readwrite');
      tx.objectStore(STORE_ADDONS).delete(addonId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
  const existing = getCustomAddonsSync().filter((a) => a.id !== addonId);
  try {
    localStorage.setItem(LS_ADDONS_META, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function getCustomAddonsSync(): CustomBibleAddon[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_ADDONS_META);
    return raw ? (JSON.parse(raw) as CustomBibleAddon[]) : [];
  } catch {
    return [];
  }
}

export async function loadAllCustomAddons(): Promise<CustomBibleAddon[]> {
  try {
    const db = await openVaultDB();
    const idbAddons = await new Promise<CustomBibleAddon[]>((resolve) => {
      const tx = db.transaction(STORE_ADDONS, 'readonly');
      const req = tx.objectStore(STORE_ADDONS).getAll();
      req.onsuccess = () => resolve((req.result as CustomBibleAddon[]) || []);
      req.onerror = () => resolve([]);
    });
    if (idbAddons.length > 0) {
      return idbAddons;
    }
  } catch {
    // fallback
  }
  return getCustomAddonsSync();
}

function readJsonList<T>(key: string, defaultList: T[] = []): T[] {
  if (typeof window === 'undefined') return defaultList;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultList;
    return JSON.parse(raw) as T[];
  } catch {
    return defaultList;
  }
}

function writeJsonList<T>(key: string, list: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore
  }
}

const DEFAULT_STARTER_PINS: VersePin[] = [
  {
    id: 'pin-eph-1-3',
    verseKey: 'EPH.1.3',
    bookId: 'EPH',
    bookSlug: 'ephesians',
    chapter: 1,
    verse: 3,
    versionId: 'nkjv',
    text: 'Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ,',
    label: 'Spiritual Blessings in Christ',
    pinnedAt: 1730000000000,
  },
  {
    id: 'pin-twi-eph-1-3',
    verseKey: 'EPH.1.3',
    bookId: 'EPH',
    bookSlug: 'ephesians',
    chapter: 1,
    verse: 3,
    versionId: 'twi',
    text: 'Nhyira nka yɛn Awurade Yesu Kristo Nyankopɔn ne Agya a ɔnam Kristo so ahyira yɛn honhom mu nhyira nyinaa wɔ soro hɔnom,',
    label: 'Twi Parallel Anchor',
    pinnedAt: 1730000001000,
  },
];

const DEFAULT_STARTER_HIGHLIGHTS: VerseHighlight[] = [
  {
    id: 'hl-eph-1-3',
    verseKey: 'EPH.1.3',
    bookId: 'EPH',
    bookSlug: 'ephesians',
    chapter: 1,
    verse: 3,
    versionId: 'nkjv',
    text: 'Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ,',
    color: 'gold',
    underline: false,
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
  },
  {
    id: 'hl-eph-1-7',
    verseKey: 'EPH.1.7',
    bookId: 'EPH',
    bookSlug: 'ephesians',
    chapter: 1,
    verse: 7,
    versionId: 'nkjv',
    text: 'In Him we have redemption through His blood, the forgiveness of sins, according to the riches of His grace',
    color: 'rose',
    underline: true,
    createdAt: 1730000002000,
    updatedAt: 1730000002000,
  },
];

const DEFAULT_STARTER_NOTES: VerseNote[] = [
  {
    id: 'note-eph-1-3',
    verseKey: 'EPH.1.3',
    bookId: 'EPH',
    bookSlug: 'ephesians',
    chapter: 1,
    verse: 3,
    versionId: 'nkjv',
    verseText: 'Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ,',
    title: 'Eulogētos (G2128) & Asante Twi Nhyira Synthesis',
    body: 'In Greek, Paul opens with a threefold play on *eulogeō*: "Blessed (*eulogētos*, G2128) be the God... who has blessed (*eulogēsas*, G2127) us with every spiritual blessing (*eulogia*, G2129) in the heavenly places (*epouraniois*, G2032)." In Asante Twi (*Twerɛ Kronkron*), this resonates deeply with **Honhom mu nhyira nyinaa wɔ soro hɔnom** — every spiritual endowment from the Father’s throne room.',
    tags: ['Ephesians', 'Greek-Exegesis', 'Twi-Parallel', 'Strongs-G2128'],
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
  },
];

export function loadHighlights(): VerseHighlight[] {
  if (typeof window !== 'undefined' && localStorage.getItem(LS_HIGHLIGHTS) === null) {
    writeJsonList(LS_HIGHLIGHTS, DEFAULT_STARTER_HIGHLIGHTS);
    return DEFAULT_STARTER_HIGHLIGHTS;
  }
  return readJsonList<VerseHighlight>(LS_HIGHLIGHTS, DEFAULT_STARTER_HIGHLIGHTS);
}

export function saveHighlights(list: VerseHighlight[]): void {
  writeJsonList(LS_HIGHLIGHTS, list);
}

export function loadBookmarks(): VerseBookmark[] {
  return readJsonList<VerseBookmark>(LS_BOOKMARKS, [
    {
      id: 'bm-eph-1-17',
      verseKey: 'EPH.1.17',
      bookId: 'EPH',
      bookSlug: 'ephesians',
      chapter: 1,
      verse: 17,
      versionId: 'nkjv',
      text: 'that the God of our Lord Jesus Christ, the Father of glory, may give to you the spirit of wisdom and revelation in the knowledge of Him,',
      folder: 'Apostolic Prayers',
      label: 'Spirit of Wisdom & Revelation',
      createdAt: 1730000005000,
    },
  ]);
}

export function saveBookmarks(list: VerseBookmark[]): void {
  writeJsonList(LS_BOOKMARKS, list);
}

export function loadPins(): VersePin[] {
  if (typeof window !== 'undefined' && localStorage.getItem(LS_PINS) === null) {
    writeJsonList(LS_PINS, DEFAULT_STARTER_PINS);
    return DEFAULT_STARTER_PINS;
  }
  return readJsonList<VersePin>(LS_PINS, DEFAULT_STARTER_PINS);
}

export function savePins(list: VersePin[]): void {
  writeJsonList(LS_PINS, list);
}

export function loadNotes(): VerseNote[] {
  if (typeof window !== 'undefined' && localStorage.getItem(LS_NOTES) === null) {
    writeJsonList(LS_NOTES, DEFAULT_STARTER_NOTES);
    return DEFAULT_STARTER_NOTES;
  }
  return readJsonList<VerseNote>(LS_NOTES, DEFAULT_STARTER_NOTES);
}

export function saveNotes(list: VerseNote[]): void {
  writeJsonList(LS_NOTES, list);
}

export function loadPreferences(): ReadingPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (!raw) {
      localStorage.setItem('wisdom_legacy_default_migrated_v1', 'true');
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw);
    const hasMigrated = localStorage.getItem('wisdom_legacy_default_migrated_v1');
    if (!hasMigrated) {
      localStorage.setItem('wisdom_legacy_default_migrated_v1', 'true');
      // If the theme was the old initial default 'royal-purple', seamlessly migrate to the authentic 'wisdom-legacy'
      if (parsed.theme === 'royal-purple') {
        parsed.theme = 'wisdom-legacy';
      }
    }

    // BibleHub Default Font & Size Migration (17px + Sans-Serif)
    const hasBiblehubFontMigrated = localStorage.getItem('biblehub_font_migrated_v1');
    if (!hasBiblehubFontMigrated) {
      localStorage.setItem('biblehub_font_migrated_v1', 'true');
      if (!parsed.fontFamily || parsed.fontFamily === 'serif') {
        parsed.fontFamily = 'sans';
      }
      if (parsed.fontSize === 19 || !parsed.fontSize) {
        parsed.fontSize = 17;
      }
      localStorage.setItem(LS_PREFS, JSON.stringify({ ...DEFAULT_PREFERENCES, ...parsed }));
    }
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: ReadingPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export interface ReadingHistoryEntry {
  id?: string;
  bookId: string;
  bookSlug: string;
  bookName?: string;
  chapter: number;
  verse?: number;
  verseText?: string;
  versionId: string;
  version?: string;
  query?: string;
  timestamp: number;
  testament?: 'OT' | 'NT' | 'DC' | 'PSEUD';
  category?: string;
  source?: 'search' | 'read' | 'navigator';
}

export function recordReadingHistory(
  entry: Partial<ReadingHistoryEntry> & { bookSlug: string; chapter: number }
): ReadingHistoryEntry[] {
  const existing = getReadingHistory();
  const entryId =
    entry.id || `${entry.bookSlug}_${entry.chapter}_${entry.verse || 0}_${Date.now()}`;
  const fullEntry: ReadingHistoryEntry = {
    id: entryId,
    bookId: entry.bookId || entry.bookSlug,
    bookSlug: entry.bookSlug,
    bookName: entry.bookName || '',
    chapter: entry.chapter,
    verse: entry.verse,
    verseText: entry.verseText,
    versionId: entry.versionId || (entry.version ? entry.version.toLowerCase() : 'nkjv'),
    version: entry.version || (entry.versionId ? entry.versionId.toUpperCase() : 'NKJV'),
    query: entry.query,
    timestamp: entry.timestamp || Date.now(),
    testament: entry.testament,
    category: entry.category,
    source: entry.source || 'read',
  };

  // Deduplicate: remove older duplicate for the same book and chapter/query
  const filtered = existing.filter((item) => {
    if (
      entry.query &&
      item.query &&
      item.query.trim().toLowerCase() === entry.query.trim().toLowerCase()
    ) {
      return false;
    }
    return !(
      item.bookSlug === entry.bookSlug &&
      item.chapter === entry.chapter &&
      (item.verse === entry.verse || !entry.verse)
    );
  });

  // Strict Rule: RECENT COMES FIRST (newest item unshifted to index 0)
  const next = [fullEntry, ...filtered].slice(0, 100);

  // 1. Dual LocalStorage persistence (instant 0ms offline)
  writeJsonList(LS_HISTORY, next);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('adubible_history_searches_v2', JSON.stringify(next));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('adubible_history_updated', { detail: next }));
  }

  // 2. R2 & Cloud Vault Sync
  syncHistoryToCloudVault(next).catch(() => {});

  return next;
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const rawV2 = localStorage.getItem('adubible_history_searches_v2');
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.timestamp - a.timestamp);
      }
    }
  } catch {
    // fallback
  }
  const legacy = readJsonList<ReadingHistoryEntry>(LS_HISTORY, []);
  return legacy.sort((a, b) => b.timestamp - a.timestamp);
}

export function clearReadingHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LS_HISTORY);
    localStorage.removeItem('adubible_history_searches_v2');
    window.dispatchEvent(new CustomEvent('adubible_history_updated', { detail: [] }));
  } catch {
    // ignore
  }
  syncHistoryToCloudVault([]).catch(() => {});
}

export function deleteReadingHistoryItem(idOrKey: string): ReadingHistoryEntry[] {
  const current = getReadingHistory();
  const next = current.filter((item) => {
    if (item.id && item.id === idOrKey) return false;
    const key = `${item.bookSlug}_${item.chapter}`;
    return key !== idOrKey;
  });
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('adubible_history_searches_v2', JSON.stringify(next));
      localStorage.setItem(LS_HISTORY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('adubible_history_updated', { detail: next }));
    } catch {
      // ignore
    }
  }
  syncHistoryToCloudVault(next).catch(() => {});
  return next;
}

export async function syncHistoryToCloudVault(history: ReadingHistoryEntry[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    // A. Backup to IndexedDB Vault
    const db = await openVaultDB();
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    store.put({
      cacheKey: '__cloud_history_backup__',
      data: history,
      updatedAt: Date.now(),
    });

    // B. Cloudflare R2 / Serverless Cloud Sync (if configured)
    const cloudSyncEndpoint =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_R2_SCRIPTURE_URL)
        ? `${import.meta.env.VITE_R2_SCRIPTURE_URL}/sync/history`
        : null;

    if (cloudSyncEndpoint && navigator.onLine) {
      fetch(cloudSyncEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, timestamp: Date.now() }),
      }).catch(() => {
        // Safe offline fallback
      });
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Load the user's latest stored version IDs from localStorage.
 * Returns null if the user has never changed versions (new/visiting user).
 */
export function loadSavedVersionIds(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_ACTIVE_VERSIONS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0
      );
      return valid.length > 0 ? valid : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persist active version IDs to localStorage as the locally latest stored versions.
 * Also stores the primary translation ID for instant single-version lookups.
 */
export function saveActiveVersionIds(versionIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (Array.isArray(versionIds) && versionIds.length > 0) {
      localStorage.setItem(LS_ACTIVE_VERSIONS, JSON.stringify(versionIds));
      if (versionIds[0]) {
        localStorage.setItem(LS_PRIMARY_VERSION, versionIds[0]);
      }
    }
  } catch {
    // Ignore quota or security errors
  }
}

/**
 * Load the single primary version ID stored locally, if any.
 */
export function loadPrimaryVersionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LS_PRIMARY_VERSION) || null;
  } catch {
    return null;
  }
}

