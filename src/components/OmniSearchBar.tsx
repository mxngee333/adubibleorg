import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, BookOpen, ArrowRight, CornerDownLeft, Sparkles, Loader2, Quote } from 'lucide-react';
import { BibleBook } from '../types/bible';
import { parsePassageQuery } from '../services/passageService';
import { searchScripture, BibleSearchResult } from '../services/scriptureSearchService';
import { recordReadingHistory } from '../services/studyVaultService';

interface OmniSearchBarProps {
  books: BibleBook[];
  currentBookSlug: string;
  currentChapter: number;
  activeVersionId?: string;
  onNavigate: (bookSlug: string, chapter: number, verse?: number) => void;
  onCloseMobile?: () => void;
  isOpenMobile?: boolean;
}

interface SearchSuggestion {
  type: 'reference' | 'book' | 'topic' | 'verse';
  label: string;
  sublabel: string;
  bookSlug: string;
  chapter: number;
  verse?: number;
  snippetHtml?: string;
  isExactMatch?: boolean;
  category?: string;
}

// Popular curated scripture topics for instant discovery
const CURATED_TOPICS: Array<{
  keyword: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  label: string;
  reference: string;
}> = [
  { keyword: 'love', bookSlug: '1_corinthians', chapter: 13, verse: 4, label: 'Love is patient and kind (Ɔdɔ)', reference: '1 Corinthians 13:4' },
  { keyword: 'faith', bookSlug: 'hebrews', chapter: 11, verse: 1, label: 'Faith is the substance of things hoped for (Gyidie)', reference: 'Hebrews 11:1' },
  { keyword: 'grace', bookSlug: 'ephesians', chapter: 2, verse: 8, label: 'By grace you have been saved through faith (Adom)', reference: 'Ephesians 2:8' },
  { keyword: 'peace', bookSlug: 'philippians', chapter: 4, verse: 7, label: 'The peace of God which surpasses all understanding', reference: 'Philippians 4:7' },
  { keyword: 'salvation', bookSlug: 'romans', chapter: 10, verse: 9, label: 'If you confess with your mouth Jesus is Lord (Nkwagyeɛ)', reference: 'Romans 10:9' },
  { keyword: 'shepherd', bookSlug: 'psalms', chapter: 23, verse: 1, label: 'The LORD is my shepherd; I shall not want (Awurade ne me hwɛfo)', reference: 'Psalm 23:1' },
  { keyword: 'beginning', bookSlug: 'genesis', chapter: 1, verse: 1, label: 'In the beginning God created the heavens and the earth', reference: 'Genesis 1:1' },
  { keyword: 'word', bookSlug: 'john', chapter: 1, verse: 1, label: 'In the beginning was the Word (Mfitiaseɛ no na Asɛm no wɔ hɔ)', reference: 'John 1:1' },
  { keyword: 'wisdom', bookSlug: 'proverbs', chapter: 3, verse: 5, label: 'Trust in the LORD with all your heart (Nyansa)', reference: 'Proverbs 3:5' },
  { keyword: 'armor', bookSlug: 'ephesians', chapter: 6, verse: 11, label: 'Put on the whole armor of God (Onyankopɔn akodeɛ)', reference: 'Ephesians 6:11' },
  { keyword: 'comfort', bookSlug: 'psalms', chapter: 91, verse: 1, label: 'He who dwells in the secret place of the Most High', reference: 'Psalm 91:1' },
  { keyword: 'holy spirit', bookSlug: 'acts', chapter: 2, verse: 4, label: 'Filled with the Holy Spirit (Honhom Kronkron)', reference: 'Acts 2:4' },
];

