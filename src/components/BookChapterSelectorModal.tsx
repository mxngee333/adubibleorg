import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  ChevronRight,
  Compass,
  Loader2,
  Quote,
  ArrowRight,
  Clock,
  Trash2,
  Cloud,
} from 'lucide-react';
import { BibleBook } from '../types/bible';
import { parsePassageQuery, findBookByQuery, ParsedPassage } from '../services/passageService';
import { searchScripture, BibleSearchResult } from '../services/scriptureSearchService';
import {
  ReadingHistoryEntry,
  getReadingHistory,
  recordReadingHistory,
  clearReadingHistory,
  deleteReadingHistoryItem,
} from '../services/studyVaultService';

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Recently';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 45) return 'Just now';
  if (elapsedSeconds < 3600) {
    const mins = Math.floor(elapsedSeconds / 60);
    return `${mins}m ago`;
  }
  if (elapsedSeconds < 86400) {
    const hours = Math.floor(elapsedSeconds / 3600);
    return `${hours}h ago`;
  }
  if (elapsedSeconds < 604800) {
    const days = Math.floor(elapsedSeconds / 86400);
    return `${days}d ago`;
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

interface BookChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BibleBook[];
  currentBookId: string;
  currentChapter: number;
  uiLanguageCode: string;
  initialTestamentFilter?: 'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD' | 'HISTORY';
  activeVersionId?: string;
  onSelectBookChapter: (bookSlug: string, chapter: number, targetVerse?: number) => void;
}

