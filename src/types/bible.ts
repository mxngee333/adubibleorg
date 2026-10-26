export type BibleTestament = 'OT' | 'NT' | 'DC' | 'PSEUD';

export interface BibleBook {
  id: string;
  slug: string;
  number: number;
  testament: BibleTestament;
  category: string;
  chapters: number;
  author?: string;
  canonStatus?: string;
  historicalEra?: string;
  names: Record<string, string>;
}

export interface LanguageMetadata {
  code: string;
  hreflang: string;
  routePrefix: string;
  name: string;
  nativeName: string;
  script: string;
  dir: 'ltr' | 'rtl';
  region: string;
  flag: string;
  isMegaMultilingual?: boolean;
}

export interface BibleVersion {
  id: string;
  code: string;
  name: string;
  shortName: string;
  languageCode: string;
  languageName: string;
  nativeLanguageName: string;
  year?: string;
  copyright: string;
  hasStrongs?: boolean;
  isInterlinear?: boolean;
  dir?: 'ltr' | 'rtl';
  sourceType: 'bundled' | 'helloao' | 'bolls' | 'custom';
  helloaoId?: string;
  bollsId?: string;
  description: string;
}

export interface InterlinearWord {
  text: string;
  original: string;
  transliteration: string;
  strongs: string;
  gloss: string;
  twiGloss?: string;
  morphology?: string;
}

export type VersePiece =
  | string
  | {
      text?: string;
      lineBreak?: boolean;
      noteId?: number;
      heading?: string;
    };

export interface ChapterFootnote {
  noteId: number;
  caller?: string;
  text: string;
  reference?: {
    chapter?: number;
    verse?: number;
  };
}

export interface VerseData {
  verse: number;
  text: string;
  heading?: string;
  pieces?: VersePiece[];
  words?: InterlinearWord[];
  footnotes?: string[];
  crossRefs?: string[];
}

export interface ChapterData {
  versionId: string;
  bookId: string;
  bookSlug: string;
  bookLocalName?: string;
  chapter: number;
  verses: VerseData[];
  chapterFootnotes?: ChapterFootnote[];
  audioUrl?: string;
  source?: string;
  licenseUrl?: string;
  licenseText?: string;
}

export interface StrongsLexiconEntry {
  code: string;
  language: 'Hebrew' | 'Greek';
  originalWord: string;
  transliteration: string;
  phonetic: string;
  partOfSpeech: string;
  rootWord: string;
  shortDefinition: string;
  fullDefinition: string;
  bdbOrThayer: string;
  kjvUsage: string;
  occurrences: number;
  keyVerses: string[];
  twiEquivalent?: string;
}

export interface CommentarySource {
  id: string;
  name: string;
  shortName: string;
  author: string;
  year: string;
  description: string;
  helloaoId?: string;
}

export interface VerseCommentary {
  sourceId: string;
  sourceName: string;
  author: string;
  bookId: string;
  chapter: number;
  verse: number;
  title?: string;
  content: string;
  crossReferences?: string[];
}

export type HighlightColor = 'gold' | 'emerald' | 'sapphire' | 'rose' | 'violet' | 'amber';

export interface VerseHighlight {
  id: string;
  verseKey: string; // e.g. "EPH.1.3"
  bookId: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  versionId: string;
  text: string;
  color: HighlightColor;
  underline?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VerseBookmark {
  id: string;
  verseKey: string; // e.g. "EPH.1.3"
  bookId: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  versionId: string;
  text: string;
  folder: string;
  label?: string;
  createdAt: number;
}

export interface VersePin {
  id: string;
  verseKey: string; // e.g. "EPH.1.3"
  bookId: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  versionId: string;
  text: string;
  label?: string;
  pinnedAt: number;
}

export interface VerseNote {
  id: string;
  verseKey: string; // e.g. "EPH.1.3"
  bookId: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  versionId: string;
  verseText: string;
  title: string;
  body: string;
  tags: string[];
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CustomBibleAddon {
  id: string;
  code: string;
  name: string;
  shortName: string;
  languageCode: string;
  languageName: string;
  nativeLanguageName: string;
  dir: 'ltr' | 'rtl';
  description: string;
  addedAt: number;
  /** Map of "BOOKID.CHAPTER" (e.g., "EPH.1") -> array of VerseData */
  chapters: Record<string, VerseData[]>;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
  lastSyncedAt?: number;
  streakDays: number;
  chaptersRead: number;
}

export interface CustomThemePalette {
  id: string;
  name: string;
  paper: string;
  surface: string;
  ink: string;
  subtle: string;
  line: string;
  accent: string;
  isDark?: boolean;
}

export type ReadingTheme =
  | 'wisdom-legacy'
  | 'royal-purple'
  | 'lilac-light'
  | 'burgundy-gold'
  | 'architect-gold'
  | 'covenant-atlas'
  | 'adubible-si'
  | 'sapphire-blue'
  | 'midnight'
  | 'parchment'
  | 'obsidian'
  | 'daylight'
  | 'custom';

export interface ReadingPreferences {
  theme: ReadingTheme;
  customTheme?: CustomThemePalette;
  fontSize: number;
  lineHeight: number;
  fontFamily: 'serif' | 'sans' | 'mono';
  layoutMode: 'parallel-columns' | 'verse-by-verse-interlinear' | 'single-flowing';
  showStrongsInline: boolean;
  showCommentaries: boolean;
  showStudyBadges: boolean;
  showMorphology: boolean;
  showCrossRefs: boolean;
  showHeadings: boolean;
  zenMode: boolean;
  preferredVersionId?: string;
}
