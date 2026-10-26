import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ScrollText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BibleBook } from '../types/bible';

interface DeuterocanonicalHubPageProps {
  books: BibleBook[];
  uiLanguageCode: string;
  onSelectBookChapter: (bookSlug: string, chapter: number) => void;
  onOpenReaderWithVersions: (bookSlug: string, chapter: number, versionIds: string[]) => void;
  footer?: React.ReactNode;
}

export const DeuterocanonicalHubPage: React.FC<DeuterocanonicalHubPageProps> = ({
  books,
  uiLanguageCode,
  onSelectBookChapter,
  onOpenReaderWithVersions,
  footer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'WISDOM' | 'HISTORY' | 'ORTHODOX'>('ALL');

  const deuterocanonBooks = useMemo(
    () => books.filter((b) => b.testament === 'DC'),
    [books]
  );

  const [quickBookSlug, setQuickBookSlug] = useState<string>(() => deuterocanonBooks[0]?.slug || 'tobit');
  const [quickChapter, setQuickChapter] = useState<number>(1);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return deuterocanonBooks.filter((b) => {
      if (categoryFilter === 'WISDOM' && b.category !== 'Wisdom Literature') return false;
      if (categoryFilter === 'HISTORY' && b.category !== 'Deuterocanonical' && b.category !== 'History') return false;
      if (categoryFilter === 'ORTHODOX' && b.category !== 'Orthodox Deuterocanon') return false;

      if (!q) return true;
      const en = (b.names.en || '').toLowerCase();
      const tw = (b.names.tw || '').toLowerCase();
      const el = (b.names.el || '').toLowerCase();
      const la = (b.names.la || '').toLowerCase();
      const slug = b.slug.toLowerCase();
      return en.includes(q) || tw.includes(q) || el.includes(q) || la.includes(q) || slug.includes(q);
    });
  }, [deuterocanonBooks, categoryFilter, searchQuery]);

  return (
    <div className="workspace" style={{ paddingBottom: '70px' }}>
      {/* 1. HERO BANNER */}
      <section className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="eyebrow" style={{ color: 'var(--green)', fontWeight: 700 }}>
            HISTORICAL BIBLICAL CANON · DEUTEROCANONICAL SCRIPTURES
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--soft)',
              fontSize: '11px',
              color: 'var(--green)',
              fontWeight: 700,
            }}
          >
            16 Books
          </span>
        </div>

        <h1 style={{ margin: '6px 0 14px' }}>Deuterocanonical Scriptures &amp; Apocrypha</h1>
        <p style={{ maxWidth: '820px', fontSize: '16px', lineHeight: 1.65, color: 'var(--subtle)' }}>
          Sacred scriptures canonical for the Catholic Church, Eastern Orthodox Church, Oriental Orthodox Churches,
          and the Church of the East. Written primarily in the Hellenistic Second Temple era (c. 300 BC – 100 AD) and
          preserved in the Greek Septuagint (LXX), Latin Vulgate, and King James 1611 Apocrypha.
        </p>
      </section>

      {/* 2. CHURCH TRADITIONS & CANON STATUS BANNER */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            gap: '12px',
            alignItems: 'start',
          }}
        >
          <span style={{ fontSize: '24px' }}>✝️</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
              Catholic Canon (Trent 1546)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
              Tobit, Judith, Baruch (w/ Letter of Jeremiah), Sirach, 1 &amp; 2 Maccabees, Wisdom of Solomon, Additions to Esther &amp; Daniel.
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            gap: '12px',
            alignItems: 'start',
          }}
        >
          <span style={{ fontSize: '24px' }}>☦️</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
              Eastern &amp; Oriental Orthodox
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
              Includes all Catholic deuterocanonicals plus Prayer of Manasseh, 1 &amp; 2 Esdras, 3 &amp; 4 Maccabees, and Psalm 151 (Synod of Jerusalem 1672).
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            gap: '12px',
            alignItems: 'start',
          }}
        >
          <span style={{ fontSize: '24px' }}>👑</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
              King James 1611 &amp; Anglican
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
              Printed between the Old &amp; New Testaments in the original 1611 Authorized Version for historical instruction and liturgical lectionary readings.
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 QUICK DEUTEROCANON BOOK & CHAPTER DROPDOWN NAVIGATOR */}
      <div
        className="hub-dropdown-navigator"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'var(--paper)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: '#f59e0b',
            }}
          >
            📜
          </div>
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
              Deuterocanonical Book Dropdown
            </strong>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--subtle)' }}>
              Instantly choose any of the 16 books and jump into the synchronized parallel reader
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label className="field" style={{ margin: 0 }}>
            <span>Book</span>
            <select
              value={quickBookSlug}
              onChange={(e) => {
                setQuickBookSlug(e.target.value);
                setQuickChapter(1);
              }}
              style={{ minWidth: '180px' }}
            >
              {deuterocanonBooks.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.names.en}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact" style={{ margin: 0 }}>
            <span>Chapter</span>
            <select
              value={quickChapter}
              onChange={(e) => setQuickChapter(Number(e.target.value))}
            >
              {Array.from(
                {
                  length:
                    deuterocanonBooks.find((b) => b.slug === quickBookSlug)?.chapters || 1,
                },
                (_, idx) => idx + 1
              ).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="primary-button"
            style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: 700 }}
            onClick={() => onSelectBookChapter(quickBookSlug, quickChapter)}
          >
            Read in Parallel →
          </button>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'ALL' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('ALL')}
          >
            All Deuterocanon ({deuterocanonBooks.length})
          </button>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'WISDOM' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('WISDOM')}
          >
            Wisdom Literature (Wisdom &amp; Sirach)
          </button>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'HISTORY' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('HISTORY')}
          >
            Historical &amp; Narrative (Maccabees, Tobit, Judith)
          </button>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'ORTHODOX' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('ORTHODOX')}
          >
            Orthodox Canon (Esdras, Manasseh, Ps 151)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="quick-book-jump"
            onChange={(e) => {
              if (e.target.value) {
                onSelectBookChapter(e.target.value, 1);
              }
            }}
            defaultValue=""
            style={{
              height: '36px',
              padding: '0 10px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
            aria-label="Quick jump to book"
          >
            <option value="" disabled>Quick jump to book...</option>
            <optgroup label="── 16 Deuterocanonical Books ──">
              {deuterocanonBooks.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.names.en}
                </option>
              ))}
            </optgroup>
            <optgroup label="── All Other Books ──">
              {books.filter((b) => b.testament !== 'DC').map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.names.en}
                </option>
              ))}
            </optgroup>
          </select>

          <div className="chapter-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Wisdom, Sirach, Tobit, Anyansa..."
              style={{ minWidth: '220px' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOOKS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredBooks.map((book) => {
          return (
            <div
              key={book.id}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      background: 'var(--soft)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--green)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    <ScrollText className="h-3 w-3" />
                    {book.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                    {book.chapters} {book.chapters === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>

                <h3
                  style={{
                    margin: '0 0 4px',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  {book.names.en}
                </h3>

                {book.names.el ? (
                  <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600, marginBottom: '8px' }}>
                    🇬🇷 {book.names.el} {book.names.la ? `· 🏛️ ${book.names.la}` : ''}
                  </div>
                ) : null}

                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
                  🏛️ <strong>Canon:</strong> {book.canonStatus}
                </p>

                {book.historicalEra && (
                  <p style={{ margin: '0', fontSize: '11px', color: 'var(--subtle)' }}>
                    ⏳ <strong>Historical Era:</strong> {book.historicalEra} · {book.author}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <button
                  type="button"
                  className="add-column"
                  style={{ flex: 1, minHeight: '38px', fontSize: '12px', padding: '0 12px' }}
                  onClick={() =>
                    onOpenReaderWithVersions(book.slug, 1, ['kjv-apoc', 'twi-apoc', 'dra', 'lxx'])
                  }
                  title="Read in Parallel: KJV 1611, Asante Twi, Douay-Rheims & Septuagint"
                >
                  📖 Read in Parallel
                </button>

                <button
                  type="button"
                  className="quiet-button"
                  style={{ minHeight: '38px', padding: '0 12px', fontSize: '12px' }}
                  onClick={() => onSelectBookChapter(book.slug, 1)}
                  title="Open Chapter 1"
                >
                  Chapter 1 →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {footer}
    </div>
  );
};
