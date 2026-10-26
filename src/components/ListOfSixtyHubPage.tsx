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

interface ListOfSixtyHubPageProps {
  books: BibleBook[];
  uiLanguageCode: string;
  onSelectBookChapter: (bookSlug: string, chapter: number) => void;
  onOpenReaderWithVersions: (bookSlug: string, chapter: number, versionIds: string[]) => void;
  footer?: React.ReactNode;
}

export const ListOfSixtyHubPage: React.FC<ListOfSixtyHubPageProps> = ({
  books,
  uiLanguageCode,
  onSelectBookChapter,
  onOpenReaderWithVersions,
  footer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PROPHETS' | 'APOSTOLIC' | 'APOCALYPSES'>('ALL');

  const pseudBooks = useMemo(
    () => books.filter((b) => b.testament === 'PSEUD'),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pseudBooks.filter((b) => {
      if (categoryFilter === 'APOSTOLIC' && b.category !== 'Apostolic Fathers') return false;
      if (
        categoryFilter === 'APOCALYPSES' &&
        !b.slug.includes('apocalypse') &&
        !b.slug.includes('ascension') &&
        b.slug !== 'enoch'
      ) {
        return false;
      }
      if (
        categoryFilter === 'PROPHETS' &&
        (b.category === 'Apostolic Fathers' || b.slug.includes('gospel'))
      ) {
        return false;
      }

      if (!q) return true;
      const en = (b.names.en || '').toLowerCase();
      const tw = (b.names.tw || '').toLowerCase();
      const el = (b.names.el || '').toLowerCase();
      const ge = (b.names.ge || '').toLowerCase();
      const slug = b.slug.toLowerCase();
      return en.includes(q) || tw.includes(q) || el.includes(q) || ge.includes(q) || slug.includes(q);
    });
  }, [pseudBooks, categoryFilter, searchQuery]);

  return (
    <div className="workspace" style={{ paddingBottom: '70px' }}>
      {/* 1. HERO BANNER */}
      <section className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="eyebrow" style={{ color: 'var(--green)', fontWeight: 700 }}>
            ANCIENT SCRIPTURES · 7TH-CENTURY MANUSCRIPT CATALOGUE
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
            25 Ancient Writings
          </span>
        </div>

        <h1 style={{ margin: '6px 0 14px' }}>The List of Sixty &amp; Ancient Apocrypha</h1>
        <p style={{ maxWidth: '840px', fontSize: '16px', lineHeight: 1.65, color: 'var(--subtle)' }}>
          The historic 7th-century Greek manuscript canon index catalogued sixty books as complete canon, followed by
          an extraordinary list of revered apocryphal scriptures and early apostolic writings: the Book of Enoch (quoted in Jude 1:14),
          The Didache (Teaching of the Apostles), The Shepherd of Hermas (Codex Sinaiticus), Testaments of the Twelve Patriarchs, and 1 &amp; 2 Clement.
        </p>
      </section>

      {/* 2. HISTORICAL MANUSCRIPT PROVENANCE BANNER */}
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
          <span style={{ fontSize: '24px' }}>🇪🇹</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
              Ethiopian Orthodox Tewahedo
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
              The Book of Enoch (Mäṣḥafä Henok) and Book of Jubilees are fully canonical scripture in the 81-book Ethiopian Orthodox Bible.
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
          <span style={{ fontSize: '24px' }}>📜</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
              Codex Sinaiticus (4th Century)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
              The oldest complete Greek New Testament manuscript contains The Shepherd of Hermas and the Epistle of Barnabas bound into its canonical text.
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
          <span style={{ fontSize: '24px' }}>🏺</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
              Codex Alexandrinus (5th Century)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
              The majestic royal codex preserves 1 Clement and 2 Clement at the close of the New Testament following the Book of Revelation.
            </span>
          </div>
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
            All List of Sixty ({pseudBooks.length})
          </button>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'APOSTOLIC' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('APOSTOLIC')}
          >
            Apostolic Fathers (Didache, Hermas, Barnabas, Clement)
          </button>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'PROPHETS' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('PROPHETS')}
          >
            Patriarchs &amp; Prophets (Enoch, Adam, Moses, 12 Patriarchs)
          </button>
          <button
            type="button"
            className={`quiet-button ${categoryFilter === 'APOCALYPSES' ? 'active-pill' : ''}`}
            onClick={() => setCategoryFilter('APOCALYPSES')}
          >
            Ancient Apocalypses (Elijah, Peter, Paul, Isaiah)
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
            <optgroup label="── 25 List of Sixty & Apocrypha Books ──">
              {pseudBooks.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.names.en} ({b.names.tw || b.id})
                </option>
              ))}
            </optgroup>
            <optgroup label="── All Other Books ──">
              {books.filter((b) => b.testament !== 'PSEUD').map((b) => (
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
              placeholder="Search Enoch, Didache, Hermas, Clement..."
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

                <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600, marginBottom: '8px' }}>
                  🇬🇭 {book.names.tw} {book.names.ge ? `· 🇪🇹 ${book.names.ge}` : ''}
                </div>

                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
                  🏛️ <strong>Provenance:</strong> {book.canonStatus}
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
                    onOpenReaderWithVersions(book.slug, 1, ['charles', 'lightfoot', 'twi-apoc', 'kjv-apoc'])
                  }
                  title="Read in Parallel: R.H. Charles, Lightfoot, Asante Twi & KJV"
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
