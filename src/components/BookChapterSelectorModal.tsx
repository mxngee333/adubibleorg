import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { BibleBook } from '../types/bible';

interface BookChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BibleBook[];
  currentBookId: string;
  currentChapter: number;
  uiLanguageCode: string;
  onSelectBookChapter: (bookSlug: string, chapter: number) => void;
}

export const BookChapterSelectorModal: React.FC<BookChapterSelectorModalProps> = ({
  isOpen,
  onClose,
  books,
  currentBookId,
  currentChapter,
  uiLanguageCode,
  onSelectBookChapter,
}) => {
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(
    () => books.find((b) => b.id === currentBookId) || books[0] || null
  );
  const [step, setStep] = useState<'books' | 'chapters'>('books');

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((b) => {
      if (testamentFilter !== 'ALL' && b.testament !== testamentFilter) return false;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-200">
                66 Canonical Books &amp; Chapters Navigator
              </h2>
              <p className="text-xs text-stone-400">
                Bilingual Titles (English + Asante Twi Twerɛ Kronkron + Active Locale)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-stone-800 bg-stone-900/70 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setTestamentFilter('ALL');
                setStep('books');
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                testamentFilter === 'ALL'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              All 66 Books
            </button>
            <button
              onClick={() => {
                setTestamentFilter('OT');
                setStep('books');
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                testamentFilter === 'OT'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              Old Testament (39)
            </button>
            <button
              onClick={() => {
                setTestamentFilter('NT');
                setStep('books');
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                testamentFilter === 'NT'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              New Testament (27)
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setStep('books');
              }}
              placeholder="Search Ephesians, Efesofoɔ, Dwom, Genesis..."
              className="w-full rounded-xl border border-stone-700 bg-stone-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Step Toggle */}
        <div className="flex md:hidden border-b border-stone-800 bg-stone-900/40 px-4 py-2 text-xs">
          <button
            onClick={() => setStep('books')}
            className={`font-bold ${step === 'books' ? 'text-amber-400' : 'text-stone-400'}`}
          >
            1. Select Book ({activeBook?.names.en})
          </button>
          <ChevronRight className="h-4 w-4 mx-1 text-stone-600" />
          <button
            onClick={() => setStep('chapters')}
            className={`font-bold ${step === 'chapters' ? 'text-amber-400' : 'text-stone-400'}`}
          >
            2. Select Chapter ({activeBook?.chapters} Chapters)
          </button>
        </div>

        {/* Split Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Books List */}
          <div
            className={`w-full md:w-3/5 border-r border-stone-800 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 ${
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
                      ? 'border-amber-400 bg-amber-500/15 text-amber-200 shadow'
                      : 'border-stone-800/80 bg-stone-900/50 text-stone-200 hover:border-stone-700 hover:bg-stone-900'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold rounded bg-stone-800 px-1.5 py-0.5 text-amber-400">
                        {book.number}
                      </span>
                      <span className="font-bold text-sm truncate">{book.names.en}</span>
                    </div>
                    <div className="text-[11px] text-amber-300/80 truncate mt-0.5">
                      🇬🇭 {book.names.tw || book.names.en}
                      {uiLanguageCode !== 'en' &&
                      uiLanguageCode !== 'tw' &&
                      book.names[uiLanguageCode]
                        ? ` • ${book.names[uiLanguageCode]}`
                        : ''}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-stone-800/90 px-2 py-1 text-[11px] font-mono text-stone-400">
                    {book.chapters} ch
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chapters Grid */}
          <div
            className={`w-full md:w-2/5 overflow-y-auto p-5 bg-stone-900/30 ${
              step === 'books' ? 'hidden md:block' : 'block'
            }`}
          >
            {activeBook && (
              <div>
                <div className="mb-4 pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    {activeBook.category} • {activeBook.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeBook.names.en} ({activeBook.names.tw})
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
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
                            ? 'bg-amber-500 text-stone-950 shadow-lg ring-2 ring-amber-300'
                            : 'border border-stone-800 bg-stone-900 text-stone-200 hover:border-amber-500/50 hover:bg-amber-500/15 hover:text-amber-300'
                        }`}
                      >
                        {chNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
