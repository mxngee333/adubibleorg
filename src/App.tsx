import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BibleVersion,
  ChapterData,
  CustomBibleAddon,
  HighlightColor,
  ReadingPreferences,
  UserProfile,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VersePiece,
  VersePin,
} from './types/bible';
import {
  getAllBibleVersions,
  getAllCanonicalBooks,
  getAllHistoricalBooks,
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
import { BookChapterSelectorModal } from './components/BookChapterSelectorModal';
import { LanguageAddonModal } from './components/LanguageAddonModal';
import { StrongsPopoverModal } from './components/StrongsPopoverModal';
import { StudyVaultDrawer } from './components/StudyVaultDrawer';
import { AuthSyncModal } from './components/AuthSyncModal';
import { VerseCardStudioModal } from './components/VerseCardStudioModal';
import { AnimatedStatusStudioModal } from './components/AnimatedStatusStudioModal';
import { CommentaryPanel } from './components/CommentaryPanel';
import { AudioBibleBar } from './components/AudioBibleBar';
import { SettingsModal } from './components/SettingsModal';
import { DeuterocanonicalHubPage } from './components/DeuterocanonicalHubPage';
import { ListOfSixtyHubPage } from './components/ListOfSixtyHubPage';
import {
  LegalInstitutionalModal,
  LegalPageKey,
} from './components/LegalInstitutionalModal';
import { OmniSearchBar } from './components/OmniSearchBar';
import { QuickVersionRibbon } from './components/QuickVersionRibbon';
import { MobileBottomDock } from './components/MobileBottomDock';
import { GrandSiteFooter } from './components/GrandSiteFooter';
import { AduBibleLogo } from './components/AduBibleLogo';
import { AskAduBibleModal } from './components/AskAduBibleModal';
import { Search, User, Film } from 'lucide-react';
import { AskAduBibleContext } from './services/askAduBibleService';

const COMPARE_PRESETS: Array<{ label: string; versions: string[] }> = [
  { label: 'KJV + Twi', versions: ['kjv', 'twi'] },
  { label: 'NKJV + Twi', versions: ['nkjv', 'twi'] },
  { label: 'KJV 1611 + Apocrypha', versions: ['kjv-apoc', 'twi-apoc'] },
  { label: 'Septuagint LXX + KJV', versions: ['lxx', 'kjv-apoc'] },
  { label: 'Catholic Douay-Rheims', versions: ['dra', 'twi-apoc'] },
  { label: 'Charles (Enoch) + Twi', versions: ['charles', 'twi-apoc'] },
  { label: 'Akuapem + Asante', versions: ['ak-twi', 'twi'] },
  { label: 'English Quad', versions: ['nkjv', 'kjv', 'bsb', 'asv'] },
  { label: 'Hausa + French', versions: ['ha', 'fr-lsg'] },
  { label: 'English versions', versions: ['kjv', 'bsb', 'web'] },
  { label: 'Greek/Hebrew + Twi', versions: ['tr-gk', 'twi', 'nkjv'] },
];

const HIGHLIGHT_COLORS: Array<{ id: HighlightColor; label: string; dotColor: string }> = [
  { id: 'gold', label: 'Gold', dotColor: '#d4a72c' },
  { id: 'emerald', label: 'Sage', dotColor: '#56996c' },
  { id: 'sapphire', label: 'Sky', dotColor: '#4c8cb8' },
  { id: 'rose', label: 'Rose', dotColor: '#c25d70' },
  { id: 'violet', label: 'Violet', dotColor: '#8d65b8' },
];

function renderVersePieces(
  pieces: VersePiece[] | undefined,
  fallbackText: string,
  versionId: string
): React.ReactNode {
  if (!pieces || pieces.length === 0) {
    return fallbackText;
  }
  return pieces.map((piece, idx) => {
    if (typeof piece === 'string') {
      return <React.Fragment key={idx}>{piece} </React.Fragment>;
    }
    if (piece && typeof piece === 'object') {
      if ('text' in piece && piece.text) {
        return (
          <React.Fragment key={idx}>
            {piece.text}{' '}
            {piece.lineBreak ? <br /> : null}
          </React.Fragment>
        );
      }
      if (piece.lineBreak) {
        return <br key={idx} />;
      }
      if (typeof piece.noteId === 'number') {
        const num = piece.noteId + 1;
        return (
          <React.Fragment key={idx}>
            <sup>
              <a href={`#fn-${versionId}-${num}`}>[{num}]</a>
            </sup>{' '}
          </React.Fragment>
        );
      }
      if (piece.heading) {
        return <strong key={idx}>{piece.heading} </strong>;
      }
    }
    return null;
  });
}

export function App() {
  const canonicalBooks = useMemo(() => getAllCanonicalBooks(), []);
  const allHistoricalBooks = useMemo(() => getAllHistoricalBooks(), []);
  const allLanguages = useMemo(() => getAllLanguagesMetadata(), []);

  // Parse initial URL (supports /nkjv/ephesians/1.htm, /kjv/ephesians/1, /twi/ephesians/1, etc.)
  const initialRoute = useMemo(
    () =>
      typeof window !== 'undefined'
        ? parseBibleHubUrlPath(window.location.pathname)
        : { versionId: 'kjv', bookSlug: 'ephesians', chapter: 1 },
    []
  );

  // Active Book, Chapter & Parallel Versions
  const [currentBookSlug, setCurrentBookSlug] = useState<string>(
    initialRoute.bookSlug || 'ephesians'
  );
  const [currentChapter, setCurrentChapter] = useState<number>(
    initialRoute.chapter || 1
  );

  // Active Canon Navigation Tab: 'canonical' (Default Scripture Reader) | 'deuterocanon' | 'list-of-sixty'
  const [activeNavTab, setActiveNavTab] = useState<'canonical' | 'deuterocanon' | 'list-of-sixty'>(() => {
    if (initialRoute.targetTab) return initialRoute.targetTab;
    if (typeof window !== 'undefined') {
      const qTab = new URLSearchParams(window.location.search).get('tab');
      if (qTab === 'deuterocanon' || qTab === 'list-of-sixty') return qTab;
      const p = window.location.pathname.toLowerCase();
      if (p.includes('deuterocanon') || p.includes('apocrypha')) return 'deuterocanon';
      if (p.includes('sixty') || p.includes('pseudepigrapha')) return 'list-of-sixty';
    }
    return 'canonical';
  });

  const [activeVersionIds, setActiveVersionIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      const qVersions = (q.get('versions') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (qVersions.length > 0) {
        return qVersions.slice(0, 4);
      }
    }
    const primary = initialRoute.versionId || 'kjv';
    if (initialRoute.isParallelRoute) {
      return ['kjv', 'twi', 'bsb'];
    }
    if (primary === 'twi') {
      return ['twi', 'kjv'];
    }
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/' || window.location.pathname === '')
    ) {
      return ['kjv', 'twi'];
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
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState<boolean>(false);
  const [themeSyncNotice, setThemeSyncNotice] = useState<string>('');

  // Wisdom Bible column translation picker state ('add' | column index | null)
  const [pickerSlot, setPickerSlot] = useState<number | 'add' | null>(null);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [bookPickerTab, setBookPickerTab] = useState<'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD'>('CANONICAL');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
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
  const [isAskAduBibleOpen, setIsAskAduBibleOpen] = useState<boolean>(false);
  const [verseCardTarget, setVerseCardTarget] = useState<{
    verse: number;
    primaryText: string;
    secondaryText?: string;
  } | null>(null);
  const [isStatusStudioOpen, setIsStatusStudioOpen] = useState<boolean>(false);
  const [statusStudioTarget, setStatusStudioTarget] = useState<{
    reference: string;
    primaryText: string;
    primaryVersion?: string;
    secondaryText?: string;
    secondaryVersion?: string;
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
      allHistoricalBooks.find((b) => b.slug === currentBookSlug) ||
      canonicalBooks.find((b) => b.slug === currentBookSlug) ||
      canonicalBooks.find((b) => b.slug === 'ephesians') ||
      canonicalBooks[0],
    [allHistoricalBooks, canonicalBooks, currentBookSlug]
  );

  // Strictly isolate collection books so Apocrypha & Deuterocanon NEVER bleed into the accepted canon
  const activeCollectionBooks = useMemo(() => {
    if (currentBook?.testament === 'DC') {
      return allHistoricalBooks.filter((b) => b.testament === 'DC');
    }
    if (currentBook?.testament === 'PSEUD') {
      return allHistoricalBooks.filter((b) => b.testament === 'PSEUD');
    }
    return canonicalBooks; // Strictly the 66 accepted canonical books (OT 39 + NT 27)
  }, [currentBook?.testament, allHistoricalBooks, canonicalBooks]);

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
          if (cloud.preferences?.theme) {
            setPrefs((prev) => {
              const merged = { ...prev, ...cloud.preferences };
              savePreferences(merged);
              return merged;
            });
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
          versionId: activeVersionIds[0] || 'kjv',
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
    const primaryVer = activeVersionIds[0] || 'kjv';
    const nextUrl = `/${primaryVer}/${currentBook.slug}/${currentChapter}/`;

    // Retain clean '/' root URL when resting on homepage default sanctuary state
    const isAtHomeState =
      currentBook.slug === 'ephesians' &&
      currentChapter === 1 &&
      activeVersionIds.length === 2 &&
      activeVersionIds[0] === 'kjv' &&
      activeVersionIds[1] === 'twi';

    if (window.location.pathname === '/' && isAtHomeState) {
      document.title =
        "AduBible.org — Ad-Free Multilingual Parallel Bible, Twi & 35+ Languages";
      return;
    }

    if (
      window.location.pathname !== nextUrl &&
      !['about', 'how-to-use', 'privacy', 'terms'].some((p) =>
        window.location.pathname.includes(p)
      )
    ) {
      window.history.replaceState({}, '', nextUrl);
    }
    document.title = `${currentBook.names.en} ${currentChapter} (${currentBook.names.tw || currentBook.names.en}) — AduBible.org Parallel Reader`;
  }, [activeVersionIds, currentBook, currentChapter]);

  // Listen for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      if (window.location.pathname === '/' || window.location.pathname === '') {
        setLegalModalState((prev) => ({ ...prev, open: false }));
        setCurrentBookSlug('ephesians');
        setCurrentChapter(1);
        setSelectedVerse(1);
        setActiveVersionIds(['kjv', 'twi']);
        return;
      }
      const route = parseBibleHubUrlPath(window.location.pathname);
      if (route.legalPage) {
        setLegalModalState({ open: true, page: route.legalPage });
      } else {
        setLegalModalState((prev) => ({ ...prev, open: false }));
        if (route.bookSlug) setCurrentBookSlug(route.bookSlug);
        if (route.chapter) setCurrentChapter(route.chapter);
        if (route.versionId) {
          setActiveVersionIds((prev) =>
            prev.includes(route.versionId!)
              ? prev
              : [route.versionId!, ...prev].slice(0, 4)
          );
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    if (partial.theme || partial.customTheme) {
      const themeLabel =
        next.theme === 'custom'
          ? (next.customTheme?.name || 'Custom Palette')
          : next.theme === 'royal-purple'
          ? 'Royal Tyrian Velvet'
          : next.theme === 'lilac-light'
          ? 'Sacred Lilac Parchment'
          : next.theme === 'burgundy-gold'
          ? 'Burgundy Leather KJV'
          : next.theme === 'architect-gold'
          ? 'Sacred Architect Maroon'
          : next.theme === 'covenant-atlas'
          ? 'Covenant Atlas'
          : next.theme === 'wisdom-legacy'
          ? 'Wisdom Bible Legacy'
          : next.theme === 'adubible-si'
          ? 'AduBible SI Sovereign'
          : next.theme === 'sapphire-blue'
          ? 'Celestial Sapphire'
          : next.theme === 'midnight'
          ? 'Obsidian & Gold'
          : 'Warm Daylight';
      setThemeSyncNotice(
        user
          ? `☁️ Theme "${themeLabel}" synced to cloud profile (${user.displayName || user.email?.split('@')[0]})`
          : `💾 Theme "${themeLabel}" synced locally to this device`
      );
      setTimeout(() => setThemeSyncNotice(''), 3500);
    }
  };

  // Toggle a version in the parallel reader (1 to 4 panes)
  const handleToggleVersionInParallel = (versionId: string) => {
    setActiveVersionIds((prev) => {
      if (prev.includes(versionId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleChooseVersionForSlot = (versionId: string) => {
    if (pickerSlot === 'add') {
      if (!activeVersionIds.includes(versionId)) {
        setActiveVersionIds((prev) => [...prev, versionId].slice(0, 4));
      }
    } else if (typeof pickerSlot === 'number') {
      setActiveVersionIds((prev) => {
        const next = prev.map((item, idx) => (idx === pickerSlot ? versionId : item));
        return Array.from(new Set(next));
      });
    }
    setPickerSlot(null);
    setPickerSearch('');
  };

  const handleRemoveColumn = (idx: number) => {
    if (activeVersionIds.length <= 1) return;
    setActiveVersionIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSwapLanguages = () => {
    setActiveVersionIds((prev) => {
      if (prev.length < 2) return prev;
      if (prev.length === 2) {
        return [prev[1], prev[0]];
      }
      return [prev[1], prev[0], ...prev.slice(2)];
    });
  };

  const handleSwapColumn = (idx: number) => {
    setActiveVersionIds((prev) => {
      if (prev.length < 2) return prev;
      const copy = [...prev];
      if (prev.length === 2) {
        return [copy[1], copy[0]];
      }
      const targetIdx = idx === prev.length - 1 ? idx - 1 : idx + 1;
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleToggleRibbonVersion = (vId: string) => {
    setActiveVersionIds((prev) => {
      if (prev.includes(vId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== vId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(0, 3), vId];
      }
      return [...prev, vId];
    });
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return; // Allow native open in new tab/window
      }
      e.preventDefault();
    }
    // Close all open modals & drawers
    setLegalModalState((prev) => ({ ...prev, open: false }));
    setIsSettingsOpen(false);
    setIsBookModalOpen(false);
    setIsLangAddonModalOpen(false);
    setIsStrongsModalOpen(false);
    setIsStudyVaultOpen(false);
    setIsAuthModalOpen(false);
    setIsAskAduBibleOpen(false);
    setPickerSlot(null);
    setVerseCardTarget(null);
    setActiveVerseActionBar(null);

    // Reset to default home sanctuary reading state (Ephesians 1, KJV + Asante Twi)
    setActiveNavTab('canonical');
    setCurrentBookSlug('ephesians');
    setCurrentChapter(1);
    setSelectedVerse(1);
    setActiveVersionIds(['kjv', 'twi']);

    // Update browser URL to / if not already there
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBookChapter = (bookSlug: string, chapter: number) => {
    setCurrentBookSlug(bookSlug);
    setCurrentChapter(chapter);
    setSelectedVerse(1);
    setActiveVerseActionBar(null);
    setActiveNavTab('canonical');

    // Auto-align parallel translations when switching between Canonical, Deuterocanon, and Apocrypha
    const targetBook = allHistoricalBooks.find((b) => b.slug === bookSlug);
    if (targetBook?.testament === 'DC') {
      const hasDCVersion = activeVersionIds.some((id) =>
        ['kjv-apoc', 'twi-apoc', 'dra', 'lxx', 'vulgate'].includes(id)
      );
      if (!hasDCVersion) {
        setActiveVersionIds(['kjv-apoc', 'twi-apoc']);
      }
    } else if (targetBook?.testament === 'PSEUD') {
      const hasPseudVersion = activeVersionIds.some((id) =>
        ['charles', 'lightfoot', 'twi-apoc', 'kjv-apoc'].includes(id)
      );
      if (!hasPseudVersion) {
        setActiveVersionIds(['charles', 'twi-apoc']);
      }
    } else if (targetBook?.testament === 'OT' || targetBook?.testament === 'NT') {
      const onlyApocryphaVersions = activeVersionIds.every((id) =>
        ['charles', 'lightfoot'].includes(id)
      );
      if (onlyApocryphaVersions) {
        setActiveVersionIds(['nkjv', 'twi']);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepChapter = (delta: number) => {
    const nextCh = currentChapter + delta;
    if (nextCh >= 1 && nextCh <= currentBook.chapters) {
      handleSelectBookChapter(currentBook.slug, nextCh);
      return;
    }
    const currentBookIdx = activeCollectionBooks.findIndex(
      (b) => b.id === currentBook.id
    );
    if (delta > 0 && currentBookIdx < activeCollectionBooks.length - 1) {
      const nextBook = activeCollectionBooks[currentBookIdx + 1];
      handleSelectBookChapter(nextBook.slug, 1);
    } else if (delta < 0 && currentBookIdx > 0) {
      const prevBook = activeCollectionBooks[currentBookIdx - 1];
      handleSelectBookChapter(prevBook.slug, prevBook.chapters);
    }
  };

  const handleJumpToReferenceString = (refStr: string) => {
    const match = refStr
      .trim()
      .match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+)(?::(\d+))?/);
    if (!match) return;
    const rawBookName = match[1].trim().toLowerCase().replace(/\s+/g, '-');
    const chNum = parseInt(match[2], 10) || 1;
    const vNum = match[3] ? parseInt(match[3], 10) : 1;
    const foundBook = allHistoricalBooks.find(
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

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/${activeVersionIds[0] || 'kjv'}/${currentBook.slug}/${currentChapter}/?versions=${activeVersionIds.join(',')}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 1800);
    } catch {
      // ignore
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
      next = highlights.filter((h) => h.verseKey !== verseKey);
    } else {
      const item: VerseHighlight = {
        id: existing?.id || `hl-${Date.now()}`,
        verseKey,
        bookId: currentBook.id,
        bookSlug: currentBook.slug,
        chapter: currentChapter,
        verse: verseNum,
        versionId: activeVersionIds[0] || 'kjv',
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
    const primaryVer = activeVersionIds[0] || 'kjv';
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
        versionId: activeVersionIds[0] || 'kjv',
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
  const primaryVersionId = activeVersionIds[0] || 'kjv';
  const primaryChapterData = chaptersByVersion[primaryVersionId];
  const primaryVerses = useMemo(
    () => primaryChapterData?.verses || [],
    [primaryChapterData]
  );

  const askAduBibleContext: AskAduBibleContext = useMemo(() => {
    const selectedVerseObj = primaryChapterData?.verses.find(
      (v) => v.verse === selectedVerse
    );
    return {
      bookNameEn: currentBook.names.en,
      bookNameTw: currentBook.names.tw,
      bookSlug: currentBook.slug,
      chapter: currentChapter,
      selectedVerse: selectedVerse || 1,
      selectedVerseText: selectedVerseObj?.text,
      activeVersions: activeVersionIds,
    };
  }, [currentBook, currentChapter, selectedVerse, primaryChapterData, activeVersionIds]);

  const filteredVerseNumbers = useMemo(() => {
    const maxV = Math.max(
      primaryVerses.length,
      ...activeVersionIds.map((id) => chaptersByVersion[id]?.verses.length || 0)
    );
    const numbers = Array.from({ length: maxV }, (_, idx) => idx + 1);
    const q = chapterSearchQuery.trim().toLowerCase();
    if (!q) return numbers;
    return numbers.filter((vNum) => {
      if (String(vNum) === q) return true;
      return activeVersionIds.some((vId) => {
        const vObj = chaptersByVersion[vId]?.verses.find((x) => x.verse === vNum);
        const combined = `${vObj?.heading || ''} ${vObj?.text || ''}`.toLowerCase();
        return combined.includes(q);
      });
    });
  }, [primaryVerses, activeVersionIds, chaptersByVersion, chapterSearchQuery]);

  // Commentaries for current chapter (only rendered when prefs.showCommentaries is ON in Settings)
  const chapterCommentaries = useMemo(
    () => getCommentariesForChapter(currentBook.id, currentChapter),
    [currentBook.id, currentChapter]
  );

  const selectedStrongsEntry = useMemo(
    () => getStrongsEntry(selectedStrongCode),
    [selectedStrongCode]
  );

  // Grouped translations for the Wisdom Bible column picker dialog
  const groupedPickerVersions = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    const groups = new Map<string, BibleVersion[]>();
    for (const ver of allVersions) {
      const hay = `${ver.name} ${ver.shortName} ${ver.languageName} ${ver.nativeLanguageName}`.toLowerCase();
      if (q && !hay.includes(q)) continue;
      const list = groups.get(ver.languageName) || [];
      list.push(ver);
      groups.set(ver.languageName, list);
    }
    return Array.from(groups.entries());
  }, [allVersions, pickerSearch]);

  const isNight =
    prefs.theme !== 'parchment' &&
    prefs.theme !== 'daylight' &&
    prefs.theme !== 'lilac-light' &&
    (prefs.theme !== 'custom' || (prefs.customTheme?.isDark ?? true));
  const totalVaultCount =
    pins.length + highlights.length + bookmarks.length + notes.length;
  const studyLayersActiveCount =
    (prefs.showStrongsInline ? 1 : 0) + (prefs.showCommentaries ? 1 : 0);

  const renderSharedFooter = () => (
    <GrandSiteFooter
      onOpenLegal={(page) => setLegalModalState({ open: true, page })}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onGoHome={handleGoHome}
      onSelectNavTab={(tab) => {
        setActiveNavTab(tab);
        if (typeof window !== 'undefined') {
          if (tab === 'canonical') {
            window.history.pushState(
              {},
              '',
              `/${activeVersionIds[0] || 'kjv'}/${currentBookSlug}/${currentChapter}`
            );
          } else {
            window.history.pushState({}, '', `/${tab}`);
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onSelectTheme={(themeKey) => {
        updatePrefs({ theme: themeKey as any });
      }}
      onOpenBookPickerWithTab={(tab) => {
        setBookPickerTab(tab);
        setIsBookModalOpen(true);
      }}
      showStrongs={prefs.showStrongsInline}
      showCommentaries={prefs.showCommentaries}
    />
  );

  return (
    <div
      className={`bible-app theme-${prefs.theme} ${isNight ? 'night' : ''}`}
      style={
        prefs.theme === 'custom' && prefs.customTheme
          ? ({
              '--paper': prefs.customTheme.paper,
              '--surface': prefs.customTheme.surface,
              '--ink': prefs.customTheme.ink,
              '--subtle': prefs.customTheme.subtle,
              '--line': prefs.customTheme.line,
              '--green': prefs.customTheme.accent,
              '--soft': prefs.customTheme.surface,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* 1. TOP MASTHEAD (AduBible) */}
      <header className="masthead">
        <a
          href="/"
          className="brand"
          onClick={handleGoHome}
          title="AduBible.org — Sovereign Scripture Engine"
        >
          <AduBibleLogo size="md" />
        </a>

        <div className="mast-search">
          <OmniSearchBar
            books={allHistoricalBooks}
            currentBookSlug={currentBook.slug}
            currentChapter={currentChapter}
            onNavigate={(slug, ch, v) => {
              handleSelectBookChapter(slug, ch);
              if (v) setSelectedVerse(v);
            }}
          />
        </div>

        <div className="mast-actions">
          <button
            type="button"
            className="quiet-button"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.45)',
              color: '#f59e0b',
              fontWeight: 700,
            }}
            onClick={() => {
              setStatusStudioTarget(null);
              setIsStatusStudioOpen(true);
            }}
            title="10s Animated Scripture Status Studio — WhatsApp, Reels, Shorts & TikTok"
          >
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              10s Status Video
            </span>
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={() => {
              setStudyVaultTab('pins');
              setIsStudyVaultOpen(true);
            }}
            title="Saved Bookmarks, Pins, Highlights & Notes"
          >
            <span>Vault ({totalVaultCount})</span>
          </button>

          <button
            type="button"
            className={`quiet-button ${showAudioBar ? 'active-pill' : ''}`}
            onClick={() => setShowAudioBar((prev) => !prev)}
            title="Listen to Audio Scripture"
          >
            <span>Audio</span>
          </button>

          <button
            type="button"
            className={`quiet-button ${studyLayersActiveCount > 0 ? 'active-pill' : ''}`}
            onClick={() => setIsSettingsOpen(true)}
            title="Reading Settings — Toggle Strong's Concordance & Commentaries"
          >
            <span>
              ⚙️ Settings{studyLayersActiveCount > 0 ? ` (${studyLayersActiveCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={() => setIsAuthModalOpen(true)}
            title="Sign in to sync Bookmarks, Highlights, Pins & Notes"
          >
            <span>{user ? user.displayName || 'Synced' : 'Sign in'}</span>
          </button>
        </div>

        {/* Mobile-only clean top controls: Search icon, Active Edition Pill, Sign In */}
        <div className="mobile-mast-actions">
          <button
            type="button"
            className="mobile-mast-icon-btn"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Search scripture or topic"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="mobile-mast-pill-btn"
            onClick={() => setIsLangAddonModalOpen(true)}
            aria-label="Select translations"
          >
            <span>{activeVersionIds.length > 1 ? `${activeVersionIds.length} Eds` : activeVersionIds[0]?.toUpperCase() || 'KJV'}</span>
          </button>

          <button
            type="button"
            className="mobile-mast-icon-btn"
            onClick={() => setIsAuthModalOpen(true)}
            aria-label="Account / Sign in"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ISOLATED HISTORICAL ZONE BANNER (Only visible when user explicitly visits /deuterocanon or /list-of-sixty) */}
      {activeNavTab !== 'canonical' && (
        <div
          className="historical-zone-strip"
          style={{
            background: 'var(--paper)',
            borderBottom: '1px solid var(--line)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historical &amp; Ancient Manuscript Zone
            </span>
            <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>
              (Isolated research zone · Not interleaved with the 66 Books of Scripture)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveNavTab('canonical');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Return to Holy Bible (66 Canonical Books)
          </button>
        </div>
      )}

            {/* QUICK TRANSLATION VERSION RIBBON (BIBLEHUB-STYLE 1-TAP SWITCHER) */}
      <QuickVersionRibbon
        activeVersionIds={activeVersionIds}
        allVersions={allVersions}
        onToggleVersion={handleToggleRibbonVersion}
        onOpenVersionPicker={() => setPickerSlot('add')}
      />

      {/* 3. DEDICATED CANON VIEWS OR PARALLEL SCRIPTURE READER */}
      {activeNavTab === 'deuterocanon' ? (
        <DeuterocanonicalHubPage
          books={allHistoricalBooks}
          uiLanguageCode="en"
          onSelectBookChapter={(slug, chapter) => {
            handleSelectBookChapter(slug, chapter);
            if (typeof window !== 'undefined') {
              window.history.pushState(
                {},
                '',
                `/${activeVersionIds[0] || 'kjv-apoc'}/${slug}/${chapter}`
              );
            }
          }}
          onOpenReaderWithVersions={(slug, chapter, versionIds) => {
            setCurrentBookSlug(slug);
            setCurrentChapter(chapter);
            setSelectedVerse(1);
            setActiveVersionIds(versionIds);
            setActiveNavTab('canonical');
            if (typeof window !== 'undefined') {
              window.history.pushState(
                {},
                '',
                `/${versionIds[0] || 'kjv-apoc'}/${slug}/${chapter}?versions=${versionIds.join(',')}`
              );
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          footer={renderSharedFooter()}
        />
      ) : activeNavTab === 'list-of-sixty' ? (
        <ListOfSixtyHubPage
          books={allHistoricalBooks}
          uiLanguageCode="en"
          onSelectBookChapter={(slug, chapter) => {
            handleSelectBookChapter(slug, chapter);
            if (typeof window !== 'undefined') {
              window.history.pushState(
                {},
                '',
                `/${activeVersionIds[0] || 'charles'}/${slug}/${chapter}`
              );
            }
          }}
          onOpenReaderWithVersions={(slug, chapter, versionIds) => {
            setCurrentBookSlug(slug);
            setCurrentChapter(chapter);
            setSelectedVerse(1);
            setActiveVersionIds(versionIds);
            setActiveNavTab('canonical');
            if (typeof window !== 'undefined') {
              window.history.pushState(
                {},
                '',
                `/${versionIds[0] || 'charles'}/${slug}/${chapter}?versions=${versionIds.join(',')}`
              );
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          footer={renderSharedFooter()}
        />
      ) : (
        <main id="reader" className="workspace">
          <section className="page-heading">
            <h1>{currentBook.names.en} {currentChapter}</h1>
          </section>

        {/* 3. READING SHELL */}
        <section id="reading-shell" className="reading-shell" aria-busy={loadingChapters}>
          {/* MOBILE BIBLEHUB COMPACT BAR (Visible on mobile <= 768px) */}
          <div className="mobile-biblehub-bar" aria-label="Mobile Chapter Navigation">
            <button
              type="button"
              className="mobile-chapter-step-btn"
              onClick={() => handleStepChapter(-1)}
              disabled={
                currentBook.id === activeCollectionBooks[0]?.id && currentChapter <= 1
              }
              aria-label="Previous chapter"
              title="Previous chapter"
            >
              ◀
            </button>

            <button
              type="button"
              className="mobile-chapter-title-trigger"
              onClick={() => setIsBookModalOpen(true)}
              aria-label="Select Book and Chapter"
              title="Select Book and Chapter"
            >
              <span className="mobile-book-name">{currentBook.names.en}</span>
              <span className="mobile-chapter-num">{currentChapter}</span>
              {currentBook.names.tw && currentBook.names.tw !== currentBook.names.en && (
                <span className="mobile-twi-tag">({currentBook.names.tw})</span>
              )}
              <span className="mobile-caret">▾</span>
            </button>

            <button
              type="button"
              className="mobile-chapter-step-btn"
              onClick={() => handleStepChapter(1)}
              disabled={
                currentBook.id ===
                  activeCollectionBooks[activeCollectionBooks.length - 1]?.id &&
                currentChapter >= currentBook.chapters
              }
              aria-label="Next chapter"
              title="Next chapter"
            >
              ▶
            </button>

            <div className="mobile-bar-quick-actions">
              <button
                type="button"
                className="mobile-quick-btn apo-dc-btn"
                onClick={() => {
                  setBookPickerTab(currentBook.testament === 'DC' ? 'PSEUD' : 'DC');
                  setIsBookModalOpen(true);
                }}
                title="Browse 16 Deuterocanon & 25 Apocrypha Books"
                aria-label="Browse Deuterocanon & Apocrypha Books"
              >
                📜 Apo/DC
              </button>
              {activeVersionIds.length >= 2 && (
                <button
                  type="button"
                  className="mobile-quick-btn swap"
                  onClick={handleSwapLanguages}
                  title="Swap parallel languages"
                  aria-label="Swap parallel languages"
                >
                  ⇄
                </button>
              )}
              <button
                type="button"
                className={`mobile-quick-btn ${showAudioBar ? 'active' : ''}`}
                onClick={() => setShowAudioBar((prev) => !prev)}
                title="Audio Bible"
                aria-label="Audio Bible"
              >
                Audio
              </button>
              <button
                type="button"
                className="mobile-quick-btn add-btn"
                onClick={() => setPickerSlot('add')}
                disabled={activeVersionIds.length >= 4}
                title="Add translation column"
              >
                + Add
              </button>
            </div>
          </div>

          {/* FLOATING SIDE CHAPTER NAV ARROWS (BibleHub Style) */}
          <button
            type="button"
            className="biblehub-edge-arrow left"
            onClick={() => handleStepChapter(-1)}
            disabled={
              currentBook.id === activeCollectionBooks[0]?.id && currentChapter <= 1
            }
            aria-label="Previous chapter"
            title="Previous chapter"
          >
            ‹
          </button>
          <button
            type="button"
            className="biblehub-edge-arrow right"
            onClick={() => handleStepChapter(1)}
            disabled={
              currentBook.id ===
                activeCollectionBooks[activeCollectionBooks.length - 1]?.id &&
              currentChapter >= currentBook.chapters
            }
            aria-label="Next chapter"
            title="Next chapter"
          >
            ›
          </button>

          {/* PASSAGE TOOLBAR */}
          <div className="passage-toolbar">
            <div className="passage-controls">
              <label className="field">
                <span>Book</span>
                <select
                  value={currentBook.slug}
                  onChange={(e) => handleSelectBookChapter(e.target.value, 1)}
                  aria-label="Select Bible book across Canonical, Deuterocanon, and Apocrypha"
                >
                  <optgroup label="── 66 ACCEPTED CANONICAL SCRIPTURES (OT 39 + NT 27) ──">
                    {canonicalBooks.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.names.en} ({item.names.tw || item.id})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="── 16 DEUTEROCANONICAL BOOKS (Catholic / Orthodox) ──">
                    {allHistoricalBooks
                      .filter((b) => b.testament === 'DC')
                      .map((item) => (
                        <option key={item.id} value={item.slug}>
                          {item.names.en} ({item.names.tw || item.id})
                        </option>
                      ))}
                  </optgroup>

                  <optgroup label="── 25 APOCRYPHA & HISTORICAL TEXTS (List of Sixty) ──">
                    {allHistoricalBooks
                      .filter((b) => b.testament === 'PSEUD')
                      .map((item) => (
                        <option key={item.id} value={item.slug}>
                          {item.names.en} ({item.names.tw || item.id})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </label>

              <label className="field compact">
                <span>Chapter</span>
                <select
                  value={currentChapter}
                  onChange={(e) =>
                    handleSelectBookChapter(
                      currentBook.slug,
                      Number(e.target.value)
                    )
                  }
                >
                  {Array.from(
                    { length: currentBook.chapters },
                    (_, idx) => idx + 1
                  ).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </label>

              <div className="step-buttons" role="group" aria-label="Chapter navigation">
                <button
                  type="button"
                  onClick={() => handleStepChapter(-1)}
                  disabled={
                    currentBook.id === activeCollectionBooks[0]?.id && currentChapter <= 1
                  }
                  aria-label="Previous chapter"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleStepChapter(1)}
                  disabled={
                    currentBook.id === activeCollectionBooks[activeCollectionBooks.length - 1]?.id &&
                    currentChapter >= currentBook.chapters
                  }
                  aria-label="Next chapter"
                >
                  →
                </button>
              </div>

              <div className="step-buttons">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(true)}
                  title={
                    currentBook.testament === 'DC'
                      ? 'Browse 16 Deuterocanonical Books'
                      : currentBook.testament === 'PSEUD'
                      ? 'Browse 25 List of Sixty & Apocrypha Books'
                      : 'Browse all 66 Accepted Canonical Books in English & Twi'
                  }
                >
                  {currentBook.testament === 'DC'
                    ? 'Deuterocanon (16)'
                    : currentBook.testament === 'PSEUD'
                    ? 'Apocrypha (25)'
                    : 'All 66 Books'}
                </button>
              </div>
            </div>

            <div className="reader-tools">
              <button
                type="button"
                onClick={() =>
                  updatePrefs({ fontSize: Math.max(15, prefs.fontSize - 1) })
                }
                aria-label="Smaller text"
              >
                T-
              </button>
              <button
                type="button"
                onClick={() =>
                  updatePrefs({ fontSize: Math.min(26, prefs.fontSize + 1) })
                }
                aria-label="Larger text"
              >
                T+
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className={isThemePickerOpen ? 'settings-active' : ''}
                  onClick={() => setIsThemePickerOpen((prev) => !prev)}
                  title="Choose reading palette or design custom theme"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {prefs.theme === 'royal-purple' ? (
                    <>
                      <img src="/themes/royal-open-bible.png" alt="Royal" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span>Velvet</span>
                    </>
                  ) : prefs.theme === 'lilac-light' ? (
                    <>
                      <img src="/themes/lilac-bible.png" alt="Lilac" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span>Lilac</span>
                    </>
                  ) : prefs.theme === 'burgundy-gold' ? (
                    <>
                      <img src="/themes/burgundy-kjv-bible.png" alt="Burgundy" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span>Burgundy</span>
                    </>
                  ) : prefs.theme === 'architect-gold' ? (
                    <>
                      <img src="/themes/architect-gold-bible.png" alt="Architect" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span>Architect</span>
                    </>
                  ) : prefs.theme === 'covenant-atlas' ? (
                    <>
                      <img src="/themes/covenant-atlas.png" alt="Atlas" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span>Atlas</span>
                    </>
                  ) : prefs.theme === 'wisdom-legacy' ? (
                    <>
                      <img src="/themes/wisdom-legacy-banner.png" alt="Legacy" style={{ width: '22px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} />
                      <span>Legacy</span>
                    </>
                  ) : prefs.theme === 'adubible-si' ? (
                    <>
                      <img src="/themes/adubible-si-banner.png" alt="SI Gold" style={{ width: '22px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} />
                      <span>SI Gold</span>
                    </>
                  ) : prefs.theme === 'custom' ? (
                    <>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: prefs.customTheme?.accent || '#c084fc',
                          border: '1px solid #ffffff',
                        }}
                      />
                      <span>Custom</span>
                    </>
                  ) : prefs.theme === 'sapphire-blue' ? (
                    <>🌊 Sapphire</>
                  ) : prefs.theme === 'midnight' ? (
                    <>🌙 Obsidian</>
                  ) : (
                    <>☀️ Daylight</>
                  )}
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
                </button>

                {isThemePickerOpen && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 49,
                      }}
                      onClick={() => setIsThemePickerOpen(false)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        width: '320px',
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        borderRadius: '10px',
                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
                        padding: '12px',
                        zIndex: 50,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--line)',
                          paddingBottom: '8px',
                          marginBottom: '10px',
                        }}
                      >
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Scripture Palettes</strong>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '999px',
                            background: 'rgba(212, 175, 55, 0.15)',
                            color: 'var(--green)',
                            fontWeight: 600,
                          }}
                        >
                          {user ? '☁️ Cloud' : '💾 Local'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
                        {/* 1. Wisdom Bible Legacy (Default) */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'wisdom-legacy' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'wisdom-legacy' ? '#b7c99f' : 'transparent'}`,
                            background: prefs.theme === 'wisdom-legacy' ? 'rgba(67, 85, 59, 0.35)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/wisdom-legacy-banner.png"
                            alt="Wisdom Bible Legacy"
                            style={{ width: '32px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>🌿 Wisdom Bible Legacy</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Deep pine &amp; contemplative sage (Default)</div>
                          </div>
                          {prefs.theme === 'wisdom-legacy' && <span style={{ color: '#b7c99f', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 2. Royal Tyrian Velvet */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'royal-purple' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'royal-purple' ? '#c084fc' : 'transparent'}`,
                            background: prefs.theme === 'royal-purple' ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/royal-open-bible.png"
                            alt="Royal"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>👑 Royal Tyrian Velvet</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Deep violet &amp; gold ribbon</div>
                          </div>
                          {prefs.theme === 'royal-purple' && <span style={{ color: '#c084fc', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 2. Sacred Lilac Parchment */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'lilac-light' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'lilac-light' ? '#7e22ce' : 'transparent'}`,
                            background: prefs.theme === 'lilac-light' ? 'rgba(126, 34, 206, 0.12)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/lilac-bible.png"
                            alt="Lilac"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>🌸 Sacred Lilac Parchment</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Light morning lavender</div>
                          </div>
                          {prefs.theme === 'lilac-light' && <span style={{ color: '#7e22ce', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 3. Burgundy Leather KJV */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'burgundy-gold' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'burgundy-gold' ? '#f59e0b' : 'transparent'}`,
                            background: prefs.theme === 'burgundy-gold' ? 'rgba(185, 28, 28, 0.2)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/burgundy-kjv-bible.png"
                            alt="Burgundy KJV"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>📖 Burgundy Leather KJV</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Wine leather &amp; gold leaf</div>
                          </div>
                          {prefs.theme === 'burgundy-gold' && <span style={{ color: '#f59e0b', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 4. AduBible SI Sovereign */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'adubible-si' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'adubible-si' ? '#d4af37' : 'transparent'}`,
                            background: prefs.theme === 'adubible-si' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/adubible-si-banner.png"
                            alt="AduBible SI"
                            style={{ width: '32px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>⚡ AduBible SI Sovereign</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Obsidian &amp; sovereign gold</div>
                          </div>
                          {prefs.theme === 'adubible-si' && <span style={{ color: '#d4af37', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 5. Sacred Architect & Royal Maroon */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'architect-gold' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'architect-gold' ? '#c89e34' : 'transparent'}`,
                            background: prefs.theme === 'architect-gold' ? 'rgba(200, 158, 52, 0.2)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/architect-gold-bible.png"
                            alt="Sacred Architect"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>📐 Sacred Architect Maroon</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Maroon leather &amp; compass gold</div>
                          </div>
                          {prefs.theme === 'architect-gold' && <span style={{ color: '#c89e34', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 6. Covenant Atlas */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'covenant-atlas' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'covenant-atlas' ? '#2dd4bf' : 'transparent'}`,
                            background: prefs.theme === 'covenant-atlas' ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <img
                            src="/themes/covenant-atlas.png"
                            alt="Covenant Atlas"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>🧭 Covenant Atlas</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Scripture compass &amp; sea teal</div>
                          </div>
                          {prefs.theme === 'covenant-atlas' && <span style={{ color: '#2dd4bf', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 5. Celestial Sapphire */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'sapphire-blue' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'sapphire-blue' ? '#38bdf8' : 'transparent'}`,
                            background: prefs.theme === 'sapphire-blue' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <span style={{ fontSize: '18px', width: '32px', textAlign: 'center' }}>🌊</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>Celestial Sapphire</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Tekhelet sanctuary blue</div>
                          </div>
                          {prefs.theme === 'sapphire-blue' && <span style={{ color: '#38bdf8', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 6. Obsidian & Amber Gold */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'midnight' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'midnight' ? '#f59e0b' : 'transparent'}`,
                            background: prefs.theme === 'midnight' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <span style={{ fontSize: '18px', width: '32px', textAlign: 'center' }}>🌙</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>Obsidian &amp; Amber Gold</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Temple night &amp; candlelight</div>
                          </div>
                          {prefs.theme === 'midnight' && <span style={{ color: '#f59e0b', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 7. Warm Daylight Parchment */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'parchment' });
                            setIsThemePickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'parchment' ? '#d97706' : 'transparent'}`,
                            background: prefs.theme === 'parchment' ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <span style={{ fontSize: '18px', width: '32px', textAlign: 'center' }}>☀️</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>Warm Daylight Parchment</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Classic editorial cream scroll</div>
                          </div>
                          {prefs.theme === 'parchment' && <span style={{ color: '#d97706', fontSize: '12px' }}>✓</span>}
                        </button>

                        {/* 8. Custom Palette Studio */}
                        <button
                          type="button"
                          onClick={() => {
                            updatePrefs({ theme: 'custom' });
                            setIsThemePickerOpen(false);
                            setIsSettingsOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${prefs.theme === 'custom' ? (prefs.customTheme?.accent || '#c084fc') : 'transparent'}`,
                            background: prefs.theme === 'custom' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--ink)',
                          }}
                        >
                          <span style={{ fontSize: '18px', width: '32px', textAlign: 'center' }}>🎨</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>Design Custom Palette...</div>
                            <div style={{ fontSize: '10px', color: 'var(--subtle)' }}>Pick your own colors &amp; swatches</div>
                          </div>
                          {prefs.theme === 'custom' && <span style={{ color: prefs.customTheme?.accent || '#c084fc', fontSize: '12px' }}>✓</span>}
                        </button>
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid var(--line)',
                          paddingTop: '8px',
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: 'var(--subtle)' }}>
                          {user ? '✓ Auto-synced to cloud' : '✓ Saved locally'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsThemePickerOpen(false);
                            setIsSettingsOpen(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--green)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                        >
                          Studio Settings →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className={studyLayersActiveCount > 0 ? 'settings-active' : ''}
                onClick={() => setIsSettingsOpen(true)}
                title="Turn Strong's Concordance or Commentaries ON/OFF"
              >
                ⚙️ Settings
              </button>
              <button type="button" onClick={handleCopyShareLink}>
                {copiedNotice ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          {/* CHAPTER INTRO */}
          <div className="chapter-intro">
            <div>
              <span className="testament">
                {currentBook.testament === 'OT'
                  ? 'OLD TESTAMENT'
                  : 'NEW TESTAMENT'}
              </span>
              <h2>
                {currentBook.names.en} <span>{currentChapter}</span>
              </h2>
              <p className="chapter-subtitle">
                {activeVersionIds.length === 1
                  ? 'Single column'
                  : 'Parallel reading'}
                {currentBook.names.tw &&
                currentBook.names.tw !== currentBook.names.en
                  ? ` · ${currentBook.names.tw}`
                  : ''}
                {prefs.showStrongsInline ? ' · Strong’s ON' : ''}
                {prefs.showCommentaries ? ' · Commentaries ON' : ''}
              </p>
            </div>

            <div className="intro-actions">
              {activeVersionIds.length >= 2 && (
                <button
                  type="button"
                  className="quiet-button layout-toggle-btn"
                  onClick={() =>
                    updatePrefs({
                      layoutMode:
                        prefs.layoutMode === 'verse-by-verse-interlinear'
                          ? 'parallel-columns'
                          : 'verse-by-verse-interlinear',
                    })
                  }
                  title="Toggle between Side-by-Side Columns and Mobile-Friendly Stacked Comparison"
                >
                  {prefs.layoutMode === 'verse-by-verse-interlinear'
                    ? '⊞ Columns'
                    : '☰ Stacked'}
                </button>
              )}
              {activeVersionIds.length >= 2 && (
                <button
                  type="button"
                  className="swap-button"
                  onClick={handleSwapLanguages}
                  title={`Swap parallel languages (${activeVersionIds[0]?.toUpperCase()} ⇄ ${activeVersionIds[1]?.toUpperCase()})`}
                  aria-label="Swap parallel languages"
                >
                  <span className="swap-icon" aria-hidden="true">
                    ⇄
                  </span>
                  <span>Swap</span>
                </button>
              )}
              <button
                type="button"
                className="quiet-button"
                onClick={() => setIsLangAddonModalOpen(true)}
              >
                + Add-on Hub
              </button>
              <button
                type="button"
                className="add-column"
                onClick={() => setPickerSlot('add')}
                disabled={activeVersionIds.length >= 4}
              >
                + Add translation
              </button>
            </div>
          </div>

          {/* QUICK CONTROLS (COMPARE PRESETS & CHAPTER SEARCH) */}
          <div className="quick-controls">
            <div className="preset-row" aria-label="Comparison presets">
              <span>Compare</span>
              {activeVersionIds.length >= 2 && (
                <button
                  type="button"
                  className="preset-swap-btn"
                  onClick={handleSwapLanguages}
                  title={`Swap languages (${activeVersionIds[0]?.toUpperCase()} ⇄ ${activeVersionIds[1]?.toUpperCase()})`}
                >
                  <span style={{ fontSize: '15px', fontWeight: 800 }} aria-hidden="true">
                    ⇄
                  </span>
                  <span>Swap</span>
                </button>
              )}
              {COMPARE_PRESETS.map((preset) => {
                const isActive =
                  preset.versions.join(',') === activeVersionIds.join(',');
                return (
                  <button
                    type="button"
                    key={preset.label}
                    className={isActive ? 'active' : ''}
                    onClick={() => setActiveVersionIds(preset.versions)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <label className="chapter-search">
              <input
                type="search"
                value={chapterSearchQuery}
                onChange={(e) => setChapterSearchQuery(e.target.value)}
                placeholder="Find in this chapter"
              />
              {chapterSearchQuery && (
                <button
                  type="button"
                  onClick={() => setChapterSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </label>
          </div>

          {/* BIBLEHUB SWIPE HINT */}
          {activeVersionIds.length >= 2 && (
            <div className="biblehub-swipe-hint">
              <span>« swipe to see more →</span>
            </div>
          )}

          {/* PARALLEL COMPARISON TABLE (BIBLEHUB SCROLL-SYNCHRONIZED) */}
          <div className="biblehub-parallel-scroll-box">
            <div
              className={`comparison biblehub-sync-table cols-${activeVersionIds.length} ${prefs.layoutMode === 'verse-by-verse-interlinear' ? 'stacked-mode' : ''}`}
              style={
                {
                  '--columns': activeVersionIds.length,
                  '--reading-size': `${prefs.fontSize}px`,
                } as React.CSSProperties
              }
            >
              {/* STICKY EDITION HEADERS */}
              <div className="edition-heads">
                {/* 1. Sticky Corner Cell (Top-left above verse numbers) */}
                <div className="edition-head-corner" aria-hidden="true">
                  <span>#</span>
                </div>

                {/* 2. Translation Columns */}
                {activeVersionIds.map((vId, idx) => {
                  const verMeta =
                    allVersions.find((v) => v.id === vId) || allVersions[0];

                  return (
                    <div className="edition-head" key={`${vId}-${idx}`}>
                      <div className="edition-head-top">
                        <button
                          type="button"
                          className="edition-name-trigger"
                          onClick={() => setPickerSlot(idx)}
                          title="Click to switch translation for this column"
                        >
                          <span className="edition-code">{verMeta.shortName}</span>
                          <span className="edition-caret">▾</span>
                        </button>

                        <div className="edition-head-actions">
                          {activeVersionIds.length >= 2 && (
                            <button
                              type="button"
                              className="icon-button swap-col-btn"
                              onClick={() => handleSwapColumn(idx)}
                              title={`Swap position of ${verMeta.shortName}`}
                              aria-label={`Swap position of ${verMeta.shortName}`}
                            >
                              ⇄
                            </button>
                          )}
                          {activeVersionIds.length > 1 && (
                            <button
                              type="button"
                              className="icon-button close-col-btn"
                              onClick={() => handleRemoveColumn(idx)}
                              title={`Remove ${verMeta.name}`}
                              aria-label={`Remove ${verMeta.name}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="edition-sub-name" title={verMeta.name}>
                        {verMeta.name}
                      </div>
                    </div>
                  );
                })}

                {/* 3. Right Header: "+ Add" Button (BibleHub Style) */}
                <div className="edition-head-add">
                  <button
                    type="button"
                    className="biblehub-add-col-btn"
                    onClick={() => setPickerSlot('add')}
                    disabled={activeVersionIds.length >= 4}
                    title="Add translation column"
                  >
                    <span className="add-icon">+</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>

            {/* VERSE ROWS */}
            <div className="verse-rows">
              {filteredVerseNumbers.map((verseNumber) => {
                const verseKey = `${currentBook.id}.${currentChapter}.${verseNumber}`;
                const hl = highlights.find((h) => h.verseKey === verseKey);
                const isPinned = pins.some((p) => p.verseKey === verseKey);
                const isBookmarked = bookmarks.some(
                  (b) => b.verseKey === verseKey
                );
                const verseNotes = notes.filter(
                  (n) => n.verseKey === verseKey
                );
                const isActionOpen = activeVerseActionBar === verseNumber;
                const interlinearWords = prefs.showStrongsInline
                  ? getInterlinearForVerse(
                      currentBook.id,
                      currentChapter,
                      verseNumber
                    )
                  : undefined;
                const primaryVerseText =
                  primaryChapterData?.verses.find((v) => v.verse === verseNumber)?.text || '';

                return (
                  <div
                    className={`verse-row ${isActionOpen ? 'selected-row' : ''}`}
                    key={verseNumber}
                  >
                    {/* Sticky Left Verse Number Gutter (BibleHub Style) */}
                    <div
                      className="verse-gutter"
                      onClick={() => {
                        setSelectedVerse(verseNumber);
                        setActiveVerseActionBar((prev) => (prev === verseNumber ? null : verseNumber));
                      }}
                      title={`Verse ${verseNumber} — Click for study actions`}
                    >
                      <span className="gutter-num">{verseNumber}</span>
                      {prefs.showStudyBadges && (isPinned || isBookmarked || verseNotes.length > 0) && (
                        <span className="gutter-badge">•</span>
                      )}
                    </div>

                    {/* Translation Verse Cells */}
                    {activeVersionIds.map((vId, colIdx) => {
                      const verMeta =
                        allVersions.find((v) => v.id === vId) || allVersions[0];
                      const chData = chaptersByVersion[vId];
                      const verseObj = chData?.verses.find(
                        (v) => v.verse === verseNumber
                      );
                      const isPrimaryCol = colIdx === 0;

                      return (
                        <article
                          className={`verse-cell ${hl ? `hl-${hl.color}` : ''}`}
                          key={`${vId}-${verseNumber}`}
                          dir={verMeta.dir || 'ltr'}
                          onClick={() => {
                            setSelectedVerse(verseNumber);
                            setActiveVerseActionBar((prev) =>
                              prev === verseNumber ? null : verseNumber
                            );
                          }}
                        >
                          {prefs.showHeadings && verseObj?.heading ? (
                            <h3 className="verse-heading">{verseObj.heading}</h3>
                          ) : null}

                          <div className="verse-text-body">
                            <p
                              style={{
                                textDecoration: hl?.underline
                                  ? 'underline'
                                  : undefined,
                              }}
                            >
                              {verseObj
                                ? renderVersePieces(
                                    verseObj.pieces,
                                    verseObj.text,
                                    vId
                                  )
                                : loadingChapters
                                  ? 'Loading…'
                                  : '—'}
                            </p>
                          </div>

                          {/* Optional Strong's Interlinear Ribbon */}
                          {prefs.showStrongsInline &&
                            isPrimaryCol &&
                            interlinearWords &&
                            interlinearWords.length > 0 && (
                              <div
                                className="verse-interlinear-ribbon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {interlinearWords.map((w, wIdx) => (
                                  <button
                                    key={`${w.strongs}-${wIdx}`}
                                    type="button"
                                    className="verse-quick-btn"
                                    onClick={() => {
                                      setSelectedStrongCode(w.strongs);
                                      setIsStrongsModalOpen(true);
                                    }}
                                    title="Open Strong's Concordance Lexicon"
                                  >
                                    <strong style={{ color: 'var(--green)' }}>
                                      {w.strongs}
                                    </strong>
                                    <span>{w.original}</span>
                                    <span>({w.gloss})</span>
                                    {w.twiGloss && (
                                      <span style={{ opacity: 0.85 }}>
                                        · Twi: {w.twiGloss}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                        </article>
                      );
                    })}

                    {/* Spacer cell matching the + Add header column */}
                    <div className="verse-add-spacer" aria-hidden="true" />

                    {/* Inline Sticky Action Bar on Active Verse */}
                    {isActionOpen && (
                      <div className="verse-quick-bar-wrapper">
                        <div
                          className="verse-quick-bar"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {HIGHLIGHT_COLORS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className={`verse-quick-btn ${hl?.color === c.id ? 'active' : ''}`}
                              onClick={() =>
                                handleApplyHighlight(
                                  verseNumber,
                                  primaryVerseText,
                                  c.id
                                )
                              }
                              title={`Highlight ${c.label}`}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: c.dotColor,
                                  display: 'inline-block',
                                }}
                              />
                              {c.label}
                            </button>
                          ))}

                          <button
                            type="button"
                            className={`verse-quick-btn ${isPinned ? 'active' : ''}`}
                            onClick={() =>
                              handleTogglePin(verseNumber, primaryVerseText)
                            }
                          >
                            {isPinned ? '★ Pinned' : '☆ Pin'}
                          </button>

                          <button
                            type="button"
                            className={`verse-quick-btn ${isBookmarked ? 'active' : ''}`}
                            onClick={() =>
                              handleToggleBookmark(
                                verseNumber,
                                primaryVerseText
                              )
                            }
                          >
                            {isBookmarked ? '✓ Bookmarked' : '+ Bookmark'}
                          </button>

                          <button
                            type="button"
                            className="verse-quick-btn"
                            onClick={() => {
                              setStudyVaultTab('notes');
                              setIsStudyVaultOpen(true);
                            }}
                          >
                            ✎ Note ({verseNotes.length})
                          </button>

                          <button
                            type="button"
                            className="verse-quick-btn"
                            onClick={() => {
                              const secVerId = activeVersionIds[1];
                              const secText = secVerId
                                ? chaptersByVersion[secVerId]?.verses.find(
                                    (x) => x.verse === verseNumber
                                  )?.text
                                : undefined;
                              setVerseCardTarget({
                                verse: verseNumber,
                                primaryText: primaryVerseText,
                                secondaryText: secText,
                              });
                            }}
                          >
                            ✦ Share Card
                          </button>

                          <button
                            type="button"
                            className="verse-quick-btn"
                            style={{
                              color: '#f59e0b',
                              borderColor: 'rgba(245, 158, 11, 0.45)',
                              fontWeight: 700,
                            }}
                            onClick={() => {
                              const secVerId = activeVersionIds[1];
                              const secText = secVerId
                                ? chaptersByVersion[secVerId]?.verses.find(
                                    (x) => x.verse === verseNumber
                                  )?.text
                                : undefined;
                              setStatusStudioTarget({
                                reference: `${currentBook.names.en} ${currentChapter}:${verseNumber}`,
                                primaryText: primaryVerseText,
                                primaryVersion: primaryVersionId.toUpperCase(),
                                secondaryText: secText,
                                secondaryVersion: secVerId?.toUpperCase(),
                              });
                              setIsStatusStudioOpen(true);
                            }}
                            title="Create 10s Animated Video Status for WhatsApp, Reels & TikTok"
                          >
                            🎬 10s Video
                          </button>

                          <button
                            type="button"
                            className="verse-quick-btn"
                            style={{
                              color: '#f59e0b',
                              borderColor: 'rgba(245, 158, 11, 0.45)',
                              fontWeight: 700,
                            }}
                            onClick={() => {
                              setSelectedVerse(verseNumber);
                              setIsAskAduBibleOpen(true);
                            }}
                            title="Ask AduBible AI Exegetical Companion about this verse"
                          >
                            ✦ Ask AI
                          </button>

                          {!prefs.showStrongsInline && (
                            <button
                              type="button"
                              className="verse-quick-btn"
                              onClick={() =>
                                updatePrefs({ showStrongsInline: true })
                              }
                            >
                              Enable Strong’s
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

          {/* READING END BAR */}
          <div className="reading-end">
            <button
              type="button"
              onClick={() => handleStepChapter(-1)}
              disabled={
                currentBook.id === activeCollectionBooks[0]?.id && currentChapter <= 1
              }
            >
              ← Previous
            </button>
            <span>
              {currentBook.names.en} {currentChapter} ·{' '}
              {filteredVerseNumbers.length} verses
            </span>
            <button
              type="button"
              onClick={() => handleStepChapter(1)}
              disabled={
                currentBook.id ===
                  activeCollectionBooks[activeCollectionBooks.length - 1]?.id &&
                currentChapter >= currentBook.chapters
              }
            >
              Next →
            </button>
          </div>

          {/* FOOTNOTES & LICENSE ATTRIBUTION GRID (Matches Wisdom Bible) */}
          <div className="footnotes-grid">
            {activeVersionIds.map((vId) => {
              const verMeta =
                allVersions.find((v) => v.id === vId) || allVersions[0];
              const chData = chaptersByVersion[vId];
              const notesList = chData?.chapterFootnotes || [];
              const licText = chData?.licenseText || verMeta.copyright;
              const licUrl = chData?.licenseUrl;

              if (notesList.length === 0 && !licText) return null;

              return (
                <details className="footnotes" key={vId}>
                  <summary>
                    {verMeta.shortName} notes &amp; license
                    {notesList.length ? ` (${notesList.length})` : ''}
                  </summary>
                  {notesList.length > 0 && (
                    <ol>
                      {notesList.map((fn, idx) => (
                        <li
                          key={fn.noteId ?? idx}
                          id={`fn-${vId}-${(fn.noteId ?? idx) + 1}`}
                        >
                          {fn.reference?.chapter && fn.reference?.verse ? (
                            <strong>
                              {fn.reference.chapter}:{fn.reference.verse}{' '}
                            </strong>
                          ) : null}
                          {fn.text}
                        </li>
                      ))}
                    </ol>
                  )}
                  {licText && (
                    <p className="license-note">
                      {licText}
                      {licUrl && (
                        <a href={licUrl} target="_blank" rel="noreferrer">
                          Source &amp; license ↗
                        </a>
                      )}
                    </p>
                  )}
                </details>
              );
            })}
          </div>

          {/* SCRIPTURE IN YOUR LANGUAGE STRIP */}
          <div className="languages-strip">
            <div className="languages-head">
              <span>Scripture in your language</span>
              <p>{allLanguages.length} languages ready to compare</p>
            </div>
            <div className="languages-grid">
              {allLanguages.map((lang) => {
                const matchingVersions = allVersions.filter(
                  (v) => v.languageCode === lang.code
                );
                const defaultVer =
                  matchingVersions.find((v) => v.id === 'kjv') ||
                  matchingVersions[0] ||
                  allVersions[0];
                const isSelected = matchingVersions.some((v) =>
                  activeVersionIds.includes(v.id)
                );
                const cleanNative = lang.nativeName
                  .replace(/\s*\([^)]*\)/g, '')
                  .trim();
                const cleanEnglish = lang.name
                  .replace(/\s*\([^)]*\)/g, '')
                  .trim();
                const pillLabel =
                  cleanNative.toLowerCase() === cleanEnglish.toLowerCase()
                    ? cleanEnglish
                    : `${cleanNative} · ${cleanEnglish}`;

                return (
                  <button
                    type="button"
                    key={lang.code}
                    className={isSelected ? 'active' : ''}
                    onClick={() => {
                      if (isSelected) {
                        const activeMatch =
                          matchingVersions.find((v) =>
                            activeVersionIds.includes(v.id)
                          ) || defaultVer;
                        setActiveVersionIds([
                          activeMatch.id,
                          ...activeVersionIds.filter(
                            (id) => id !== activeMatch.id
                          ),
                        ]);
                      } else if (activeVersionIds.length < 4) {
                        setActiveVersionIds([
                          ...activeVersionIds,
                          defaultVer.id,
                        ]);
                      } else {
                        setActiveVersionIds([
                          ...activeVersionIds.slice(0, 3),
                          defaultVer.id,
                        ]);
                      }
                    }}
                  >
                    {pillLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. OPTIONAL COMMENTARY & CROSS-REFERENCE PANEL (OFF BY DEFAULT IN SETTINGS) */}
        {prefs.showCommentaries ? (
          <div style={{ marginTop: '28px' }}>
            <CommentaryPanel
              bookId={currentBook.id}
              bookName={currentBook.names.en}
              chapter={currentChapter}
              selectedVerse={selectedVerse}
              selectedVerseText={
                primaryVerses.find((v) => v.verse === selectedVerse)?.text || ''
              }
              sources={COMMENTARIES_CATALOG}
              bundledCommentaries={chapterCommentaries}
              onSelectStrongCode={(code: string) => {
                setSelectedStrongCode(code);
                setIsStrongsModalOpen(true);
              }}
              onJumpToReference={handleJumpToReferenceString}
              themeMode={prefs.theme}
            />
          </div>
        ) : null}

        {/* 5. MINIMAL FOOTER */}
        {renderSharedFooter()}
      </main>
    )}

      {/* WISDOM BIBLE COLUMN TRANSLATION PICKER DIALOG */}
      {pickerSlot !== null && (
        <div
          className="picker-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setPickerSlot(null)}
        >
          <div
            className="picker-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="picker-head">
              <div>
                <span className="eyebrow">TRANSLATION</span>
                <h3>
                  {pickerSlot === 'add'
                    ? 'Add parallel column'
                    : 'Change column'}
                </h3>
              </div>
              <button type="button" onClick={() => setPickerSlot(null)}>
                Close
              </button>
            </div>

            <input
              className="picker-search"
              type="search"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search language or version (e.g. Twi, NKJV, French, Hausa)"
              autoFocus
            />

            <div className="picker-groups">
              {groupedPickerVersions.map(([language, items]) => (
                <div className="picker-group" key={language}>
                  <div className="picker-language">{language}</div>
                  <div className="picker-options">
                    {items.map((item) => {
                      const active = activeVersionIds.includes(item.id);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          className={`picker-option ${active ? 'active' : ''}`}
                          onClick={() => handleChooseVersionForSlot(item.id)}
                          disabled={pickerSlot === 'add' && active}
                        >
                          <strong>{item.name}</strong>
                          <span>
                            {item.shortName} · {item.nativeLanguageName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL (Strong's & Commentaries OFF by default, toggleable here) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        prefs={prefs}
        onUpdatePrefs={updatePrefs}
        onOpenLanguageAddonModal={() => setIsLangAddonModalOpen(true)}
        user={user}
      />

      {/* THEME & PALETTE SYNC TOAST */}
      {themeSyncNotice && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--green)',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: 'var(--green)' }}>✦</span>
          <span>{themeSyncNotice}</span>
        </div>
      )}

      {/* AUDIO BIBLE PLAYER BAR */}
      {showAudioBar && (
        <AudioBibleBar
          bookName={`${currentBook.names.en} (${currentBook.names.tw || currentBook.names.en})`}
          chapter={currentChapter}
          versionName={
            allVersions.find((v) => v.id === primaryVersionId)?.shortName ||
            'KJV'
          }
          langCode={
            allVersions.find((v) => v.id === primaryVersionId)?.languageCode ||
            'en'
          }
          verses={primaryVerses}
          audioUrl={primaryChapterData?.audioUrl}
          parallelVerses={
            activeVersionIds[1]
              ? chaptersByVersion[activeVersionIds[1]]?.verses
              : undefined
          }
          parallelVersionName={
            activeVersionIds[1]
              ? allVersions.find((v) => v.id === activeVersionIds[1])?.shortName
              : undefined
          }
          parallelLangCode={
            activeVersionIds[1]
              ? allVersions.find((v) => v.id === activeVersionIds[1])
                  ?.languageCode
              : undefined
          }
          activeVerse={selectedVerse}
          onVerseChange={(v: number) => setSelectedVerse(v)}
          onClose={() => setShowAudioBar(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* CANONICAL & SCRIPTURE SELECTOR MODAL */}
      <BookChapterSelectorModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        books={allHistoricalBooks}
        currentBookId={currentBook.id}
        currentChapter={currentChapter}
        uiLanguageCode="en"
        initialTestamentFilter={bookPickerTab}
        onSelectBookChapter={handleSelectBookChapter}
      />

      {/* LANGUAGE & CUSTOM ADD-ON MODAL */}
      <LanguageAddonModal
        isOpen={isLangAddonModalOpen}
        onClose={() => setIsLangAddonModalOpen(false)}
        languages={allLanguages}
        allVersions={allVersions}
        activeVersionIds={activeVersionIds}
        customAddons={customAddons}
        onToggleVersionInParallel={handleToggleVersionInParallel}
        onSaveCustomAddon={async (addon: CustomBibleAddon) => {
          await saveCustomAddon(addon);
          const updated = await loadAllCustomAddons();
          setCustomAddons(updated);
          handleToggleVersionInParallel(addon.id);
        }}
        onDeleteCustomAddon={async (addonId: string) => {
          await deleteCustomAddon(addonId);
          const updated = await loadAllCustomAddons();
          setCustomAddons(updated);
          setActiveVersionIds((prev) => prev.filter((id) => id !== addonId));
        }}
        books={canonicalBooks}
        currentBookId={currentBook.id}
        currentChapter={currentChapter}
      />

      {/* STRONG'S CONCORDANCE POPOVER MODAL */}
      <StrongsPopoverModal
        isOpen={isStrongsModalOpen}
        onClose={() => setIsStrongsModalOpen(false)}
        selectedEntry={selectedStrongsEntry}
        allEntries={STRONGS_DICTIONARY}
        onSelectEntry={(code: string) => setSelectedStrongCode(code)}
        onNavigateReference={handleJumpToReferenceString}
      />

      {/* PERSONAL STUDY VAULT DRAWER (Bookmarks, Pins, Highlights, Notes) */}
      <StudyVaultDrawer
        isOpen={isStudyVaultOpen}
        onClose={() => setIsStudyVaultOpen(false)}
        initialTab={studyVaultTab}
        pins={pins}
        highlights={highlights}
        bookmarks={bookmarks}
        notes={notes}
        currentBookId={currentBook.id}
        currentBookSlug={currentBook.slug}
        currentChapter={currentChapter}
        currentVersionId={primaryVersionId}
        onJumpToVerse={(bookSlug: string, ch: number, v: number) => {
          setCurrentBookSlug(bookSlug);
          setCurrentChapter(ch);
          setSelectedVerse(v);
        }}
        onRemovePin={(id: string) => {
          const next = pins.filter((p) => p.id !== id);
          setPins(next);
          savePins(next);
          syncToCloudIfSignedIn(highlights, bookmarks, next, notes, prefs);
        }}
        onRemoveHighlight={(id: string) => {
          const next = highlights.filter((h) => h.id !== id);
          setHighlights(next);
          saveHighlights(next);
          syncToCloudIfSignedIn(next, bookmarks, pins, notes, prefs);
        }}
        onRemoveBookmark={(id: string) => {
          const next = bookmarks.filter((b) => b.id !== id);
          setBookmarks(next);
          saveBookmarks(next);
          syncToCloudIfSignedIn(highlights, next, pins, notes, prefs);
        }}
        onSaveNote={handleSaveNote}
        onRemoveNote={(id: string) => {
          const next = notes.filter((n) => n.id !== id);
          setNotes(next);
          saveNotes(next);
          syncToCloudIfSignedIn(highlights, bookmarks, pins, next, prefs);
        }}
      />

      {/* AUTH & CLOUD SYNC MODAL */}
      <AuthSyncModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUserChange={setUser}
        highlights={highlights}
        bookmarks={bookmarks}
        pins={pins}
        notes={notes}
        onForceSync={async () => {
          if (user) {
            await syncToCloudIfSignedIn();
          }
        }}
      />

      {/* VERSE ART CARD STUDIO MODAL */}
      {verseCardTarget && (
        <VerseCardStudioModal
          isOpen={Boolean(verseCardTarget)}
          onClose={() => setVerseCardTarget(null)}
          reference={`${currentBook.names.en} ${currentChapter}:${verseCardTarget.verse}`}
          primaryText={verseCardTarget.primaryText}
          secondaryText={verseCardTarget.secondaryText}
          primaryVersionName={primaryVersionId.toUpperCase()}
          secondaryVersionName={activeVersionIds[1]?.toUpperCase()}
          onOpenVideoStudio={() => {
            if (verseCardTarget) {
              setStatusStudioTarget({
                reference: `${currentBook.names.en} ${currentChapter}:${verseCardTarget.verse}`,
                primaryText: verseCardTarget.primaryText,
                primaryVersion: primaryVersionId.toUpperCase(),
                secondaryText: verseCardTarget.secondaryText,
                secondaryVersion: activeVersionIds[1]?.toUpperCase(),
              });
              setIsStatusStudioOpen(true);
            }
          }}
        />
      )}

      {/* 10s ANIMATED SCRIPTURE STATUS VIDEO STUDIO MODAL */}
      <AnimatedStatusStudioModal
        isOpen={isStatusStudioOpen}
        onClose={() => {
          setIsStatusStudioOpen(false);
          setStatusStudioTarget(null);
        }}
        initialReference={statusStudioTarget?.reference || `${currentBook.names.en} ${currentChapter}:1`}
        initialText={
          statusStudioTarget?.primaryText ||
          chaptersByVersion[primaryVersionId]?.verses[0]?.text ||
          'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.'
        }
        initialVersionName={statusStudioTarget?.primaryVersion || primaryVersionId.toUpperCase()}
        initialSecondaryText={statusStudioTarget?.secondaryText}
        initialSecondaryVersionName={statusStudioTarget?.secondaryVersion}
        langCode={currentBook.slug === 'twi' || primaryVersionId.includes('twi') ? 'ak' : 'en'}
      />

      {/* LEGAL & INSTITUTIONAL PAGES MODAL */}
      <LegalInstitutionalModal
        isOpen={legalModalState.open}
        initialPage={legalModalState.page}
        onClose={() => setLegalModalState((prev) => ({ ...prev, open: false }))}
      />

      {/* ASK ADUBIBLE AI EXEGESIS COMPANION MODAL */}
      <AskAduBibleModal
        isOpen={isAskAduBibleOpen}
        onClose={() => setIsAskAduBibleOpen(false)}
        context={askAduBibleContext}
        onNavigateToVerse={(slug, ch, v) => {
          handleSelectBookChapter(slug, ch);
          if (v) setSelectedVerse(v);
        }}
        onSaveToVaultNotes={(title, noteBody) => {
          const newNote: VerseNote = {
            id: `note-${Date.now()}`,
            verseKey: `${currentBook.slug.toUpperCase()}.${currentChapter}.${selectedVerse || 1}`,
            bookId: currentBook.id,
            bookSlug: currentBook.slug,
            chapter: currentChapter,
            verse: selectedVerse || 1,
            versionId: activeVersionIds[0] || 'kjv',
            verseText: '',
            title: title,
            body: noteBody,
            tags: ['study'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          handleSaveNote(newNote);
        }}
      />

      {/* MOBILE BOTTOM THUMB NAVIGATION DOCK */}
      <MobileBottomDock
        onOpenBooks={() => setIsBookModalOpen(true)}
        onOpenSearch={() => setIsMobileSearchOpen(true)}
        onToggleAudio={() => setShowAudioBar((prev) => !prev)}
        isAudioActive={showAudioBar}
        onSwapLanguages={handleSwapLanguages}
        canSwap={activeVersionIds.length >= 2}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenVault={() => {
          setStudyVaultTab('pins');
          setIsStudyVaultOpen(true);
        }}
        vaultCount={totalVaultCount}
        currentBookName={currentBook.names.en}
        currentChapter={currentChapter}
      />

      {/* MOBILE SEARCH OVERLAY MODAL */}
      {isMobileSearchOpen && (
        <div
          className="mobile-search-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsMobileSearchOpen(false)}
        >
          <div
            className="mobile-search-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <OmniSearchBar
              books={allHistoricalBooks}
              currentBookSlug={currentBook.slug}
              currentChapter={currentChapter}
              onNavigate={(slug, ch, v) => {
                handleSelectBookChapter(slug, ch);
                if (v) setSelectedVerse(v);
                setIsMobileSearchOpen(false);
              }}
              onCloseMobile={() => setIsMobileSearchOpen(false)}
              isOpenMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