export const OmniSearchBar: React.FC<OmniSearchBarProps> = ({
  books,
  currentBookSlug,
  currentChapter,
  activeVersionId = 'nkjv',
  onNavigate,
  onCloseMobile,
  isOpenMobile,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [liveVerses, setLiveVerses] = useState<BibleSearchResult[]>([]);
  const [isSearchingScripture, setIsSearchingScripture] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus if opened on mobile
  useEffect(() => {
    if (isOpenMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpenMobile]);

  // Debounced live Scripture full-text word & phrase search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setLiveVerses([]);
      setIsSearchingScripture(false);
      return;
    }

    setIsSearchingScripture(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchScripture(trimmed, {
          versionId: activeVersionId || 'nkjv',
          limit: 8,
        });
        setLiveVerses(results);
      } catch {
        setLiveVerses([]);
      } finally {
        setIsSearchingScripture(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, activeVersionId]);

  // Parse reference, book, keyword, and live Bible verse suggestions
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) {
      // Default suggestions when empty: show quick chapters of current book & popular verses
      const current = books.find((b) => b.slug === currentBookSlug);
      const defaults: SearchSuggestion[] = [];
      if (current) {
        defaults.push({
          type: 'book',
          label: `${current.names.en} (Quick Chapter Jump)`,
          sublabel: `Browse Chapters 1 to ${current.chapters}`,
          bookSlug: current.slug,
          chapter: currentChapter,
        });
      }
      defaults.push(
        {
          type: 'reference',
          label: 'John 3:16',
          sublabel: 'For God so loved the world that He gave His only begotten Son (NKJV)',
          bookSlug: 'john',
          chapter: 3,
          verse: 16,
        },
        {
          type: 'reference',
          label: 'Psalm 23:1',
          sublabel: 'The LORD is my shepherd • Awurade ne me hwɛfo',
          bookSlug: 'psalms',
          chapter: 23,
          verse: 1,
        },
        {
          type: 'reference',
          label: 'Romans 8:28',
          sublabel: 'All things work together for good to those who love God',
          bookSlug: 'romans',
          chapter: 8,
          verse: 28,
        },
        {
          type: 'reference',
          label: 'Ephesians 1:3',
          sublabel: 'Blessed be the God and Father of our Lord Jesus Christ',
          bookSlug: 'ephesians',
          chapter: 1,
          verse: 3,
        }
      );
      return defaults;
    }

    const results: SearchSuggestion[] = [];

    // 1. Universal Scripture Reference Parser (e.g., "Psalm 2:2", "ps 2;2", "ps2:2", "John 3:16", "1 Cor 13", "Gen 1:1")
    const parsed = parsePassageQuery(raw, books);
    if (parsed) {
      results.push({
        type: 'reference',
        label: `${parsed.book.names.en} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}` : ''}`,
        sublabel: `${parsed.book.testament === 'OT' ? 'Old Testament' : parsed.book.testament === 'NT' ? 'New Testament' : 'Historical Book'} (${parsed.book.chapters} chapters)${parsed.verse ? ` · Jump to Verse ${parsed.verse}` : ''}`,
        bookSlug: parsed.book.slug,
        chapter: parsed.chapter,
        verse: parsed.verse,
      });
    }

    // 2. Book Name Matching (up to 2)
    const matchedBooks = books.filter((b) => {
      const en = b.names.en.toLowerCase();
      const tw = (b.names.tw || '').toLowerCase();
      const slug = b.slug.toLowerCase();
      return en.includes(raw) || tw.includes(raw) || slug.includes(raw);
    }).slice(0, 2);

    for (const b of matchedBooks) {
      if (!results.some((r) => r.bookSlug === b.slug)) {
        results.push({
          type: 'book',
          label: b.names.en,
          sublabel: `${b.category} · ${b.chapters} Chapters`,
          bookSlug: b.slug,
          chapter: 1,
        });
      }
    }

    // 3. Live Scripture Verses Matching the Searched Word, Phrase, or Keyword
    for (const v of liveVerses) {
      if (!results.some((r) => r.bookSlug === v.bookSlug && r.chapter === v.chapter && r.verse === v.verse)) {
        results.push({
          type: 'verse',
          label: `${v.reference} (${v.versionId.toUpperCase()})`,
          sublabel: v.text,
          snippetHtml: v.snippetHtml,
          bookSlug: v.bookSlug,
          chapter: v.chapter,
          verse: v.verse,
          isExactMatch: v.isExactMatch,
          category: v.category,
        });
      }
    }

    // 4. Topic & Keyword Matching
    for (const topic of CURATED_TOPICS) {
      if (topic.keyword.includes(raw) || topic.label.toLowerCase().includes(raw)) {
        if (!results.some((r) => r.bookSlug === topic.bookSlug && r.chapter === topic.chapter && r.verse === topic.verse)) {
          results.push({
            type: 'topic',
            label: `${topic.reference} — "${topic.keyword.toUpperCase()}"`,
            sublabel: topic.label,
            bookSlug: topic.bookSlug,
            chapter: topic.chapter,
            verse: topic.verse,
          });
        }
      }
    }

    return results.slice(0, 10);
  }, [query, books, currentBookSlug, currentChapter, liveVerses]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    const b = books.find((x) => x.slug === suggestion.bookSlug);
    recordReadingHistory({
      bookId: b?.id || suggestion.bookSlug,
      bookSlug: suggestion.bookSlug,
      bookName: b?.names.en || suggestion.label,
      chapter: suggestion.chapter,
      verse: suggestion.verse,
      versionId: activeVersionId,
      query: query.trim() || suggestion.label,
      timestamp: Date.now(),
      testament: b?.testament,
      category: b?.category,
      source: 'search',
    });
    onNavigate(suggestion.bookSlug, suggestion.chapter, suggestion.verse);
    setIsFocused(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, suggestions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % Math.max(1, suggestions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const direct = parsePassageQuery(query, books);
      if (direct) {
        recordReadingHistory({
          bookId: direct.book.id,
          bookSlug: direct.book.slug,
          bookName: direct.book.names.en,
          chapter: direct.chapter,
          verse: direct.verse,
          versionId: activeVersionId,
          query: query.trim(),
          timestamp: Date.now(),
          testament: direct.book.testament,
          category: direct.book.category,
          source: 'search',
        });
        onNavigate(direct.book.slug, direct.chapter, direct.verse);
        setIsFocused(false);
        setQuery('');
        if (onCloseMobile) onCloseMobile();
      } else if (suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      if (onCloseMobile) onCloseMobile();
    }
  };

  return (
    <div className="omni-search-container" ref={containerRef}>
      <div className={`omni-search-box ${isFocused ? 'focused' : ''}`}>
        <Search className="omni-search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="omni-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={isOpenMobile ? "Search passage or topic (e.g. John 3:16)..." : "Search scripture, passage, or topic (e.g. John 3:16, Psalm 23)..."}
          aria-label="Search scripture passage or reference"
        />
        {query && (
          <button
            type="button"
            className="omni-clear-btn"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {onCloseMobile && (
          <button
            type="button"
            className="omni-mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close search"
          >
            Done
          </button>
        )}
      </div>

      {/* AUTOCOMPLETE / JUMP SUGGESTIONS DROPDOWN */}
      {isFocused && (suggestions.length > 0 || isSearchingScripture) && (
        <div className="omni-suggestions-dropdown" role="listbox">
          <div className="omni-dropdown-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isSearchingScripture ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 omni-search-spinner text-amber-400" />
                  <span>Searching Scripture for "{query}"...</span>
                </>
              ) : liveVerses.length > 0 ? (
                <span>Found {liveVerses.length} Scripture Verses Matching "{query}"</span>
              ) : (
                <span>{query ? 'Quick Scripture Jumps' : 'Suggested Passages & Topics'}</span>
              )}
            </div>
            <span className="omni-hint">Press ↵ Enter to jump</span>
          </div>

          <div className="omni-suggestions-list">
            {suggestions.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  type="button"
                  key={`${item.bookSlug}-${item.chapter}-${item.verse || 0}-${idx}`}
                  className={`omni-suggestion-item ${active ? 'active' : ''} ${item.type === 'verse' ? 'verse-suggestion' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                  role="option"
                  aria-selected={active}
                >
                  <div className="suggestion-icon">
                    {item.type === 'verse' ? (
                      <Quote className="h-4 w-4 text-amber-400" />
                    ) : item.type === 'topic' ? (
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    ) : item.type === 'book' ? (
                      <BookOpen className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>

                  <div className="suggestion-content">
                    <div className="suggestion-title-row">
                      <span className="suggestion-title">{item.label}</span>
                      {item.isExactMatch && (
                        <span className="suggestion-badge-exact">Exact Match</span>
                      )}
                      {item.category && item.type === 'verse' && (
                        <span className="suggestion-badge-cat">{item.category}</span>
                      )}
                    </div>
                    {item.snippetHtml ? (
                      <div
                        className="suggestion-snippet"
                        dangerouslySetInnerHTML={{ __html: item.snippetHtml }}
                      />
                    ) : (
                      <div className="suggestion-subtitle">{item.sublabel}</div>
                    )}
                  </div>

                  <div className="suggestion-action">
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
