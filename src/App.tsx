import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Globe,
  Columns,
  Rows,
  AlignLeft,
  Sparkles,
  Bookmark,
  Pin,
  Highlighter,
  FileText,
  Share2,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Search,
  Volume2,
  Sun,
  Moon,
  Eye,
  Plus,
  X,
  Check,
  Underline,
  ScrollText,
  Layers,
} from 'lucide-react';
import {
  ChapterData,
  CustomBibleAddon,
  HighlightColor,
  ReadingPreferences,
  UserProfile,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VersePin,
} from './types/bible';
import {
  getAllBibleVersions,
  getAllCanonicalBooks,
  getAllLanguagesMetadata,
  parseBibleHubUrlPath,
  resolveChapterData,
} from './services/bibleEngineService';
import {
  loadBookmarks,
  loadHighlights,
  loadNotes,
  loadPins,
  loadPreferences,
  saveBookmarks,
  saveHighlights,
  saveNotes,
  savePins,
  savePreferences,
  loadAllCustomAddons,
  saveCustomAddon,
  deleteCustomAddon,
  recordReadingHistory,
} from './services/studyVaultService';
import {
  getSavedUserProfile,
  pullStudyDataFromCloud,
  pushStudyDataToCloud,
  subscribeToAuthChanges,
} from './services/firebaseSyncService';
import {
  STRONGS_DICTIONARY,
  getInterlinearForVerse,
  getStrongsEntry,
} from './data/strongsLexicon';
import {
  COMMENTARIES_CATALOG,
  getCommentariesForChapter,
} from './data/commentariesCorpus';
import { getFeaturedChaptersSummary } from './data/featuredChaptersCorpus';
import { BookChapterSelectorModal } from './components/BookChapterSelectorModal';
import { LanguageAddonModal } from './components/LanguageAddonModal';
import { StrongsPopoverModal } from './components/StrongsPopoverModal';
import { StudyVaultDrawer } from './components/StudyVaultDrawer';
import { AuthSyncModal } from './components/AuthSyncModal';
import { VerseCardStudioModal } from './components/VerseCardStudioModal';
import { CommentaryPanel } from './components/CommentaryPanel';
import { AudioBibleBar } from './components/AudioBibleBar';
import {
  LegalInstitutionalModal,
  LegalPageKey,
} from './components/LegalInstitutionalModal';

const HIGHLIGHT_CLASSES: Record<
  HighlightColor,
  { light: string; dark: string; dot: string }
> = {
  gold: {
    light: 'bg-amber-200/80 text-stone-950 border-l-4 border-amber-600',
    dark: 'bg-amber-500/20 text-amber-100 border-l-4 border-amber-400',
    dot: 'bg-amber-400',
  },
  emerald: {
    light: 'bg-emerald-200/75 text-stone-950 border-l-4 border-emerald-600',
    dark: 'bg-emerald-500/20 text-emerald-100 border-l-4 border-emerald-400',
    dot: 'bg-emerald-400',
  },
  sapphire: {
    light: 'bg-sky-200/75 text-stone-950 border-l-4 border-sky-600',
    dark: 'bg-sky-500/20 text-sky-100 border-l-4 border-sky-400',
    dot: 'bg-sky-400',
  },
  rose: {
    light: 'bg-rose-200/75 text-stone-950 border-l-4 border-rose-600',
    dark: 'bg-rose-500/20 text-rose-100 border-l-4 border-rose-400',
    dot: 'bg-rose-400',
  },
  violet: {
    light: 'bg-violet-200/75 text-stone-950 border-l-4 border-violet-600',
    dark: 'bg-violet-500/20 text-violet-100 border-l-4 border-violet-400',
    dot: 'bg-violet-400',
  },
  amber: {
    light: 'bg-orange-200/75 text-stone-950 border-l-4 border-orange-600',
    dark: 'bg-orange-500/20 text-orange-100 border-l-4 border-orange-400',
    dot: 'bg-orange-400',
  },
};

