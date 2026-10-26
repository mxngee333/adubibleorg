import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Scroll,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  X,
} from 'lucide-react';
import { BibleBook } from '../types/bible';

interface SearchSanctuaryLanderProps {
  books: BibleBook[];
  currentBookSlug: string;
  currentChapter: number;
  onNavigate: (bookSlug: string, chapter: number, verse?: number) => void;
  onLaunchPreset: (versions: string[], bookSlug?: string, chapter?: number) => void;
  onSelectNavTab: (tab: 'canonical' | 'deuterocanon' | 'list-of-sixty') => void;
  onEnterReader: () => void;
  onOpenAskAi?: () => void;
}

interface QuickTopic {
  label: string;
  sublabel: string;
  bookSlug: string;
  chapter: number;
  verse?: number;
}

const QUICK_SANCTUARY_DISCOVERIES: QuickTopic[] = [
  { label: 'John 3:16', sublabel: 'Onyankopɔn Dɔ (God so loved the world)', bookSlug: 'john', chapter: 3, verse: 16 },
  { label: 'Psalm 23:1', sublabel: 'Awurade ne me Hwɛfo (The LORD is my Shepherd)', bookSlug: 'psalms', chapter: 23, verse: 1 },
  { label: 'Ephesians 1:3', sublabel: 'Spiritual Blessings in Heavenly Places', bookSlug: 'ephesians', chapter: 1, verse: 3 },
  { label: 'Hebrews 4:12', sublabel: 'Living and Active Word of God', bookSlug: 'hebrews', chapter: 4, verse: 12 },
  { label: '2 Timothy 3:16', sublabel: 'All Scripture is God-Breathed', bookSlug: '2_timothy', chapter: 3, verse: 16 },
  { label: 'Romans 8:28', sublabel: 'All Things Work for Good', bookSlug: 'romans', chapter: 8, verse: 28 },
  { label: 'Wisdom 1:1', sublabel: 'Anyansa (Wisdom of Solomon — Deuterocanon)', bookSlug: 'wisdom', chapter: 1, verse: 1 },
  { label: '1 Enoch 1:1', sublabel: 'Henok Nkɔmhyɛ (The Blessing of Enoch — Apocrypha)', bookSlug: 'enoch', chapter: 1, verse: 1 },
  { label: 'Genesis 1:1', sublabel: 'In the Beginning God Created', bookSlug: 'genesis', chapter: 1, verse: 1 },
];

