import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { BibleBook } from '../types/bible';

interface BookChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BibleBook[];
  currentBookId: string;
  currentChapter: number;
  uiLanguageCode: string;
  initialTestamentFilter?: 'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD';
  onSelectBookChapter: (bookSlug: string, chapter: number) => void;
}

export const BookChapterSelectorModal: React.FC<BookChapterSelectorModalProps> = ({
  isOpen,
  onClose,
  books,
  currentBookId,
  currentChapter,
  uiLanguageCode,
  initialTestamentFilter,
  onSelectBookChapter,
}) => {
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD'>('CANONICAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(
    () => books.find((b) => b.id === currentBookId) || books[0] || null
  );
  const [step, setStep] = useState<'books' | 'chapters'>('books');

  useEffect(() => {
    if (isOpen) {
      const cur = books.find((b) => b.id === currentBookId);
      if (cur?.testament === 'DC') {
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
    }
  }, [isOpen, currentBookId, books, initialTestamentFilter]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((b) => {
      if (testamentFilter === 'ALL') {
        // Show all 107 books
      } else if (testamentFilter === 'CANONICAL') {
        if (b.testament !== 'OT' && b.testament !== 'NT') return false;
      } else if (b.testament !== testamentFilter) {
        return false;
      }
      if (!q) return true;
      const enName = (b.names.en || '').toLowerCase();
      const twName = (b.names.tw || '').toLowerCase();
      const localName = (b.names[uiLanguageCode] || '').toLowerCase();
      return (
        enName.includes(q) ||
        twName.includes(q) ||
        localName.includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [books, testamentFilter, searchQuery, uiLanguageCode]);

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
      default:
        return {
          title: 'Holy Bible · 66 Canonical Books Navigator',
          desc: 'Old Testament (39 Books) · New Testament (27 Books) · Accepted Scripture',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--soft)] border border-[var(--line)] text-[var(--green)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                {headerMeta.title}
              </h2>
              <p className="text-xs text-[var(--subtle)]">
                {headerMeta.desc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3">
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
          </div>

          <div className="relative flex-1 min-w-[130px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--subtle)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setStep('books');
              }}
              placeholder="Search scripture, book, chapter..."
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-sm sm:text-xs text-[var(--ink)] placeholder-[var(--subtle)] focus:border-[var(--green)] focus:outline-none min-h-[38px]"
            />
          </div>
        </div>

        {/* Mobile Step Toggle */}
        <div className="flex md:hidden border-b border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs">
          <button
            onClick={() => setStep('books')}
            className={`font-bold ${step === 'books' ? 'text-[var(--green)]' : 'text-[var(--subtle)]'}`}
          >
            1. Select Book ({uiLanguageCode !== 'en' && activeBook?.names[uiLanguageCode] ? activeBook.names[uiLanguageCode] : activeBook?.names.en})
          </button>
          <ChevronRight className="h-4 w-4 mx-1 text-[var(--subtle)]" />
          <button
            onClick={() => setStep('chapters')}
            className={`font-bold ${step === 'chapters' ? 'text-[var(--green)]' : 'text-[var(--subtle)]'}`}
          >
            2. Select Chapter ({activeBook?.chapters} Chapters)
          </button>
        </div>

        {/* Split Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Books List */}
          <div
            className={`w-full md:w-3/5 border-r border-[var(--line)] overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 ${
              step === 'chapters' ? 'hidden md:grid' : 'grid'
            }`}
          >
            {filteredBooks.map((book) => {
              const isSelected = activeBook?.id === book.id;
              return (
                <button
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setStep('chapters');
                  }}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    isSelected
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

          {/* Chapters Grid */}
          <div
            className={`w-full md:w-2/5 overflow-y-auto p-5 bg-[var(--surface)] ${
              step === 'books' ? 'hidden md:block' : 'block'
            }`}
          >
            {activeBook && (
              <div>
                <div className="mb-4 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--green)] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    {activeBook.category} •{' '}
                    {activeBook.testament === 'OT'
                      ? 'Old Testament'
                      : activeBook.testament === 'NT'
                      ? 'New Testament'
                      : activeBook.testament === 'DC'
                      ? 'Deuterocanonical'
                      : 'List of Sixty & Apocrypha'}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--ink)] mt-0.5">
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
                    return (
                      <button
                        key={chNum}
                        onClick={() => {
                          onSelectBookChapter(activeBook.slug, chNum);
                          onClose();
                        }}
                        className={`h-10 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[var(--green)] text-[var(--paper)] shadow-lg ring-2 ring-[var(--green)]'
                            : 'border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--green)] hover:bg-[var(--soft)]'
                        }`}
                      >
                        {chNum}
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
      </div>
    </div>
  );
};