export function App() {
  const canonicalBooks = useMemo(() => getAllCanonicalBooks(), []);
  const allLanguages = useMemo(() => getAllLanguagesMetadata(), []);

  // Parse initial URL (supports /nkjv/ephesians/1.htm, /twi/ephesians/1, /fr/, etc.)
  const initialRoute = useMemo(
    () =>
      typeof window !== 'undefined'
        ? parseBibleHubUrlPath(window.location.pathname)
        : { versionId: 'nkjv', bookSlug: 'ephesians', chapter: 1 },
    []
  );

  // Active Book, Chapter & Parallel Versions
  const [currentBookSlug, setCurrentBookSlug] = useState<string>(
    initialRoute.bookSlug || 'ephesians'
  );
  const [currentChapter, setCurrentChapter] = useState<number>(
    initialRoute.chapter || 1
  );
  const [activeVersionIds, setActiveVersionIds] = useState<string[]>(() => {
    const primary = initialRoute.versionId || 'nkjv';
    if (initialRoute.isParallelRoute) {
      return ['nkjv', 'twi', 'kjv'];
    }
    if (primary === 'twi') {
      return ['twi', 'nkjv'];
    }
    return [primary, 'twi'];
  });

  // Custom Add-on Packs
  const [customAddons, setCustomAddons] = useState<CustomBibleAddon[]>([]);
  const allVersions = useMemo(
    () => getAllBibleVersions(customAddons),
    [customAddons]
  );

  // Loaded Chapter Data per active version
  const [chaptersByVersion, setChaptersByVersion] = useState<
    Record<string, ChapterData>
  >({});
  const [loadingChapters, setLoadingChapters] = useState<boolean>(false);

  // User Study State (Pins, Highlights, Bookmarks, Notes, Preferences)
  const [pins, setPins] = useState<VersePin[]>(() => loadPins());
  const [highlights, setHighlights] = useState<VerseHighlight[]>(() =>
    loadHighlights()
  );
  const [bookmarks, setBookmarks] = useState<VerseBookmark[]>(() =>
    loadBookmarks()
  );
  const [notes, setNotes] = useState<VerseNote[]>(() => loadNotes());
  const [prefs, setPrefs] = useState<ReadingPreferences>(() =>
    loadPreferences()
  );
  const [user, setUser] = useState<UserProfile | null>(() =>
    getSavedUserProfile()
  );

  // UI & Modal States
  const [selectedVerse, setSelectedVerse] = useState<number>(3);
  const [activeVerseActionBar, setActiveVerseActionBar] = useState<
    number | null
  >(null);
  const [chapterSearchQuery, setChapterSearchQuery] = useState<string>('');
  const [showAudioBar, setShowAudioBar] = useState<boolean>(false);

  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [isLangAddonModalOpen, setIsLangAddonModalOpen] =
    useState<boolean>(false);
  const [isStrongsModalOpen, setIsStrongsModalOpen] = useState<boolean>(false);
  const [selectedStrongCode, setSelectedStrongCode] =
    useState<string>('G2128');
  const [isStudyVaultOpen, setIsStudyVaultOpen] = useState<boolean>(false);
  const [studyVaultTab, setStudyVaultTab] = useState<
    'pins' | 'highlights' | 'bookmarks' | 'notes'
  >('pins');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [verseCardTarget, setVerseCardTarget] = useState<{
    verse: number;
    primaryText: string;
    secondaryText?: string;
  } | null>(null);
  const [legalModalState, setLegalModalState] = useState<{
    open: boolean;
    page: LegalPageKey;
  }>({
    open: Boolean(initialRoute.legalPage),
    page: initialRoute.legalPage || 'about',
  });

  const currentBook = useMemo(
    () =>
      canonicalBooks.find((b) => b.slug === currentBookSlug) ||
      canonicalBooks.find((b) => b.slug === 'ephesians') ||
      canonicalBooks[0],
    [canonicalBooks, currentBookSlug]
  );

  // Load custom addons on mount
  useEffect(() => {
    loadAllCustomAddons().then((loaded) => {
      if (loaded.length > 0) {
        setCustomAddons(loaded);
      }
    });
  }, []);

  // Subscribe to Auth & pull cloud vault
  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (u) => {
      setUser(u);
      if (u) {
        const cloud = await pullStudyDataFromCloud(u);
        if (cloud) {
          if (cloud.highlights?.length) {
            setHighlights(cloud.highlights);
            saveHighlights(cloud.highlights);
          }
          if (cloud.bookmarks?.length) {
            setBookmarks(cloud.bookmarks);
            saveBookmarks(cloud.bookmarks);
          }
          if (cloud.pins?.length) {
            setPins(cloud.pins);
            savePins(cloud.pins);
          }
          if (cloud.notes?.length) {
            setNotes(cloud.notes);
            saveNotes(cloud.notes);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  // Load chapter data across all active parallel versions
  useEffect(() => {
    let cancelled = false;
    const loadAllActivePanes = async () => {
      setLoadingChapters(true);
      const nextMap: Record<string, ChapterData> = {};
      await Promise.all(
        activeVersionIds.map(async (vId) => {
          const data = await resolveChapterData(
            vId,
            currentBook.slug,
            currentChapter,
            customAddons
          );
          nextMap[vId] = data;
        })
      );
      if (!cancelled) {
        setChaptersByVersion(nextMap);
        setLoadingChapters(false);
        recordReadingHistory({
          bookId: currentBook.id,
          bookSlug: currentBook.slug,
          chapter: currentChapter,
          versionId: activeVersionIds[0] || 'nkjv',
          timestamp: Date.now(),
        });
      }
    };
    loadAllActivePanes();
    return () => {
      cancelled = true;
    };
  }, [activeVersionIds, currentBook, currentChapter, customAddons]);

  // Sync browser URL in BibleHub format without page reload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const primaryVer = activeVersionIds[0] || 'nkjv';
    const nextUrl = `/${primaryVer}/${currentBook.slug}/${currentChapter}/`;
    if (
      window.location.pathname !== nextUrl &&
      !['about', 'how-to-use', 'privacy', 'terms'].some((p) =>
        window.location.pathname.includes(p)
      )
    ) {
      window.history.replaceState({}, '', nextUrl);
    }
    document.title = `${currentBook.names.en} ${currentChapter} (${currentBook.names.tw || currentBook.names.en}) — Parallel Bible & Strong's | Elohim Bible Hub`;
  }, [activeVersionIds, currentBook, currentChapter]);

  // Auto-sync study data to cloud when signed in
  const syncToCloudIfSignedIn = useCallback(
    async (
      nextHl = highlights,
      nextBm = bookmarks,
      nextPins = pins,
      nextNotes = notes,
      nextPrefs = prefs
    ) => {
      if (user) {
        await pushStudyDataToCloud(user, {
          highlights: nextHl,
          bookmarks: nextBm,
          pins: nextPins,
          notes: nextNotes,
          preferences: nextPrefs,
          updatedAt: Date.now(),
        });
      }
    },
    [user, highlights, bookmarks, pins, notes, prefs]
  );

  const updatePrefs = (partial: Partial<ReadingPreferences>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    savePreferences(next);
    syncToCloudIfSignedIn(highlights, bookmarks, pins, notes, next);
  };

  // Toggle a version in the parallel reader (1 to 4 panes)
  const handleToggleVersionInParallel = (versionId: string) => {
    setActiveVersionIds((prev) => {
      if (prev.includes(versionId)) {
        if (prev.length === 1) return prev; // Keep at least 1 active pane
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleSelectBookChapter = (bookSlug: string, chapter: number) => {
    setCurrentBookSlug(bookSlug);
    setCurrentChapter(chapter);
    setSelectedVerse(1);
    setActiveVerseActionBar(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepChapter = (delta: number) => {
    const nextCh = currentChapter + delta;
    if (nextCh >= 1 && nextCh <= currentBook.chapters) {
      handleSelectBookChapter(currentBook.slug, nextCh);
      return;
    }
    const currentBookIdx = canonicalBooks.findIndex(
      (b) => b.id === currentBook.id
    );
    if (delta > 0 && currentBookIdx < canonicalBooks.length - 1) {
      const nextBook = canonicalBooks[currentBookIdx + 1];
      handleSelectBookChapter(nextBook.slug, 1);
    } else if (delta < 0 && currentBookIdx > 0) {
      const prevBook = canonicalBooks[currentBookIdx - 1];
      handleSelectBookChapter(prevBook.slug, prevBook.chapters);
    }
  };

  // Parse reference string like "Ephesians 1:3" or "Romans 8:28"
  const handleJumpToReferenceString = (refStr: string) => {
    const match = refStr
      .trim()
      .match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+)(?::(\d+))?/);
    if (!match) return;
    const rawBookName = match[1].trim().toLowerCase().replace(/\s+/g, '-');
    const chNum = parseInt(match[2], 10) || 1;
    const vNum = match[3] ? parseInt(match[3], 10) : 1;
    const foundBook = canonicalBooks.find(
      (b) =>
        b.slug === rawBookName ||
        b.names.en.toLowerCase() === match[1].trim().toLowerCase()
    );
    if (foundBook) {
      setCurrentBookSlug(foundBook.slug);
      setCurrentChapter(chNum);
      setSelectedVerse(vNum);
    }
  };

  // Study Actions: Highlight, Pin, Bookmark, Note
  const handleApplyHighlight = (
    verseNum: number,
    text: string,
    color: HighlightColor,
    toggleUnderline = false
  ) => {
    const verseKey = `${currentBook.id}.${currentChapter}.${verseNum}`;
    const existing = highlights.find((h) => h.verseKey === verseKey);
    let next: VerseHighlight[];
    if (existing && existing.color === color && !toggleUnderline) {
      // Remove highlight if clicking same color
      next = highlights.filter((h) => h.verseKey !== verseKey);
    } else {
      const item: VerseHighlight = {
        id: existing?.id || `hl-${Date.now()}`,
        verseKey,
        bookId: currentBook.id,
        bookSlug: currentBook.slug,
        chapter: currentChapter,
        verse: verseNum,
        versionId: activeVersionIds[0] || 'nkjv',
        text,
        color,
        underline: toggleUnderline ? !existing?.underline : existing?.underline,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      next = [item, ...highlights.filter((h) => h.verseKey !== verseKey)];
    }
    setHighlights(next);
    saveHighlights(next);
    syncToCloudIfSignedIn(next, bookmarks, pins, notes, prefs);
  };

  const handleTogglePin = (verseNum: number, text: string) => {
    const verseKey = `${currentBook.id}.${currentChapter}.${verseNum}`;
    const primaryVer = activeVersionIds[0] || 'nkjv';
    const existing = pins.find(
      (p) => p.verseKey === verseKey && p.versionId === primaryVer
    );
    let next: VersePin[];
    if (existing) {
      next = pins.filter((p) => p.id !== existing.id);
    } else {
      const newPin: VersePin = {
        id: `pin-${Date.now()}`,
        verseKey,
        bookId: currentBook.id,
        bookSlug: currentBook.slug,
        chapter: currentChapter,
        verse: verseNum,
        versionId: primaryVer,
        text,
        label: `${currentBook.names.en} ${currentChapter}:${verseNum}`,
        pinnedAt: Date.now(),
      };
      next = [newPin, ...pins];
    }
    setPins(next);
    savePins(next);
    syncToCloudIfSignedIn(highlights, bookmarks, next, notes, prefs);
  };

  const handleToggleBookmark = (verseNum: number, text: string) => {
    const verseKey = `${currentBook.id}.${currentChapter}.${verseNum}`;
    const existing = bookmarks.find((b) => b.verseKey === verseKey);
    let next: VerseBookmark[];
    if (existing) {
      next = bookmarks.filter((b) => b.verseKey !== verseKey);
    } else {
      const newBm: VerseBookmark = {
        id: `bm-${Date.now()}`,
        verseKey,
        bookId: currentBook.id,
        bookSlug: currentBook.slug,
        chapter: currentChapter,
        verse: verseNum,
        versionId: activeVersionIds[0] || 'nkjv',
        text,
        folder: 'Favorite Scriptures',
        createdAt: Date.now(),
      };
      next = [newBm, ...bookmarks];
    }
    setBookmarks(next);
    saveBookmarks(next);
    syncToCloudIfSignedIn(highlights, next, pins, notes, prefs);
  };

  const handleSaveNote = (note: VerseNote) => {
    const next = [note, ...notes.filter((n) => n.id !== note.id)];
    setNotes(next);
    saveNotes(next);
    syncToCloudIfSignedIn(highlights, bookmarks, pins, next, prefs);
  };

  // Determine verse rows across active versions
  const primaryVersionId = activeVersionIds[0] || 'nkjv';
  const primaryChapterData = chaptersByVersion[primaryVersionId];
  const primaryVerses = useMemo(
    () => primaryChapterData?.verses || [],
    [primaryChapterData]
  );

  const filteredVerses = useMemo(() => {
    const q = chapterSearchQuery.trim().toLowerCase();
    if (!q) return primaryVerses;
    return primaryVerses.filter((v) => {
      if (String(v.verse) === q) return true;
      return activeVersionIds.some((vId) => {
        const vText =
          chaptersByVersion[vId]?.verses.find((x) => x.verse === v.verse)
            ?.text || '';
        return vText.toLowerCase().includes(q);
      });
    });
  }, [primaryVerses, chapterSearchQuery, activeVersionIds, chaptersByVersion]);

  const activeVerseText = useMemo(() => {
    const found = primaryVerses.find((v) => v.verse === selectedVerse);
    return found?.text || primaryVerses[0]?.text || '';
  }, [primaryVerses, selectedVerse]);

  const chapterCommentaries = useMemo(
    () => getCommentariesForChapter(currentBook.id, currentChapter),
    [currentBook.id, currentChapter]
  );

  const featuredChapters = useMemo(() => getFeaturedChaptersSummary('en'), []);

  // Theme styling classes
  const isLightTheme =
    prefs.theme === 'parchment' || prefs.theme === 'daylight';
  const themeWrapperClass = {
    parchment: 'bg-[#f6f1e5] text-[#1c1917]',
    daylight: 'bg-stone-50 text-stone-900',
    midnight: 'bg-[#090d16] text-stone-100',
    obsidian: 'bg-stone-950 text-stone-100',
  }[prefs.theme];

  const cardSurfaceClass = isLightTheme
    ? 'border-amber-900/15 bg-white/90 text-stone-900 shadow-xs'
    : 'border-stone-800/90 bg-stone-900/60 text-stone-100';

  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  }[prefs.fontFamily];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 pb-20 md:pb-8 ${themeWrapperClass}`}
    >
      {/* =========================================================
          TOP SANCTUARY COMMAND HEADER
          ========================================================= */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition ${
          isLightTheme
            ? 'border-amber-900/15 bg-[#f6f1e5]/95 text-stone-900'
            : 'border-stone-800 bg-stone-950/95 text-stone-100'
        }`}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand Logo & Book/Chapter Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`/${primaryVersionId}/${currentBook.slug}/${currentChapter}/`}
              onClick={(e) => {
                e.preventDefault();
                handleSelectBookChapter('ephesians', 1);
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-stone-950 font-black shadow-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm tracking-wide">
                    ELOHIM BIBLE HUB
                  </span>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                    AD-FREE
                  </span>
                </div>
                <p className="text-[10px] opacity-65">
                  Parallel Twi &amp; 35+ Languages • Strong&apos;s • Commentaries
                </p>
              </div>
            </a>

            {/* Book & Chapter Navigation Pill */}
            <div
              className={`flex items-center rounded-xl border p-0.5 ${
                isLightTheme
                  ? 'border-amber-900/20 bg-amber-100/60'
                  : 'border-stone-700 bg-stone-900'
              }`}
            >
              <button
                onClick={() => handleStepChapter(-1)}
                className="rounded-lg p-1.5 hover:bg-amber-500/20 transition"
                title="Previous Chapter"
                aria-label="Previous Chapter"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:text-amber-500 transition"
              >
                <span>{currentBook.names.en}</span>
                {currentBook.names.tw &&
                  currentBook.names.tw !== currentBook.names.en && (
                    <span className="hidden md:inline text-xs font-normal opacity-75">
                      ({currentBook.names.tw})
                    </span>
                  )}
                <span className="rounded bg-amber-500 px-1.5 py-0.5 text-xs font-mono font-bold text-stone-950">
                  {currentChapter}
                </span>
              </button>
              <button
                onClick={() => handleStepChapter(1)}
                className="rounded-lg p-1.5 hover:bg-amber-500/20 transition"
                title="Next Chapter"
                aria-label="Next Chapter"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Center: Active Parallel Version Pills & Add Language Button */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {activeVersionIds.map((vId) => {
              const ver = allVersions.find((v) => v.id === vId);
              if (!ver) return null;
              return (
                <div
                  key={vId}
                  className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold ${
                    isLightTheme
                      ? 'border-amber-700/30 bg-amber-500/15 text-amber-950'
                      : 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                  }`}
                >
                  <span>{ver.shortName}</span>
                  <span className="hidden lg:inline text-[10px] opacity-75 font-normal">
                    • {ver.languageName.split(' ')[0]}
                  </span>
                  {activeVersionIds.length > 1 && (
                    <button
                      onClick={() => handleToggleVersionInParallel(vId)}
                      className="ml-0.5 rounded hover:bg-black/20 p-0.5"
                      title={`Remove ${ver.shortName} pane`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setIsLangAddonModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition shadow-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Parallel / Twi / 35+ Langs</span>
            </button>
          </div>

          {/* Right Controls: Layout, Strong's, Study Vault, Cloud Sync, Theme */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Layout Switcher */}
            <div
              className={`flex items-center rounded-xl border p-0.5 ${
                isLightTheme
                  ? 'border-stone-300 bg-stone-200/70'
                  : 'border-stone-800 bg-stone-900'
              }`}
            >
              <button
                onClick={() =>
                  updatePrefs({ layoutMode: 'parallel-columns' })
                }
                className={`rounded-lg p-1.5 text-xs font-bold transition ${
                  prefs.layoutMode === 'parallel-columns'
                    ? 'bg-amber-500 text-stone-950'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Side-by-Side Parallel Columns"
              >
                <Columns className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  updatePrefs({ layoutMode: 'verse-by-verse-interlinear' })
                }
                className={`rounded-lg p-1.5 text-xs font-bold transition ${
                  prefs.layoutMode === 'verse-by-verse-interlinear'
                    ? 'bg-amber-500 text-stone-950'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Verse-by-Verse Interlinear Stacked Comparison"
              >
                <Rows className="h-4 w-4" />
              </button>
              <button
                onClick={() => updatePrefs({ layoutMode: 'single-flowing' })}
                className={`rounded-lg p-1.5 text-xs font-bold transition ${
                  prefs.layoutMode === 'single-flowing'
                    ? 'bg-amber-500 text-stone-950'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Single Flowing Reader"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Strong's Lexicon Button */}
            <button
              onClick={() => setIsStrongsModalOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                isLightTheme
                  ? 'border-stone-300 bg-white hover:bg-stone-100'
                  : 'border-stone-800 bg-stone-900 hover:bg-stone-800'
              }`}
              title="Open Strong's Exhaustive Concordance & Hebrew/Greek Lexicon"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Strong&apos;s</span>
            </button>

            {/* Study Vault Drawer Button */}
            <button
              onClick={() => {
                setStudyVaultTab('pins');
                setIsStudyVaultOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                isLightTheme
                  ? 'border-stone-300 bg-white hover:bg-stone-100'
                  : 'border-stone-800 bg-stone-900 hover:bg-stone-800'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              <span>Vault</span>
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-600 dark:text-amber-300">
                {pins.length + highlights.length + bookmarks.length + notes.length}
              </span>
            </button>

            {/* Cloud Auth & Sync Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                user
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                  : isLightTheme
                  ? 'border-stone-300 bg-white hover:bg-stone-100'
                  : 'border-stone-800 bg-stone-900 hover:bg-stone-800'
              }`}
            >
              <Cloud className="h-3.5 w-3.5" />
              <span>{user ? user.displayName?.split(' ')[0] : 'Sync Login'}</span>
            </button>

            {/* Theme Cycle Button */}
            <button
              onClick={() => {
                const order: ReadingPreferences['theme'][] = [
                  'parchment',
                  'obsidian',
                  'midnight',
                  'daylight',
                ];
                const nextTheme =
                  order[(order.indexOf(prefs.theme) + 1) % order.length];
                updatePrefs({ theme: nextTheme });
              }}
              className={`rounded-xl border p-2 transition ${
                isLightTheme
                  ? 'border-stone-300 bg-white hover:bg-stone-100'
                  : 'border-stone-800 bg-stone-900 hover:bg-stone-800'
              }`}
              title={`Theme: ${prefs.theme} (Click to switch)`}
            >
              {isLightTheme ? (
                <Moon className="h-4 w-4 text-amber-700" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            SUB-BAR: BIBLEHUB QUICK PRESETS, STRONG'S TOGGLE, AUDIO & SEARCH
            ========================================================= */}
        {!prefs.zenMode && (
          <div
            className={`border-t px-3 sm:px-6 py-2 text-xs ${
              isLightTheme
                ? 'border-amber-900/10 bg-amber-100/40'
                : 'border-stone-800/80 bg-stone-900/50'
            }`}
          >
            <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
              {/* Quick Parallel Combinations & Featured Chapters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 mr-1 shrink-0">
                  Parallel Presets:
                </span>
                <button
                  onClick={() => setActiveVersionIds(['nkjv', 'twi'])}
                  className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-500/20 transition"
                >
                  🇬🇧 NKJV + 🇬🇭 Asante Twi
                </button>
                <button
                  onClick={() =>
                    setActiveVersionIds([
                      'nkjv',
                      'twi',
                      currentBook.testament === 'OT' ? 'wlc' : 'tr-gk',
                    ])
                  }
                  className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold hover:bg-sky-500/20 transition"
                >
                  🏛️ NKJV + Twi + {currentBook.testament === 'OT' ? 'Hebrew WLC' : 'Greek TR'}
                </button>
                <button
                  onClick={() =>
                    setActiveVersionIds(['nkjv', 'twi', 'fr-lsg', 'es-rvr'])
                  }
                  className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-500/20 transition"
                >
                  🌍 4-Pane (EN • Twi • FR • ES)
                </button>

                <span className="mx-1 opacity-30">|</span>
                {featuredChapters.map((fc) => (
                  <button
                    key={`${fc.bookSlug}-${fc.chapter}`}
                    onClick={() =>
                      handleSelectBookChapter(fc.bookSlug, fc.chapter)
                    }
                    className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                      currentBook.slug === fc.bookSlug &&
                      currentChapter === fc.chapter
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'opacity-75 hover:opacity-100 hover:bg-amber-500/15'
                    }`}
                  >
                    {fc.title}
                  </button>
                ))}
              </div>

              {/* Right Study Toggles: Inline Strong's, Audio Player, Font Size, Filter */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() =>
                    updatePrefs({
                      showStrongsInline: !prefs.showStrongsInline,
                    })
                  }
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    prefs.showStrongsInline
                      ? 'bg-amber-500 text-stone-950'
                      : 'border border-current/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Interlinear Strong&apos;s</span>
                </button>

                <button
                  onClick={() => setShowAudioBar(!showAudioBar)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    showAudioBar
                      ? 'bg-amber-500 text-stone-950'
                      : 'border border-current/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Audio</span>
                </button>

                <div className="hidden sm:flex items-center gap-1 border border-current/15 rounded-lg px-1.5 py-0.5">
                  <button
                    onClick={() =>
                      updatePrefs({
                        fontSize: Math.max(14, prefs.fontSize - 2),
                      })
                    }
                    className="px-1.5 font-bold hover:text-amber-500"
                    title="Decrease Font Size"
                  >
                    A-
                  </button>
                  <span className="text-[10px] opacity-60">
                    {prefs.fontSize}px
                  </span>
                  <button
                    onClick={() =>
                      updatePrefs({
                        fontSize: Math.min(28, prefs.fontSize + 2),
                      })
                    }
                    className="px-1.5 font-bold hover:text-amber-500"
                    title="Increase Font Size"
                  >
                    A+
                  </button>
                </div>

                <div className="relative w-36 sm:w-44">
                  <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 opacity-50" />
                  <input
                    type="text"
                    value={chapterSearchQuery}
                    onChange={(e) => setChapterSearchQuery(e.target.value)}
                    placeholder="Filter verse or word..."
                    className="w-full rounded-lg border border-current/20 bg-transparent pl-7 pr-2 py-1 text-[11px] focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          MAIN SCRIPTURE & EXEGESIS WORKSPACE
          ========================================================= */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 py-5 space-y-6">
        {/* Audio Bible Bar (if toggled) */}
        {showAudioBar && (
          <AudioBibleBar
            bookName={currentBook.names.en}
            chapter={currentChapter}
            versionName={
              allVersions.find((v) => v.id === primaryVersionId)?.name ||
              primaryVersionId.toUpperCase()
            }
            langCode={
              allVersions.find((v) => v.id === primaryVersionId)
                ?.languageCode || 'en'
            }
            verses={primaryVerses}
            parallelVerses={
              activeVersionIds[1]
                ? chaptersByVersion[activeVersionIds[1]]?.verses
                : undefined
            }
            parallelVersionName={
              activeVersionIds[1]
                ? allVersions.find((v) => v.id === activeVersionIds[1])?.name
                : undefined
            }
            parallelLangCode={
              activeVersionIds[1]
                ? allVersions.find((v) => v.id === activeVersionIds[1])
                    ?.languageCode
                : undefined
            }
            activeVerse={selectedVerse}
            onVerseChange={(vNum) => setSelectedVerse(vNum)}
          />
        )}

        {/* Quick Pinned Verses Ribbon (YouVersion + BibleHub Hybrid) */}
        {pins.length > 0 && !prefs.zenMode && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-300 shrink-0">
              <Pin className="h-3 w-3" /> Pinned Anchors:
            </span>
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => {
                  setCurrentBookSlug(pin.bookSlug);
                  setCurrentChapter(pin.chapter);
                  setSelectedVerse(pin.verse);
                }}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs transition ${
                  isLightTheme
                    ? 'border-amber-900/15 bg-white hover:border-amber-600'
                    : 'border-stone-800 bg-stone-900/80 hover:border-amber-500/50'
                }`}
              >
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {pin.verseKey} ({pin.versionId.toUpperCase()})
                </span>
                <span className="max-w-[180px] truncate opacity-75">
                  &ldquo;{pin.text}&rdquo;
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Chapter Banner Header */}
        <div
          className={`rounded-2xl border p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardSurfaceClass}`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span>
                {currentBook.testament === 'OT'
                  ? 'Old Testament'
                  : 'New Testament'}{' '}
                • {currentBook.category}
              </span>
              <span>•</span>
              <span className="font-mono">
                /{primaryVersionId}/{currentBook.slug}/{currentChapter}.htm
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              {currentBook.names.en} Chapter {currentChapter}
              {currentBook.names.tw &&
                currentBook.names.tw !== currentBook.names.en && (
                  <span className="ml-2.5 text-lg sm:text-2xl font-normal text-amber-600 dark:text-amber-400">
                    • 🇬🇭 {currentBook.names.tw} Ti {currentChapter}
                  </span>
                )}
            </h1>
            <p className="mt-1 text-xs sm:text-sm opacity-75">
              Reading in {activeVersionIds.length} Synchronized Parallel{' '}
              {activeVersionIds.length === 1 ? 'Version' : 'Versions'}:{' '}
              <strong>
                {activeVersionIds
                  .map(
                    (id) =>
                      allVersions.find((v) => v.id === id)?.name ||
                      id.toUpperCase()
                  )
                  .join('  ∥  ')}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLangAddonModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
            >
              <Globe className="h-4 w-4" />
              <span>35+ Languages &amp; Add-ons</span>
            </button>
            <button
              onClick={() => updatePrefs({ zenMode: !prefs.zenMode })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-current/15 px-3 py-2 text-xs font-semibold hover:border-amber-500 transition"
            >
              <Eye className="h-4 w-4 text-amber-500" />
              <span>{prefs.zenMode ? 'Exit Zen' : 'Zen Flow'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            PARALLEL & INTERLINEAR VERSE-BY-VERSE MATRIX
            ========================================================= */}
        {loadingChapters && Object.keys(chaptersByVersion).length === 0 ? (
          <div
            className={`rounded-2xl border p-12 text-center ${cardSurfaceClass}`}
          >
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-3" />
            <p className="text-sm font-medium">
              Loading parallel scripture streams for {currentBook.names.en}{' '}
              {currentChapter}...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop Column Headers when in Parallel Columns mode */}
            {prefs.layoutMode === 'parallel-columns' &&
              activeVersionIds.length > 1 && (
                <div
                  className="hidden md:grid gap-4 sticky top-[96px] z-30"
                  style={{
                    gridTemplateColumns: `repeat(${activeVersionIds.length}, minmax(0, 1fr))`,
                  }}
                >
                  {activeVersionIds.map((vId) => {
                    const ver = allVersions.find((v) => v.id === vId);
                    return (
                      <div
                        key={vId}
                        className={`rounded-xl border px-4 py-2.5 flex items-center justify-between backdrop-blur-md ${
                          isLightTheme
                            ? 'border-amber-900/20 bg-amber-100/90 text-stone-900'
                            : 'border-amber-500/30 bg-stone-900/95 text-amber-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-mono font-bold text-stone-950">
                              {ver?.shortName || vId.toUpperCase()}
                            </span>
                            <span className="font-bold text-xs truncate">
                              {ver?.name || vId}
                            </span>
                          </div>
                          <div className="text-[10px] opacity-75 truncate">
                            {ver?.languageName} ({ver?.nativeLanguageName})
                          </div>
                        </div>
                        {activeVersionIds.length > 1 && (
                          <button
                            onClick={() => handleToggleVersionInParallel(vId)}
                            className="rounded-lg p-1 opacity-60 hover:opacity-100 hover:bg-black/10"
                            title="Close column"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Verse Rows */}
            {filteredVerses.map((baseVerse) => {
              const vNum = baseVerse.verse;
              const verseKey = `${currentBook.id}.${currentChapter}.${vNum}`;
              const hl = highlights.find((h) => h.verseKey === verseKey);
              const isPinned = pins.some((p) => p.verseKey === verseKey);
              const isBookmarked = bookmarks.some(
                (b) => b.verseKey === verseKey
              );
              const verseNotes = notes.filter((n) => n.verseKey === verseKey);
              const isSelected = selectedVerse === vNum;
              const isActionOpen = activeVerseActionBar === vNum;

              const interlinearWords = getInterlinearForVerse(
                currentBook.slug,
                currentChapter,
                vNum
              );

              const versionIdsToRender =
                prefs.layoutMode === 'single-flowing'
                  ? [primaryVersionId]
                  : activeVersionIds;

              return (
                <div
                  key={vNum}
                  id={`verse-${vNum}`}
                  className={`rounded-2xl border transition-all duration-150 ${
                    hl
                      ? isLightTheme
                        ? HIGHLIGHT_CLASSES[hl.color].light
                        : HIGHLIGHT_CLASSES[hl.color].dark
                      : cardSurfaceClass
                  } ${
                    isSelected
                      ? 'ring-2 ring-amber-500/70 shadow-md'
                      : 'hover:border-amber-500/40'
                  }`}
                >
                  {/* Section Heading (Pericope) if present */}
                  {prefs.showHeadings && baseVerse.heading && (
                    <div
                      className={`border-b px-4 py-2 text-xs sm:text-sm font-bold tracking-wide flex items-center justify-between ${
                        isLightTheme
                          ? 'border-amber-900/10 bg-amber-500/10 text-amber-900'
                          : 'border-stone-800 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      <span>✦ {baseVerse.heading}</span>
                      <span className="text-[11px] font-mono opacity-75">
                        {currentBook.names.en} {currentChapter}:{vNum}
                      </span>
                    </div>
                  )}

                  {/* Main Parallel Grid for this Verse */}
                  <div
                    onClick={() => {
                      setSelectedVerse(vNum);
                      setActiveVerseActionBar(
                        activeVerseActionBar === vNum ? null : vNum
                      );
                    }}
                    className={`cursor-pointer p-3.5 sm:p-5 grid gap-4 ${
                      prefs.layoutMode === 'parallel-columns' &&
                      versionIdsToRender.length > 1
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-' +
                          Math.min(4, versionIdsToRender.length)
                        : 'grid-cols-1'
                    }`}
                    style={
                      prefs.layoutMode === 'parallel-columns' &&
                      versionIdsToRender.length > 1 &&
                      typeof window !== 'undefined' &&
                      window.innerWidth >= 768
                        ? {
                            gridTemplateColumns: `repeat(${versionIdsToRender.length}, minmax(0, 1fr))`,
                          }
                        : undefined
                    }
                  >
                    {versionIdsToRender.map((vId, colIndex) => {
                      const verMeta = allVersions.find((v) => v.id === vId);
                      const vData =
                        chaptersByVersion[vId]?.verses.find(
                          (x) => x.verse === vNum
                        ) || baseVerse;
                      const isRtl = verMeta?.dir === 'rtl';

                      return (
                        <div
                          key={`${vId}-${vNum}`}
                          dir={isRtl ? 'rtl' : 'ltr'}
                          className={`${
                            colIndex > 0 &&
                            prefs.layoutMode === 'verse-by-verse-interlinear'
                              ? 'pt-2.5 border-t border-current/10'
                              : ''
                          }`}
                        >
                          {/* Version Badge (Always shown on mobile or interlinear stack) */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-amber-500/20 px-1.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                                {vNum}
                              </span>
                              <span className="rounded bg-current/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase opacity-80">
                                {verMeta?.shortName || vId}
                              </span>
                              <span className="text-[11px] opacity-60 md:hidden">
                                {verMeta?.languageName}
                              </span>
                            </div>

                            {colIndex === 0 && (
                              <div className="flex items-center gap-1">
                                {isPinned && (
                                  <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                )}
                                {isBookmarked && (
                                  <Bookmark className="h-3.5 w-3.5 text-sky-500 fill-sky-500" />
                                )}
                                {verseNotes.length > 0 && (
                                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Verse Text */}
                          <p
                            className={`${fontClass} leading-relaxed select-text ${
                              hl?.underline
                                ? 'underline decoration-amber-500/80 decoration-2 underline-offset-4'
                                : ''
                            }`}
                            style={{
                              fontSize: `${prefs.fontSize}px`,
                              lineHeight: prefs.lineHeight,
                            }}
                          >
                            {vData.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* =========================================================
                      BIBLEHUB-GRADE INTERLINEAR WORD-BY-WORD & STRONG'S RIBBON
                      ========================================================= */}
                  {prefs.showStrongsInline &&
                    (interlinearWords ||
                      (baseVerse.crossRefs &&
                        baseVerse.crossRefs.length > 0)) && (
                      <div
                        className={`border-t px-4 py-2.5 ${
                          isLightTheme
                            ? 'border-amber-900/10 bg-amber-50/70'
                            : 'border-stone-800/80 bg-stone-950/60'
                        }`}
                      >
                        {interlinearWords ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mr-1">
                              Interlinear Lexicon:
                            </span>
                            {interlinearWords.map((token, tIdx) => (
                              <button
                                key={tIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStrongCode(token.strongs);
                                  setIsStrongsModalOpen(true);
                                }}
                                className={`group flex flex-col items-start rounded-xl border px-2.5 py-1.5 text-left transition ${
                                  isLightTheme
                                    ? 'border-amber-900/15 bg-white hover:border-amber-500'
                                    : 'border-stone-800 bg-stone-900 hover:border-amber-500/60'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-serif text-sm font-bold text-amber-700 dark:text-amber-300">
                                    {token.original}
                                  </span>
                                  <span className="rounded bg-amber-500/20 px-1 py-0.2 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    {token.strongs}
                                  </span>
                                </div>
                                <div className="text-[10px] italic opacity-75">
                                  {token.transliteration}
                                </div>
                                <div className="text-[11px] font-semibold">
                                  {token.gloss}
                                  {token.twiGloss && (
                                    <span className="text-amber-600 dark:text-amber-400">
                                      {' '}
                                      • {token.twiGloss}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mr-1">
                              Strong&apos;s Keys:
                            </span>
                            {baseVerse.crossRefs?.map((code) => {
                              const entry = getStrongsEntry(code);
                              return (
                                <button
                                  key={code}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStrongCode(code);
                                    setIsStrongsModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium hover:bg-amber-500/25 transition"
                                >
                                  <span className="font-mono font-bold text-amber-600 dark:text-amber-300">
                                    {code}
                                  </span>
                                  <span className="font-serif">
                                    {entry.originalWord}
                                  </span>
                                  <span className="opacity-75">
                                    ({entry.transliteration})
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Attached Personal Study Notes Preview */}
                  {verseNotes.length > 0 && (
                    <div
                      className={`border-t px-4 py-2.5 text-xs ${
                        isLightTheme
                          ? 'border-rose-300 bg-rose-50/70 text-rose-950'
                          : 'border-rose-500/20 bg-rose-950/20 text-rose-200'
                      }`}
                    >
                      {verseNotes.map((n) => (
                        <div key={n.id} className="flex items-start gap-2">
                          <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">{n.title}: </span>
                            <span className="opacity-90">{n.body}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* =========================================================
                      YOUVERSION-STYLE FLOATING VERSE ACTION TOOLBAR
                      ========================================================= */}
                  {isActionOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="border-t border-amber-500/30 bg-stone-900 text-stone-100 px-4 py-2.5 rounded-b-2xl flex flex-wrap items-center justify-between gap-3"
                    >
                      {/* Highlight Color Swatches */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
                          <Highlighter className="h-3.5 w-3.5 text-amber-400" />
                          Highlight:
                        </span>
                        {(
                          [
                            'gold',
                            'emerald',
                            'sapphire',
                            'rose',
                            'violet',
                            'amber',
                          ] as HighlightColor[]
                        ).map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              handleApplyHighlight(vNum, baseVerse.text, color)
                            }
                            className={`h-6 w-6 rounded-full transition transform hover:scale-110 flex items-center justify-center ${
                              HIGHLIGHT_CLASSES[color].dot
                            } ${
                              hl?.color === color
                                ? 'ring-2 ring-white scale-110'
                                : ''
                            }`}
                            title={`Highlight ${color}`}
                          >
                            {hl?.color === color && (
                              <Check className="h-3.5 w-3.5 text-stone-950 stroke-[3]" />
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            handleApplyHighlight(
                              vNum,
                              baseVerse.text,
                              hl?.color || 'gold',
                              true
                            )
                          }
                          className={`ml-1 rounded-lg border px-2 py-1 text-xs font-bold transition ${
                            hl?.underline
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-stone-700 bg-stone-800 text-stone-300'
                          }`}
                          title="Underline Verse"
                        >
                          <Underline className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Pin, Bookmark, Note, Share Card & Commentary Actions */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePin(vNum, baseVerse.text)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            isPinned
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                          }`}
                        >
                          <Pin className="h-3.5 w-3.5" />
                          <span>{isPinned ? 'Pinned' : 'Pin'}</span>
                        </button>

                        <button
                          onClick={() =>
                            handleToggleBookmark(vNum, baseVerse.text)
                          }
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            isBookmarked
                              ? 'bg-sky-500 text-stone-950'
                              : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                          }`}
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setStudyVaultTab('notes');
                            setIsStudyVaultOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-2.5 py-1 text-xs font-bold text-stone-200 hover:bg-stone-700 transition"
                        >
                          <FileText className="h-3.5 w-3.5 text-rose-400" />
                          <span>Note</span>
                        </button>

                        <button
                          onClick={() => {
                            const secVerId = activeVersionIds[1];
                            const secText = secVerId
                              ? chaptersByVersion[secVerId]?.verses.find(
                                  (x) => x.verse === vNum
                                )?.text
                              : undefined;
                            setVerseCardTarget({
                              verse: vNum,
                              primaryText: baseVerse.text,
                              secondaryText: secText,
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Verse Art</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Previous / Next Chapter Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => handleStepChapter(-1)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition ${cardSurfaceClass} hover:border-amber-500`}
          >
            <ChevronLeft className="h-4 w-4 text-amber-500" />
            <span>Previous Chapter</span>
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/25 transition"
          >
            {currentBook.names.en} {currentChapter} of {currentBook.chapters}
          </button>

          <button
            onClick={() => handleStepChapter(1)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition ${cardSurfaceClass} hover:border-amber-500`}
          >
            <span>Next Chapter</span>
            <ChevronRight className="h-4 w-4 text-amber-500" />
          </button>
        </div>

        {/* =========================================================
            OPEN-SOURCE COMMENTARIES & CROSS-REFERENCES DECK
            ========================================================= */}
        {!prefs.zenMode && (
          <CommentaryPanel
            bookId={currentBook.id}
            bookName={currentBook.names.en}
            chapter={currentChapter}
            selectedVerse={selectedVerse}
            selectedVerseText={activeVerseText}
            sources={COMMENTARIES_CATALOG}
            bundledCommentaries={chapterCommentaries}
            onSelectStrongCode={(code) => {
              setSelectedStrongCode(code);
              setIsStrongsModalOpen(true);
            }}
            onJumpToReference={handleJumpToReferenceString}
            themeMode={prefs.theme}
          />
        )}
      </main>

      {/* =========================================================
          INSTITUTIONAL & MULTILINGUAL SEO FOOTER
          ========================================================= */}
      {!prefs.zenMode && (
        <footer
          className={`mt-12 border-t py-8 px-4 sm:px-6 text-xs ${
            isLightTheme
              ? 'border-amber-900/15 bg-amber-100/40 text-stone-700'
              : 'border-stone-800 bg-stone-950 text-stone-400'
          }`}
        >
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="font-serif font-bold text-sm text-amber-600 dark:text-amber-300">
                  ✦ ELOHIM BIBLE HUB — GENERATIONAL PARALLEL SCRIPTURE &amp; EXEGESIS
                </div>
                <p className="mt-1 text-xs opacity-80">
                  100% Ad-Free • Asante Twi (Twerɛ Kronkron) • Akuapem Twi • 35+ Global Languages • Strong&apos;s Exhaustive Concordance • Cloud Study Sync
                </p>
              </div>
              <div className="flex flex-wrap gap-4 font-semibold">
                <button
                  onClick={() =>
                    setLegalModalState({ open: true, page: 'about' })
                  }
                  className="hover:text-amber-500 transition"
                >
                  About Us
                </button>
                <button
                  onClick={() =>
                    setLegalModalState({ open: true, page: 'how-to-use' })
                  }
                  className="hover:text-amber-500 transition"
                >
                  How to Use
                </button>
                <button
                  onClick={() =>
                    setLegalModalState({ open: true, page: 'privacy' })
                  }
                  className="hover:text-amber-500 transition"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() =>
                    setLegalModalState({ open: true, page: 'terms' })
                  }
                  className="hover:text-amber-500 transition"
                >
                  Terms of Service
                </button>
                <a
                  href="mailto:support@elohimbible.org"
                  className="hover:text-amber-500 transition"
                >
                  support[at]elohimbible.org
                </a>
              </div>
            </div>

            {/* Multilingual Quick Switcher Strip (All 24+ Mega-Multilingual Languages) */}
            <div className="pt-4 border-t border-current/10">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">
                Instant Parallel Language Editions:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      const matchVer = allVersions.find(
                        (v) => v.languageCode === lang.code
                      );
                      if (matchVer && !activeVersionIds.includes(matchVer.id)) {
                        handleToggleVersionInParallel(matchVer.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-current/15 px-2 py-0.5 text-[11px] hover:border-amber-500 hover:text-amber-500 transition"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================
          MOBILE 5-TAB THUMB DOCK NAVIGATION
          ========================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-stone-800 bg-stone-950/95 backdrop-blur-md px-2 py-1.5 grid grid-cols-5 gap-1 text-stone-300">
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-stone-900 hover:text-amber-400"
        >
          <BookOpen className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">Books</span>
        </button>
        <button
          onClick={() => setIsLangAddonModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-stone-900 hover:text-amber-400"
        >
          <Layers className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">
            Parallel ({activeVersionIds.length})
          </span>
        </button>
        <button
          onClick={() => setIsStrongsModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-stone-900 hover:text-amber-400"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">Strong&apos;s</span>
        </button>
        <button
          onClick={() => {
            setStudyVaultTab('pins');
            setIsStudyVaultOpen(true);
          }}
          className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-stone-900 hover:text-amber-400"
        >
          <ScrollText className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">Study Vault</span>
        </button>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl hover:bg-stone-900 hover:text-amber-400"
        >
          <Cloud className="h-4 w-4 text-emerald-400" />
          <span className="text-[10px] font-bold mt-0.5">
            {user ? 'Synced' : 'Sign In'}
          </span>
        </button>
      </nav>

      {/* =========================================================
          MODALS & DRAWERS
          ========================================================= */}
      <BookChapterSelectorModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        books={canonicalBooks}
        currentBookId={currentBook.id}
        currentChapter={currentChapter}
        uiLanguageCode="tw"
        onSelectBookChapter={handleSelectBookChapter}
      />

      <LanguageAddonModal
        isOpen={isLangAddonModalOpen}
        onClose={() => setIsLangAddonModalOpen(false)}
        languages={allLanguages}
        allVersions={allVersions}
        activeVersionIds={activeVersionIds}
        onToggleVersionInParallel={handleToggleVersionInParallel}
        customAddons={customAddons}
        onSaveCustomAddon={async (addon) => {
          await saveCustomAddon(addon);
          const refreshed = await loadAllCustomAddons();
          setCustomAddons(refreshed);
        }}
        onDeleteCustomAddon={async (addonId) => {
          await deleteCustomAddon(addonId);
          const refreshed = await loadAllCustomAddons();
          setCustomAddons(refreshed);
          setActiveVersionIds((prev) => prev.filter((id) => id !== addonId));
        }}
        books={canonicalBooks}
        currentBookId={currentBook.id}
        currentChapter={currentChapter}
      />

      <StrongsPopoverModal
        isOpen={isStrongsModalOpen}
        onClose={() => setIsStrongsModalOpen(false)}
        selectedEntry={getStrongsEntry(selectedStrongCode)}
        allEntries={STRONGS_DICTIONARY}
        onSelectEntry={(code) => setSelectedStrongCode(code)}
        onNavigateReference={handleJumpToReferenceString}
      />

      <StudyVaultDrawer
        isOpen={isStudyVaultOpen}
        onClose={() => setIsStudyVaultOpen(false)}
        initialTab={studyVaultTab}
        pins={pins}
        highlights={highlights}
        bookmarks={bookmarks}
        notes={notes}
        onRemovePin={(id) => {
          const next = pins.filter((p) => p.id !== id);
          setPins(next);
          savePins(next);
          syncToCloudIfSignedIn(highlights, bookmarks, next, notes, prefs);
        }}
        onRemoveHighlight={(id) => {
          const next = highlights.filter((h) => h.id !== id);
          setHighlights(next);
          saveHighlights(next);
          syncToCloudIfSignedIn(next, bookmarks, pins, notes, prefs);
        }}
        onRemoveBookmark={(id) => {
          const next = bookmarks.filter((b) => b.id !== id);
          setBookmarks(next);
          saveBookmarks(next);
          syncToCloudIfSignedIn(highlights, next, pins, notes, prefs);
        }}
        onSaveNote={handleSaveNote}
        onRemoveNote={(id) => {
          const next = notes.filter((n) => n.id !== id);
          setNotes(next);
          saveNotes(next);
          syncToCloudIfSignedIn(highlights, bookmarks, pins, next, prefs);
        }}
        onJumpToVerse={(slug, ch, v) => {
          setCurrentBookSlug(slug);
          setCurrentChapter(ch);
          setSelectedVerse(v);
        }}
        onImportStudyVault={(imported) => {
          if (imported.pins) {
            setPins(imported.pins);
            savePins(imported.pins);
          }
          if (imported.highlights) {
            setHighlights(imported.highlights);
            saveHighlights(imported.highlights);
          }
          if (imported.bookmarks) {
            setBookmarks(imported.bookmarks);
            saveBookmarks(imported.bookmarks);
          }
          if (imported.notes) {
            setNotes(imported.notes);
            saveNotes(imported.notes);
          }
        }}
        currentBookId={currentBook.id}
        currentBookSlug={currentBook.slug}
        currentChapter={currentChapter}
        currentVersionId={primaryVersionId}
      />

      <AuthSyncModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUserChange={(u) => setUser(u)}
        onForceSync={async () => {
          await syncToCloudIfSignedIn();
        }}
        highlights={highlights}
        bookmarks={bookmarks}
        pins={pins}
        notes={notes}
      />

      {verseCardTarget && (
        <VerseCardStudioModal
          isOpen={Boolean(verseCardTarget)}
          onClose={() => setVerseCardTarget(null)}
          reference={`${currentBook.names.en} ${currentChapter}:${verseCardTarget.verse}`}
          primaryVersionName={
            allVersions.find((v) => v.id === primaryVersionId)?.shortName ||
            primaryVersionId.toUpperCase()
          }
          primaryText={verseCardTarget.primaryText}
          secondaryVersionName={
            activeVersionIds[1]
              ? allVersions.find((v) => v.id === activeVersionIds[1])?.shortName
              : undefined
          }
          secondaryText={verseCardTarget.secondaryText}
        />
      )}

      <LegalInstitutionalModal
        isOpen={legalModalState.open}
        initialPage={legalModalState.page}
        onClose={() => setLegalModalState({ ...legalModalState, open: false })}
      />
    </div>
  );
}
export default App;