export const BookChapterSelectorModal: React.FC<BookChapterSelectorModalProps> = ({
  isOpen,
  onClose,
  books,
  currentBookId,
  currentChapter,
  uiLanguageCode,
  initialTestamentFilter,
  activeVersionId = 'nkjv',
  onSelectBookChapter,
}) => {
  const [testamentFilter, setTestamentFilter] = useState<
    'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD' | 'HISTORY'
  >('CANONICAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(
    () => books.find((b) => b.id === currentBookId) || books[0] || null
  );
  const [step, setStep] = useState<'books' | 'chapters'>('books');
  const [liveVerses, setLiveVerses] = useState<BibleSearchResult[]>([]);
  const [isSearchingScripture, setIsSearchingScripture] = useState(false);
  const [historyList, setHistoryList] = useState<ReadingHistoryEntry[]>(() => getReadingHistory());
  const [clearingHistory, setClearingHistory] = useState<boolean>(false);

  // Real-time listener for reading and search history updates
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setHistoryList(getReadingHistory());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('adubible_history_updated', handleHistoryUpdate);
      return () => {
        window.removeEventListener('adubible_history_updated', handleHistoryUpdate);
      };
    }
  }, []);

  // 1. Universal Scripture Reference Parser (handles "Psalm 3:3", "psalm 3 3", "psam 3;3", "1 cor 13 4", "psalm 3", etc.)
  const parsedPassage: ParsedPassage | null = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return parsePassageQuery(searchQuery, books);
  }, [searchQuery, books]);

  // 1b. Real-time Filtered History (Recent comes first)
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return historyList;
    const q = searchQuery.toLowerCase().trim();
    return historyList.filter((item) => {
      const bName = (item.bookName || '').toLowerCase();
      const bSlug = (item.bookSlug || '').toLowerCase();
      const vText = (item.verseText || '').toLowerCase();
      const query = (item.query || '').toLowerCase();
      const vTag = (item.version || '').toLowerCase();
      const ref = `${item.bookName || ''} ${item.chapter || ''}${item.verse ? `:${item.verse}` : ''}`.toLowerCase();
      return (
        bName.includes(q) ||
        bSlug.includes(q) ||
        vText.includes(q) ||
        query.includes(q) ||
        vTag.includes(q) ||
        ref.includes(q)
      );
    });
  }, [historyList, searchQuery]);

  // Keep selectedBook synced when user types a valid passage query
  useEffect(() => {
    if (parsedPassage?.book) {
      setSelectedBook(parsedPassage.book);
    }
  }, [parsedPassage]);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setHistoryList(getReadingHistory());
      const cur = books.find((b) => b.id === currentBookId);
      if (initialTestamentFilter === 'HISTORY') {
        setTestamentFilter('HISTORY');
      } else if (cur?.testament === 'DC') {
        setTestamentFilter('DC');
      } else if (cur?.testament === 'PSEUD') {
        setTestamentFilter('PSEUD');
      } else if (initialTestamentFilter) {
        setTestamentFilter(initialTestamentFilter);
      } else if (cur?.testament === 'OT') {
        setTestamentFilter('OT');
      } else if (cur?.testament === 'NT') {
        setTestamentFilter('NT');
      } else {
        setTestamentFilter('CANONICAL');
      }
      if (cur) setSelectedBook(cur);
      setStep('books');
      setSearchQuery('');
      setLiveVerses([]);
      setIsSearchingScripture(false);
    }
  }, [isOpen, currentBookId, books, initialTestamentFilter]);

  // 2. Full-Text Scripture & Verse Search for longer or multi-word queries ("more text")
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2 || /^\d+$/.test(trimmed)) {
      setLiveVerses([]);
      setIsSearchingScripture(false);
      return;
    }

    setIsSearchingScripture(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchScripture(trimmed, {
          versionId: activeVersionId || 'nkjv',
          limit: 10,
        });
        setLiveVerses(results);
      } catch {
        setLiveVerses([]);
      } finally {
        setIsSearchingScripture(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, activeVersionId]);

  const filteredBooks = useMemo(() => {
    const rawQ = searchQuery.trim().toLowerCase();
    if (!rawQ) {
      return books.filter((b) => {
        if (testamentFilter === 'ALL') return true;
        if (testamentFilter === 'CANONICAL') return b.testament === 'OT' || b.testament === 'NT';
        return b.testament === testamentFilter;
      });
    }

    const matchedBook = parsedPassage?.book || findBookByQuery(rawQ, books);

    // Clean query text for fuzzy book name matching: strip chapter/verse numbers and punctuation
    // e.g. "psalm 3:3" -> "psalm", "1 cor 13 4" -> "1 cor"
    const bookNameQuery = rawQ
      .replace(/[:;,\.\s\-]\s*\d+.*$/, '')
      .replace(/\s+\d+.*$/, '')
      .trim();

    return books
      .filter((b) => {
        // If a specific passage was parsed, ALWAYS include that book!
        if (matchedBook && b.id === matchedBook.id) {
          return true;
        }

        const enName = (b.names.en || '').toLowerCase();
        const twName = (b.names.tw || '').toLowerCase();
        const localName = (b.names[uiLanguageCode] || '').toLowerCase();
        const slug = b.slug.toLowerCase();
        const id = b.id.toLowerCase();
        const abbrev = (b.abbreviation || '').toLowerCase();

        const matchesText =
          enName.includes(rawQ) ||
          twName.includes(rawQ) ||
          localName.includes(rawQ) ||
          slug.includes(rawQ) ||
          id.includes(rawQ) ||
          abbrev.includes(rawQ) ||
          (bookNameQuery.length >= 2 &&
            (enName.includes(bookNameQuery) ||
              twName.includes(bookNameQuery) ||
              localName.includes(bookNameQuery) ||
              slug.includes(bookNameQuery) ||
              id.includes(bookNameQuery) ||
              abbrev.includes(bookNameQuery)));

        if (!matchesText) return false;

        // When user explicitly searches, don't hide books behind testament tabs,
        // unless they are on CANONICAL and the book is Apocrypha/Deuterocanon
        if (testamentFilter === 'CANONICAL') {
          if (b.testament !== 'OT' && b.testament !== 'NT') {
            return matchedBook?.id === b.id;
          }
          return true;
        }
        if (testamentFilter !== 'ALL' && b.testament !== testamentFilter) {
          return matchedBook?.id === b.id;
        }
        return true;
      })
      .sort((a, b) => {
        // Exact matched book stays at the top of results
        if (matchedBook) {
          if (a.id === matchedBook.id) return -1;
          if (b.id === matchedBook.id) return 1;
        }
        return 0;
      });
  }, [books, testamentFilter, searchQuery, uiLanguageCode, parsedPassage]);

  if (!isOpen) return null;

  const activeBook = selectedBook || books.find((b) => b.id === currentBookId) || books[0];

  const getHeaderMeta = () => {
    switch (testamentFilter) {
      case 'DC':
        return {
          title: '📜 Deuterocanonical Scriptures (16 Books)',
          desc: 'Catholic & Orthodox Historical Canon · Tobit, Judith, 1–2 Maccabees, Wisdom, Sirach, Baruch',
        };
      case 'PSEUD':
        return {
          title: '🏺 Ancient Apocrypha & Sacred Pseudepigrapha (25 Books)',
          desc: '1 Enoch, Jubilees, Book of Jasher, 2 Esdras, Patriarchs, Didache, Shepherd of Hermas',
        };
      case 'OT':
        return {
          title: '📜 Old Testament (39 Books)',
          desc: 'Torah, Historical Books, Wisdom Poetry & Prophetic Scriptures',
        };
      case 'NT':
        return {
          title: '✝️ New Testament (27 Books)',
          desc: 'Four Gospels, Acts, Epistles of Paul & Apostolic Letters, Revelation',
        };
      case 'ALL':
        return {
          title: '👑 Complete 107 Holy Scriptures Library',
          desc: 'Accepted Canon (66) + Deuterocanon (16) + Ancient Apocrypha (25)',
        };
      case 'HISTORY':
        return {
          title: '🕒 Scripture Search & Reading History',
          desc: 'Recent scripture searches & visited passages (Newest first) · Synced to LocalStorage & R2 Cloud Vault',
        };
      default:
        return {
          title: 'Holy Bible · 66 Canonical Books Navigator',
          desc: 'Old Testament (39 Books) · New Testament (27 Books) · Accepted Scripture',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-6">
      <div className="relative flex flex-col w-full max-w-4xl h-[88dvh] max-h-[88dvh] sm:h-[84vh] rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-5 py-3 sm:py-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--soft)] border border-[var(--line)] text-[var(--green)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[var(--ink)] truncate">
                {headerMeta.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--subtle)] truncate">
                {headerMeta.desc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)] transition shrink-0 ml-2"
            aria-label="Close Navigator"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-5 py-2.5 sm:py-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setTestamentFilter('CANONICAL');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                testamentFilter === 'CANONICAL'
                  ? 'bg-[var(--green)] text-[var(--paper)]'
                  : 'bg-[var(--soft)] text-[var(--ink)] hover:opacity-80'
              }`}
              title="66 Accepted Canonical Books (OT 39 + NT 27)"
            >
              Canon (66)
            </button>
            <button
              onClick={() => {
                setTestamentFilter('OT');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                testamentFilter === 'OT'
                  ? 'bg-[var(--green)] text-[var(--paper)]'
                  : 'bg-[var(--soft)] text-[var(--ink)] hover:opacity-80'
              }`}
            >
              Old Testament (39)
            </button>
            <button
              onClick={() => {
                setTestamentFilter('NT');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                testamentFilter === 'NT'
                  ? 'bg-[var(--green)] text-[var(--paper)]'
                  : 'bg-[var(--soft)] text-[var(--ink)] hover:opacity-80'
              }`}
            >
              New Testament (27)
            </button>
            <button
              onClick={() => {
                setTestamentFilter('DC');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                testamentFilter === 'DC'
                  ? 'bg-[var(--green)] text-[var(--paper)]'
                  : 'bg-[var(--soft)] text-[var(--ink)] hover:opacity-80'
              }`}
              title="16 Deuterocanonical Books (Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch...)"
            >
              📜 Deuterocanon (16)
            </button>
            <button
              onClick={() => {
                setTestamentFilter('PSEUD');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                testamentFilter === 'PSEUD'
                  ? 'bg-[var(--green)] text-[var(--paper)]'
                  : 'bg-[var(--soft)] text-[var(--ink)] hover:opacity-80'
              }`}
              title="25 Apocrypha Books (1 Enoch, Jubilees, Book of Jasher, 2 Esdras, Patriarchs...)"
            >
              🏺 Apocrypha (25)
            </button>
            <button
              onClick={() => {
                setTestamentFilter('ALL');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                testamentFilter === 'ALL'
                  ? 'bg-[var(--green)] text-[var(--paper)]'
                  : 'bg-[var(--soft)] text-[var(--ink)] hover:opacity-80'
              }`}
              title="View all 107 Holy Scriptures"
            >
              All (107)
            </button>
            <button
              type="button"
              onClick={() => {
                setTestamentFilter('HISTORY');
                setStep('books');
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                testamentFilter === 'HISTORY'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-[var(--soft)] text-amber-300 hover:opacity-85 border border-amber-500/30'
              }`}
              title="Recent Scripture Search & Reading History (LocalStorage & R2 Synced)"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>History</span>
              {historyList.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    testamentFilter === 'HISTORY'
                      ? 'bg-stone-950 text-amber-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {historyList.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--subtle)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setStep('books');
                const p = parsePassageQuery(val, books);
                if (p?.book) {
                  setSelectedBook(p.book);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (parsedPassage) {
                    recordReadingHistory({
                      bookSlug: parsedPassage.book.slug,
                      bookName:
                        uiLanguageCode !== 'en' && parsedPassage.book.names[uiLanguageCode]
                          ? parsedPassage.book.names[uiLanguageCode]
                          : parsedPassage.book.names.en,
                      chapter: parsedPassage.chapter,
                      verse: parsedPassage.verse,
                      testament: parsedPassage.book.testament,
                      category: parsedPassage.book.category,
                      version: (activeVersionId || 'nkjv').toUpperCase(),
                      source: 'search',
                      query: searchQuery.trim() || undefined,
                    });
                    onSelectBookChapter(
                      parsedPassage.book.slug,
                      parsedPassage.chapter,
                      parsedPassage.verse
                    );
                    onClose();
                  } else if (liveVerses.length > 0) {
                    const first = liveVerses[0];
                    recordReadingHistory({
                      bookSlug: first.bookSlug,
                      bookName: first.reference.replace(/\s+\d+.*$/, '') || first.bookSlug,
                      chapter: first.chapter,
                      verse: first.verse,
                      verseText: first.text,
                      category: first.category,
                      version: (activeVersionId || 'nkjv').toUpperCase(),
                      source: 'search',
                      query: searchQuery.trim() || undefined,
                    });
                    onSelectBookChapter(first.bookSlug, first.chapter, first.verse);
                    onClose();
                  } else if (filteredBooks.length === 1) {
                    setSelectedBook(filteredBooks[0]);
                    setStep('chapters');
                  }
                }
              }}
              placeholder={
                testamentFilter === 'HISTORY'
                  ? 'Filter scripture search & reading history...'
                  : 'Search book, passage, or verse text (e.g. Psalm 3:3, peace)...'
              }
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] pl-9 pr-8 py-2 text-sm sm:text-xs text-[var(--ink)] placeholder-[var(--subtle)] focus:border-[var(--green)] focus:outline-none min-h-[38px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStep('books');
                  setLiveVerses([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--subtle)] hover:text-[var(--ink)] transition"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Smart Direct Scripture Jump Card (for queries like Psalm 3:3, psalm 3 3, psam 3;3, John 3 16, etc.) */}
        {parsedPassage && (
          <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--soft)] via-[var(--surface)] to-[var(--soft)] px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 transition shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--green)] text-[var(--paper)] font-bold text-xs shadow-sm">
                📖
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[var(--green)]">
                  {parsedPassage.verse ? 'Direct Scripture Jump' : 'Direct Chapter Jump'}
                </div>
                <div className="text-sm font-bold text-[var(--ink)] truncate">
                  {uiLanguageCode !== 'en' && parsedPassage.book.names[uiLanguageCode]
                    ? parsedPassage.book.names[uiLanguageCode]
                    : parsedPassage.book.names.en}{' '}
                  {parsedPassage.chapter}
                  {parsedPassage.verse ? `:${parsedPassage.verse}` : ''}
                  {parsedPassage.endVerse ? `–${parsedPassage.endVerse}` : ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                recordReadingHistory({
                  bookSlug: parsedPassage.book.slug,
                  bookName:
                    uiLanguageCode !== 'en' && parsedPassage.book.names[uiLanguageCode]
                      ? parsedPassage.book.names[uiLanguageCode]
                      : parsedPassage.book.names.en,
                  chapter: parsedPassage.chapter,
                  verse: parsedPassage.verse,
                  testament: parsedPassage.book.testament,
                  category: parsedPassage.book.category,
                  version: (activeVersionId || 'nkjv').toUpperCase(),
                  source: 'search',
                  query: searchQuery.trim() || undefined,
                });
                onSelectBookChapter(
                  parsedPassage.book.slug,
                  parsedPassage.chapter,
                  parsedPassage.verse
                );
                onClose();
              }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--green)] text-[var(--paper)] font-bold text-xs shadow hover:opacity-90 transition cursor-pointer"
            >
              <span>Go to Passage</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Mobile Step Toggle */}
        {testamentFilter !== 'HISTORY' && (
          <div className="flex md:hidden border-b border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs shrink-0 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setStep('books')}
                className={`font-bold transition ${step === 'books' ? 'text-[var(--green)] underline underline-offset-4' : 'text-[var(--subtle)]'}`}
              >
                1. {searchQuery ? 'Results' : 'Select Book'} ({uiLanguageCode !== 'en' && activeBook?.names[uiLanguageCode] ? activeBook.names[uiLanguageCode] : activeBook?.names.en})
              </button>
              <ChevronRight className="h-4 w-4 mx-1.5 text-[var(--subtle)]" />
              <button
                onClick={() => setStep('chapters')}
                className={`font-bold transition ${step === 'chapters' ? 'text-[var(--green)] underline underline-offset-4' : 'text-[var(--subtle)]'}`}
              >
                2. Select Chapter ({activeBook?.chapters || 0} Ch)
              </button>
            </div>
            {searchQuery && (
              <span className="text-[10px] font-mono text-[var(--subtle)]">
                {filteredBooks.length + liveVerses.length} found
              </span>
            )}
          </div>
        )}

        {/* Content Deck: History Deck OR Regular Books & Chapters Split View */}
        {testamentFilter === 'HISTORY' ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto p-3 sm:p-5">
            {/* History Control & Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-[var(--line)] shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[var(--ink)]">
                  {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
                  {searchQuery && ` (filtered from ${historyList.length})`}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LocalStorage (0ms)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                  <Cloud className="h-3 w-3" />
                  R2 Cloud Vault Synced
                </span>
              </div>

              {historyList.length > 0 && (
                <div className="flex items-center gap-2">
                  {clearingHistory ? (
                    <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-red-300 font-semibold text-[11px]">Clear all?</span>
                      <button
                        type="button"
                        onClick={() => {
                          clearReadingHistory();
                          setHistoryList([]);
                          setClearingHistory(false);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        Yes, Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setClearingHistory(false)}
                        className="px-2 py-0.5 rounded-lg bg-[var(--soft)] text-[var(--subtle)] hover:text-[var(--ink)] text-[11px] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setClearingHistory(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs text-[var(--subtle)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer"
                      title="Clear all scripture search & reading history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear All History</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* History Cards List - RECENT FIRST */}
            {filteredHistory.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {filteredHistory.map((item) => {
                  const itemKey =
                    item.id ||
                    `${item.bookSlug}_${item.chapter}_${item.verse || 0}_${item.timestamp}`;
                  return (
                    <div
                      key={itemKey}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-amber-400/50 hover:bg-[var(--soft)] transition shadow-sm"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                            item.source === 'search'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-[var(--green)]/15 text-[var(--green)] border border-[var(--green)]/30'
                          }`}
                        >
                          {item.source === 'search' ? (
                            <Search className="h-4 w-4" />
                          ) : (
                            <BookOpen className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-sm sm:text-base text-[var(--ink)]">
                              {item.bookName} {item.chapter}
                              {item.verse ? `:${item.verse}` : ''}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                item.source === 'search'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : 'bg-[var(--green)]/20 text-[var(--green)] border border-[var(--green)]/30'
                              }`}
                            >
                              {item.source === 'search' ? 'Search' : 'Visited'}
                            </span>
                            {item.version && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--soft)] text-[var(--subtle)] border border-[var(--line)]">
                                {item.version}
                              </span>
                            )}
                            {item.testament === 'DC' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30">
                                📜 Deuterocanon
                              </span>
                            )}
                            {item.testament === 'PSEUD' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30">
                                🏺 Apocrypha
                              </span>
                            )}
                            {item.testament === 'OT' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--soft)] text-[var(--subtle)]">
                                OT
                              </span>
                            )}
                            {item.testament === 'NT' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--soft)] text-[var(--subtle)]">
                                NT
                              </span>
                            )}
                          </div>

                          {item.query && (
                            <div className="text-xs text-amber-300/90 mt-1 font-mono flex items-center gap-1">
                              <span className="text-[10px] uppercase font-bold text-amber-400/70">
                                Searched:
                              </span>
                              <span>"{item.query}"</span>
                            </div>
                          )}

                          {item.verseText && (
                            <div className="text-xs text-[var(--subtle)] italic line-clamp-2 mt-1 leading-relaxed">
                              "{item.verseText}"
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--subtle)]">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{formatRelativeTime(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBookChapter(item.bookSlug, item.chapter, item.verse);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--green)] hover:opacity-90 text-[var(--paper)] font-bold text-xs shadow transition cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteReadingHistoryItem(itemKey);
                            setHistoryList(getReadingHistory());
                          }}
                          className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          title="Remove from history"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-4 text-center my-auto flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-2xl mb-3 text-amber-400">
                  <Clock className="h-7 w-7" />
                </div>
                <div className="text-base font-bold text-[var(--ink)]">
                  {searchQuery ? 'No Matching History Found' : 'No Scripture Searches or Visits Yet'}
                </div>
                <p className="text-xs text-[var(--subtle)] mt-1.5 max-w-md leading-relaxed">
                  {searchQuery
                    ? `No recent searches or passages match "${searchQuery}". Try clearing the search box above.`
                    : 'Your scripture searches, passage visits, and book navigations are instantly saved locally (0ms offline) and backed up to your R2 Cloud Vault.'}
                </p>

                <div className="mt-6 w-full max-w-lg">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                    ⚡ Quick Launch Flagship Passages:
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                      { name: 'Genesis 1', slug: 'genesis', ch: 1 },
                      { name: 'Psalm 23', slug: 'psalms', ch: 23 },
                      { name: 'John 1', slug: 'john', ch: 1 },
                      { name: 'Ephesians 1', slug: 'ephesians', ch: 1 },
                      { name: 'Wisdom 3', slug: 'wisdom-of-solomon', ch: 3 },
                      { name: 'Sirach 2', slug: 'sirach', ch: 2 },
                      { name: 'Tobit 4', slug: 'tobit', ch: 4 },
                      { name: '1 Enoch 1', slug: '1-enoch', ch: 1 },
                      { name: 'Psalm 151', slug: 'psalm-151', ch: 1 },
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          recordReadingHistory({
                            bookSlug: p.slug,
                            bookName: p.name.split(' ')[0],
                            chapter: p.ch,
                            version: (activeVersionId || 'nkjv').toUpperCase(),
                            source: 'navigator',
                          });
                          onSelectBookChapter(p.slug, p.ch);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-amber-400 hover:bg-[var(--soft)] text-xs font-semibold text-[var(--ink)] transition flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] text-amber-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Split Content with resilient min-h-0 flex-1 scrolling */
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Books & Scripture Verses Column */}
          <div
            className={`w-full md:w-3/5 border-r border-[var(--line)] overflow-y-auto p-3 sm:p-4 flex flex-col gap-3.5 ${
              step === 'chapters' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Live Scripture Verses Matching Text Query */}
            {liveVerses.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--green)] uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <Quote className="h-3.5 w-3.5" />
                    Scripture Verses ({liveVerses.length})
                  </span>
                  <span className="text-[10px] text-[var(--subtle)] font-mono">1-tap to jump</span>
                </div>
                <div className="flex flex-col gap-2">
                  {liveVerses.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        recordReadingHistory({
                          bookSlug: v.bookSlug,
                          bookName: v.reference.replace(/\s+\d+.*$/, '') || v.bookSlug,
                          chapter: v.chapter,
                          verse: v.verse,
                          verseText: v.text,
                          category: v.category,
                          version: (activeVersionId || 'nkjv').toUpperCase(),
                          source: 'search',
                          query: searchQuery.trim() || undefined,
                        });
                        onSelectBookChapter(v.bookSlug, v.chapter, v.verse);
                        onClose();
                      }}
                      className="flex flex-col text-left rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 hover:border-[var(--green)] hover:bg-[var(--soft)] transition group cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--green)] transition flex items-center gap-1.5 truncate">
                          <BookOpen className="h-3.5 w-3.5 text-[var(--green)] shrink-0" />
                          <span className="truncate">{v.reference}</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--soft)] text-[var(--subtle)] border border-[var(--line)]">
                            {v.category}
                          </span>
                          <span className="text-xs font-bold text-[var(--green)] flex items-center gap-0.5">
                            Jump <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                      {v.snippetHtml ? (
                        <div
                          className="text-xs text-[var(--subtle)] leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: v.snippetHtml }}
                        />
                      ) : (
                        <div className="text-xs text-[var(--subtle)] line-clamp-2 leading-relaxed">
                          {v.text}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Searching indicator */}
            {isSearchingScripture && (
              <div className="py-2.5 px-3 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs text-[var(--subtle)] flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--green)]" />
                <span>Searching Scripture full-text for "{searchQuery}"...</span>
              </div>
            )}

            {/* Books Matching Filter */}
            {filteredBooks.length > 0 && (
              <div className="flex flex-col gap-2">
                {searchQuery && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--green)] uppercase tracking-wider px-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Scripture Books ({filteredBooks.length})
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredBooks.map((book) => {
                    const isSelected = activeBook?.id === book.id;
                    const isTargetBook = parsedPassage?.book.id === book.id;
                    return (
                      <button
                        key={book.id}
                        onClick={() => {
                          setSelectedBook(book);
                          setStep('chapters');
                        }}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                          isTargetBook
                            ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--ink)] shadow-md ring-1 ring-[var(--green)]'
                            : isSelected
                            ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--ink)] shadow'
                            : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--green)] hover:bg-[var(--soft)]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold rounded bg-[var(--soft)] px-1.5 py-0.5 text-[var(--green)] border border-[var(--line)]">
                              {book.number}
                            </span>
                            <span className="font-bold text-sm truncate">
                              {uiLanguageCode !== 'en' && book.names[uiLanguageCode]
                                ? book.names[uiLanguageCode]
                                : book.names.en}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--subtle)] truncate mt-0.5">
                            {uiLanguageCode !== 'en' && book.names[uiLanguageCode]
                              ? `${book.names.en} • ${book.chapters} ch`
                              : `${book.category} • ${book.chapters} ch`}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-lg bg-[var(--soft)] px-2 py-1 text-[11px] font-mono text-[var(--subtle)] border border-[var(--line)]">
                          {book.chapters} ch
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredBooks.length === 0 && liveVerses.length === 0 && !isSearchingScripture && (
              <div className="col-span-full py-10 px-4 text-center my-auto">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--soft)] flex items-center justify-center text-xl mb-3 text-[var(--subtle)]">
                  🔍
                </div>
                <div className="text-sm font-bold text-[var(--ink)]">No scripture books or verses found</div>
                <div className="text-xs text-[var(--subtle)] mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Try searching for book names, chapters, verses, or keywords like{' '}
                  <span className="text-[var(--green)] font-semibold">Psalm 3:3</span>,{' '}
                  <span className="text-[var(--green)] font-semibold">John 3:16</span>,{' '}
                  <span className="text-[var(--green)] font-semibold">peace</span>, or{' '}
                  <span className="text-[var(--green)] font-semibold">faith</span>.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTestamentFilter('CANONICAL');
                    setLiveVerses([]);
                  }}
                  className="mt-3.5 px-3.5 py-1.5 rounded-lg bg-[var(--soft)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:border-[var(--green)] transition cursor-pointer"
                >
                  Clear Search &amp; Show Canonical Books (66)
                </button>
              </div>
            )}
          </div>

          {/* Chapters Grid Column */}
          <div
            className={`w-full md:w-2/5 overflow-y-auto p-4 sm:p-5 bg-[var(--surface)] ${
              step === 'books' ? 'hidden md:block' : 'block'
            }`}
          >
            {activeBook && (
              <div>
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setStep('books')}
                  className="md:hidden flex items-center gap-1 text-xs font-bold text-[var(--green)] mb-3 py-1 px-2 rounded-lg bg-[var(--soft)] border border-[var(--line)] transition"
                >
                  <span>← Back to Books</span>
                </button>

                <div className="mb-4 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--green)] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {activeBook.category} •{' '}
                      {activeBook.testament === 'OT'
                        ? 'Old Testament'
                        : activeBook.testament === 'NT'
                        ? 'New Testament'
                        : activeBook.testament === 'DC'
                        ? 'Deuterocanonical'
                        : 'List of Sixty & Apocrypha'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--ink)] mt-0.5 truncate">
                    {uiLanguageCode !== 'en' && activeBook.names[uiLanguageCode]
                      ? `${activeBook.names[uiLanguageCode]} (${activeBook.names.en})`
                      : activeBook.names.en}
                  </h3>
                  {activeBook.canonStatus && (
                    <p className="text-[11px] text-[var(--subtle)] mt-0.5 leading-relaxed">
                      🏛️ {activeBook.canonStatus} {activeBook.historicalEra ? `(${activeBook.historicalEra})` : ''}
                    </p>
                  )}
                  <p className="text-xs text-[var(--subtle)] mt-1">
                    Select a chapter (1 – {activeBook.chapters})
                  </p>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {Array.from({ length: activeBook.chapters }, (_, i) => i + 1).map((chNum) => {
                    const isCurrent =
                      activeBook.id === currentBookId && chNum === currentChapter;
                    const isTargetChapter =
                      parsedPassage?.book.id === activeBook.id && parsedPassage.chapter === chNum;

                    return (
                      <button
                        key={chNum}
                        onClick={() => {
                          const targetVerse =
                            activeBook.id === parsedPassage?.book.id && chNum === parsedPassage?.chapter
                              ? parsedPassage.verse
                              : undefined;
                          recordReadingHistory({
                            bookSlug: activeBook.slug,
                            bookName:
                              uiLanguageCode !== 'en' && activeBook.names[uiLanguageCode]
                                ? activeBook.names[uiLanguageCode]
                                : activeBook.names.en,
                            chapter: chNum,
                            verse: targetVerse,
                            testament: activeBook.testament,
                            category: activeBook.category,
                            version: (activeVersionId || 'nkjv').toUpperCase(),
                            source: 'navigator',
                          });
                          onSelectBookChapter(activeBook.slug, chNum, targetVerse);
                          onClose();
                        }}
                        className={`h-10 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center relative ${
                          isTargetChapter
                            ? 'bg-[var(--green)] text-[var(--paper)] shadow-lg ring-2 ring-[var(--green)] ring-offset-2 ring-offset-[var(--paper)] font-extrabold scale-105'
                            : isCurrent
                            ? 'bg-[var(--green)] text-[var(--paper)] shadow-lg ring-2 ring-[var(--green)]'
                            : 'border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--green)] hover:bg-[var(--soft)]'
                        }`}
                        title={isTargetChapter && parsedPassage?.verse ? `Chapter ${chNum} (Verse ${parsedPassage.verse})` : `Chapter ${chNum}`}
                      >
                        {chNum}
                        {isTargetChapter && parsedPassage?.verse && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black text-[9px] font-black shadow">
                            v
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discreet Historical Non-Canonical Zone Link */}
            <div className="border-t border-[var(--line)] pt-3 mt-4 text-center text-xs text-[var(--subtle)]">
              <span>Historical Non-Canonical Writings:</span>
              <a
                href="/deuterocanon"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/deuterocanon');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-[var(--green)] hover:underline font-semibold ml-2 inline-block"
              >
                16 Deuterocanonicals Zone →
              </a>
              <span className="mx-1.5 text-[var(--subtle)]">·</span>
              <a
                href="/list-of-sixty"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/list-of-sixty');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-[var(--green)] hover:underline font-semibold inline-block"
              >
                25 Apocrypha Zone →
              </a>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