export const SearchSanctuaryLander: React.FC<SearchSanctuaryLanderProps> = ({
  books,
  currentBookSlug,
  currentChapter,
  onNavigate,
  onLaunchPreset,
  onSelectNavTab,
  onEnterReader,
  onOpenAskAi,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Filter suggestions dynamically as user types
  const filteredSuggestions = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];

    // 1. Direct Reference Parsing (e.g., "John 3", "Efesofoɔ 1", "Tobit 2", "Enoch 1")
    const refMatch = raw.match(/^([1-3]?\s*[a-z]+)\s*(\d+)?(?::(\d+))?$/i);
    const results: Array<{
      label: string;
      sublabel: string;
      bookSlug: string;
      chapter: number;
      verse?: number;
      testament: string;
    }> = [];

    if (refMatch) {
      const bookPart = refMatch[1].trim().replace(/\s+/g, '-');
      const chPart = refMatch[2] ? parseInt(refMatch[2], 10) : 1;
      const vPart = refMatch[3] ? parseInt(refMatch[3], 10) : undefined;

      const matchedBook = books.find((b) => {
        const en = b.names.en.toLowerCase();
        const tw = (b.names.tw || '').toLowerCase();
        const slug = b.slug.toLowerCase().replace(/_/g, '-');
        return (
          slug === bookPart ||
          en === bookPart ||
          tw === bookPart ||
          en.startsWith(bookPart) ||
          slug.startsWith(bookPart)
        );
      });

      if (matchedBook) {
        const validCh = Math.min(Math.max(1, chPart), matchedBook.chapters);
        results.push({
          label: `${matchedBook.names.en} ${validCh}${vPart ? `:${vPart}` : ''}`,
          sublabel: `${matchedBook.names.tw ? `${matchedBook.names.tw} · ` : ''}${matchedBook.chapters} chapters`,
          bookSlug: matchedBook.slug,
          chapter: validCh,
          verse: vPart,
          testament: matchedBook.testament,
        });
      }
    }

    // 2. Matching Books
    const matchedBooks = books.filter((b) => {
      const en = b.names.en.toLowerCase();
      const tw = (b.names.tw || '').toLowerCase();
      const slug = b.slug.toLowerCase();
      return en.includes(raw) || tw.includes(raw) || slug.includes(raw);
    }).slice(0, 5);

    for (const b of matchedBooks) {
      if (!results.some((r) => r.bookSlug === b.slug)) {
        results.push({
          label: `${b.names.en} ${b.names.tw ? `(${b.names.tw})` : ''}`,
          sublabel: `${b.testament === 'OT' ? 'Old Testament (39)' : b.testament === 'NT' ? 'New Testament (27)' : b.testament === 'DC' ? 'Deuterocanonical (16)' : 'Apocrypha (25)'} · ${b.chapters} Chapters`,
          bookSlug: b.slug,
          chapter: 1,
          testament: b.testament,
        });
      }
    }

    return results;
  }, [query, books]);

  return (
    <section
      className="search-sanctuary-lander"
      style={{
        marginBottom: '32px',
        borderRadius: '16px',
        border: '1px solid var(--line)',
        background: 'linear-gradient(180deg, var(--soft) 0%, var(--surface) 100%)',
        padding: '36px 24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* 1. HERO HEADER & COVENANT */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: 'var(--green)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}
        >
          <Sparkles style={{ width: '13px', height: '13px' }} />
          <span>AduBible Scripture Sanctuary · 100% Ad-Free · 107 Holy Books</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            lineHeight: 1.15,
          }}
        >
          Search the Sacred Word in Parallel
        </h1>

        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--subtle)',
            margin: '0 auto',
            maxWidth: '680px',
          }}
        >
          Compare Asante Twi, Akuapem Twi, English (NKJV, KJV 1611), Original Hebrew &amp; Greek Interlinear with Strong&apos;s Lexicon. Dedicated to Humanity in honor of the Legacy of <strong>Apostle Kwame Adu</strong> of{' '}
          <a
            href="https://nsuhia.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--green)', textDecoration: 'underline' }}
          >
            Nsuhia, Ghana ↗
          </a>.
        </p>
      </div>

      {/* 2. GRAND SEARCH SANCTUARY INPUT */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          maxWidth: '720px',
          margin: '0 auto 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            border: isFocused ? '1px solid var(--green)' : '1px solid var(--line)',
            background: 'var(--paper)',
            padding: '4px 16px',
            boxShadow: isFocused ? '0 0 20px rgba(245, 158, 11, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.2)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          <Search style={{ width: '20px', height: '20px', color: 'var(--green)', flexShrink: 0, marginRight: '12px' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search verse, topic, book, or Strong's (e.g. John 3:16, Efesofoɔ 1, Ɔdɔ, Wisdom 1, Enoch)..."
            style={{
              width: '100%',
              height: '48px',
              border: 0,
              outline: 'none',
              background: 'transparent',
              color: 'var(--ink)',
              fontSize: '15px',
              fontWeight: 500,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--subtle)',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Clear search"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {isFocused && filteredSuggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 60,
              borderRadius: '12px',
              border: '1px solid var(--line)',
              background: 'var(--paper)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
            }}
          >
            {filteredSuggestions.map((item, idx) => (
              <button
                key={`${item.bookSlug}-${item.chapter}-${idx}`}
                type="button"
                onClick={() => {
                  onNavigate(item.bookSlug, item.chapter, item.verse);
                  setIsFocused(false);
                  setQuery('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 0,
                  borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid var(--line)' : 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--ink)' }}>
                    {item.label}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                    {item.sublabel}
                  </span>
                </div>
                <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--green)' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. QUICK SCRIPTURE DISCOVERY CHIPS */}
      <div style={{ maxWidth: '820px', margin: '0 auto 28px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--subtle)', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Scripture &amp; Topic Gateways:
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {QUICK_SANCTUARY_DISCOVERIES.map((disc) => (
            <button
              key={disc.label}
              type="button"
              onClick={() => onNavigate(disc.bookSlug, disc.chapter, disc.verse)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'border-color 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--green)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title={disc.sublabel}
            >
              <span>{disc.label}</span>
              <span style={{ fontSize: '10px', color: 'var(--subtle)' }}>· {disc.sublabel.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. THREE SACRED CANON PORTALS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          maxWidth: '920px',
          margin: '0 auto 28px',
        }}
      >
        {/* Portal 1: 66 Canonical Books */}
        <div
          style={{
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <BookOpen style={{ width: '18px', height: '18px', color: 'var(--green)' }} />
              <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>66 Canonical Books</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              The 39 Old Testament &amp; 27 New Testament scriptures in Asante Twi, NKJV, KJV, and Original Greek/Hebrew.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectNavTab('canonical')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--soft)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Read 66 Books</span>
            <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--green)' }} />
          </button>
        </div>

        {/* Portal 2: 16 Deuterocanonical Books */}
        <div
          style={{
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Scroll style={{ width: '18px', height: '18px', color: 'var(--green)' }} />
              <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>16 Deuterocanonicals</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Catholic &amp; Orthodox historical books: Wisdom of Solomon, Sirach, Tobit, Judith, Baruch, and Maccabees.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectNavTab('deuterocanon')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--soft)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Browse Deuterocanon (16)</span>
            <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--green)' }} />
          </button>
        </div>

        {/* Portal 3: 25 List of Sixty & Apocrypha */}
        <div
          style={{
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers style={{ width: '18px', height: '18px', color: 'var(--green)' }} />
              <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>25 List of Sixty Books</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Ancient manuscript apocrypha: 1 Enoch, Book of Jubilees, Book of Jasher, Didache, and Shepherd of Hermas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectNavTab('list-of-sixty')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--soft)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Browse Apocrypha (25)</span>
            <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--green)' }} />
          </button>
        </div>
      </div>

      {/* 4.5. ASK ADUBIBLE AI SCRIPTURE SCHOLAR BANNER */}
      {onOpenAskAi && (
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto 28px',
            padding: '16px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(147, 51, 234, 0.14) 100%)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #9333ea 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '20px',
                boxShadow: '0 2px 12px rgba(245, 158, 11, 0.35)',
              }}
            >
              ✦
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>✦ Ask AduBible AI Exegetical Companion</strong>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#f59e0b',
                    color: '#0c0a09',
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  AI Scholar
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--subtle)' }}>
                Greek/Hebrew root words, Asante Twi theological nuances, cross-references, and verse commentary with zero ads.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAskAi}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#0c0a09',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
              transition: 'transform 0.1s, box-shadow 0.15s',
            }}
          >
            <span>✦ Ask AduBible AI</span>
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* 5. INSTANT PARALLEL STUDY LAUNCHERS */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          maxWidth: '920px',
          margin: '0 auto 24px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Instant Parallel Launchers:
        </span>
        <button
          type="button"
          onClick={() => onLaunchPreset(['kjv', 'twi'])}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            background: 'var(--soft)',
            color: 'var(--ink)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🇬🇭 KJV + Asante Twi
        </button>
        <button
          type="button"
          onClick={() => onLaunchPreset(['nkjv', 'twi'])}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            background: 'var(--soft)',
            color: 'var(--ink)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🇬🇭 NKJV + Asante Twi
        </button>
        <button
          type="button"
          onClick={() => onLaunchPreset(['kjv-apoc', 'twi-apoc'], 'wisdom', 1)}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            background: 'var(--soft)',
            color: 'var(--ink)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📜 KJV 1611 + Deuterocanon
        </button>
        <button
          type="button"
          onClick={() => onLaunchPreset(['charles', 'twi-apoc'], 'enoch', 1)}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            background: 'var(--soft)',
            color: 'var(--ink)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🏺 R.H. Charles + Twi (Enoch)
        </button>
        <button
          type="button"
          onClick={() => onLaunchPreset(['tr-gk', 'kjv', 'twi'])}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            background: 'var(--soft)',
            color: 'var(--ink)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🏛️ Greek Interlinear + KJV + Twi
        </button>
      </div>

      {/* 6. MEMORIAL & VALUE PROPOSITION BANNER */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          background: 'rgba(245, 158, 11, 0.05)',
          maxWidth: '920px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '13px' }}>
          <Shield style={{ width: '15px', height: '15px', color: 'var(--green)' }} />
          <span>Honoring the Legacy of Apostle Kwame Adu ·</span>
          <a
            href="https://nsuhia.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--ink)', textDecoration: 'underline', fontWeight: 600 }}
          >
            Nsuhia, Ghana ↗
          </a>
          <span>·</span>
          <a
            href="https://adubible.org/"
            style={{ color: 'var(--green)', textDecoration: 'underline', fontWeight: 700 }}
          >
            adubible.org
          </a>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.16)',
              color: 'var(--green)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Dedicated to Humanity
          </span>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.16)',
              color: '#34d399',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            100% Ads-Free
          </span>
          <button
            type="button"
            onClick={onEnterReader}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              background: 'var(--green)',
              color: '#0c0a09',
              fontWeight: 700,
              fontSize: '11px',
              border: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Enter Reader</span>
            <ArrowRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      </div>
    </section>
  );
};
