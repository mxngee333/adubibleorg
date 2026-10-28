import React, { useState } from 'react';
import {
  X,
  Pin,
  Highlighter,
  Bookmark,
  FileText,
  Trash2,
  ArrowUpRight,
  Plus,
  Download,
  Upload,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  HighlightColor,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VersePin,
} from '../types/bible';

interface StudyVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pins' | 'highlights' | 'bookmarks' | 'notes';
  pins: VersePin[];
  highlights: VerseHighlight[];
  bookmarks: VerseBookmark[];
  notes: VerseNote[];
  onRemovePin: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
  onSaveNote: (note: VerseNote) => void;
  onRemoveNote: (id: string) => void;
  onJumpToVerse: (bookSlug: string, chapter: number, verse: number) => void;
  onImportStudyVault?: (data: {
    pins?: VersePin[];
    highlights?: VerseHighlight[];
    bookmarks?: VerseBookmark[];
    notes?: VerseNote[];
  }) => void;
  currentBookId: string;
  currentBookSlug: string;
  currentChapter: number;
  currentVersionId: string;
}

const COLOR_BADGES: Record<HighlightColor, { label: string; bg: string; dot: string }> = {
  gold: { label: 'Royal Gold', bg: 'bg-amber-500/20 text-amber-200 border-amber-500/40', dot: 'bg-amber-400' },
  emerald: { label: 'Covenant Emerald', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40', dot: 'bg-emerald-400' },
  sapphire: { label: 'Heavenly Sapphire', bg: 'bg-sky-500/20 text-sky-200 border-sky-500/40', dot: 'bg-sky-400' },
  rose: { label: 'Redemption Rose', bg: 'bg-rose-500/20 text-rose-200 border-rose-500/40', dot: 'bg-rose-400' },
  violet: { label: 'Prophetic Violet', bg: 'bg-violet-500/20 text-violet-200 border-violet-500/40', dot: 'bg-violet-400' },
  amber: { label: 'Scroll Amber', bg: 'bg-orange-500/20 text-orange-200 border-orange-500/40', dot: 'bg-orange-400' },
};

export const StudyVaultDrawer: React.FC<StudyVaultDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'pins',
  pins,
  highlights,
  bookmarks,
  notes,
  onRemovePin,
  onRemoveHighlight,
  onRemoveBookmark,
  onSaveNote,
  onRemoveNote,
  onJumpToVerse,
  onImportStudyVault,
  currentBookId,
  currentBookSlug,
  currentChapter,
  currentVersionId,
}) => {
  const [activeTab, setActiveTab] = useState<'pins' | 'highlights' | 'bookmarks' | 'notes'>(initialTab);
  const [colorFilter, setColorFilter] = useState<HighlightColor | 'all'>('all');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteVerseNum, setNoteVerseNum] = useState(1);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteTags, setNoteTags] = useState('Exegesis, Parallel-Study');
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const filteredHighlights =
    colorFilter === 'all'
      ? highlights
      : highlights.filter((h) => h.color === colorFilter);

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteBody.trim()) return;
    const newNote: VerseNote = {
      id: `note-${Date.now()}`,
      verseKey: `${currentBookId}.${currentChapter}.${noteVerseNum}`,
      bookId: currentBookId,
      bookSlug: currentBookSlug,
      chapter: currentChapter,
      verse: noteVerseNum,
      versionId: currentVersionId,
      verseText: `${currentBookSlug.toUpperCase()} ${currentChapter}:${noteVerseNum}`,
      title: noteTitle.trim() || `Study Note on ${currentBookSlug} ${currentChapter}:${noteVerseNum}`,
      body: noteBody.trim(),
      tags: noteTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveNote(newNote);
    setNoteTitle('');
    setNoteBody('');
    setIsCreatingNote(false);
  };

  const handleExportMarkdown = () => {
    const lines: string[] = [
      '# AduBible (Adubible.org) — Personal Exegetical Study Vault',
      '## Honoring the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://nsuhia.com/) · adubible.org',
      '### Dedicated to Humanity · 100% Ads-Free Reading Experience',
      `Exported: ${new Date().toLocaleString()}`,
      '',
      '> "Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ." — Ephesians 1:3',
      '> "For the word of God is living and active, sharper than any two-edged sword..." — Hebrews 4:12',
      '> "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness..." — 2 Timothy 3:16',
      '',
      '## 📌 Pinned Scripture Anchors',
      ...pins.map(
        (p) => `- **${p.verseKey} (${p.versionId.toUpperCase()})**: "${p.text}" — *${p.label || 'Pinned'}*`
      ),
      '',
      '## 🖍️ Highlighted Verses',
      ...highlights.map(
        (h) => `- **[${h.color.toUpperCase()}] ${h.verseKey} (${h.versionId.toUpperCase()})**: "${h.text}"`
      ),
      '',
      '## 🔖 Bookmarks',
      ...bookmarks.map(
        (b) => `- **[${b.folder}] ${b.verseKey} (${b.versionId.toUpperCase()})**: "${b.text}"`
      ),
      '',
      '## 📝 Exegetical Study Notes',
      ...notes.map(
        (n) =>
          `### ${n.title} (${n.verseKey})\n> ${n.verseText}\n\n${n.body}\n\n*Tags: ${n.tags.join(', ')}*\n`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adubible-study-notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportStudyVault) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImportStudyVault(parsed);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        // ignore invalid json
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--soft)] border border-[var(--line)] text-[var(--green)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                Personal Study &amp; Sync Vault
              </h2>
              <p className="text-xs text-[var(--subtle)]">
                Pins • Highlights • Bookmarks • Exegetical Notes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              title="Export Study Notes as Markdown"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--soft)] transition"
            >
              <Download className="h-3.5 w-3.5 text-[var(--green)]" />
              <span className="hidden sm:inline">Export MD</span>
            </button>
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--soft)] transition">
              {importSuccess ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Upload className="h-3.5 w-3.5 text-sky-400" />
              )}
              <span className="hidden sm:inline">{importSuccess ? 'Restored' : 'Import'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)] transition"
              aria-label="Close vault"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 border-b border-[var(--line)] bg-[var(--surface)] p-2">
          <button
            onClick={() => setActiveTab('pins')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'pins'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow'
                : 'text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Pin className="h-3.5 w-3.5" />
            <span>Pins ({pins.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'highlights'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow'
                : 'text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span>Highlights ({highlights.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'bookmarks'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow'
                : 'text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'notes'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow'
                : 'text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Notes ({notes.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'pins' && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--subtle)]">
                Pinned verses stay docked in your quick study bar so you can cross-compare passages effortlessly.
              </p>
              {pins.length === 0 ? (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--subtle)]">
                  No pinned verses yet. Tap any verse in the reader and click <strong>Pin</strong> to anchor it!
                </div>
              ) : (
                pins.map((pin) => (
                  <div
                    key={pin.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--green)] transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--soft)] px-2 py-0.5 text-xs font-bold text-[var(--green)] border border-[var(--line)]">
                          <Pin className="h-3 w-3" />
                          {pin.verseKey}
                        </span>
                        <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2 py-0.5 text-[11px] font-mono uppercase text-[var(--subtle)]">
                          {pin.versionId}
                        </span>
                        {pin.label && (
                          <span className="text-xs text-[var(--green)] font-medium">
                            • {pin.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onJumpToVerse(pin.bookSlug, pin.chapter, pin.verse);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--soft)] px-2.5 py-1 text-xs font-semibold text-[var(--green)] hover:opacity-80 transition"
                        >
                          Open <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onRemovePin(pin.id)}
                          className="rounded-lg p-1 text-[var(--subtle)] hover:bg-rose-950/50 hover:text-rose-400 transition"
                          title="Unpin verse"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-serif text-sm leading-relaxed text-[var(--ink)]">
                      &ldquo;{pin.text}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'highlights' && (
            <div className="space-y-4">
              {/* Color Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setColorFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    colorFilter === 'all'
                      ? 'bg-[var(--green)] text-[var(--paper)]'
                      : 'bg-[var(--surface)] text-[var(--subtle)] border border-[var(--line)] hover:text-[var(--ink)]'
                  }`}
                >
                  All Colors ({highlights.length})
                </button>
                {(Object.keys(COLOR_BADGES) as HighlightColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColorFilter(c)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      colorFilter === c
                        ? COLOR_BADGES[c].bg
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${COLOR_BADGES[c].dot}`} />
                    <span className="capitalize">{c}</span>
                  </button>
                ))}
              </div>

              {filteredHighlights.length === 0 ? (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--subtle)]">
                  No highlighted verses match this filter. Tap any verse in the reader to apply a highlight color!
                </div>
              ) : (
                filteredHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    className={`rounded-xl border p-4 transition ${COLOR_BADGES[hl.color].bg}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${COLOR_BADGES[hl.color].dot}`} />
                        <span className="text-xs font-bold">{hl.verseKey}</span>
                        <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-mono uppercase">
                          {hl.versionId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onJumpToVerse(hl.bookSlug, hl.chapter, hl.verse);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-black/30 px-2.5 py-1 text-xs font-semibold hover:bg-black/50 transition"
                        >
                          Jump <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveHighlight(hl.id)}
                          className="rounded-lg p-1 opacity-70 hover:opacity-100 transition"
                          title="Remove highlight"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`font-serif text-sm leading-relaxed ${
                        hl.underline ? 'underline decoration-2 underline-offset-4' : ''
                      }`}
                    >
                      &ldquo;{hl.text}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--subtle)]">
                  No bookmarks saved yet. Tap any verse and select <strong>Bookmark</strong> to organize your favorite scriptures.
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--green)] transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--soft)] border border-[var(--line)] px-2 py-0.5 text-xs font-bold text-[var(--green)]">
                          <Bookmark className="h-3 w-3" />
                          {bm.verseKey}
                        </span>
                        <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--subtle)]">
                          {bm.folder}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onJumpToVerse(bm.bookSlug, bm.chapter, bm.verse);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--soft)] px-2.5 py-1 text-xs font-semibold text-[var(--green)] hover:opacity-80 transition"
                        >
                          Open <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveBookmark(bm.id)}
                          className="rounded-lg p-1 text-[var(--subtle)] hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-serif text-sm leading-relaxed text-[var(--ink)]">
                      &ldquo;{bm.text}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--subtle)]">
                  Write deep theological &amp; parallel language reflections linked to any verse.
                </p>
                <button
                  onClick={() => setIsCreatingNote(!isCreatingNote)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--green)] px-3 py-1.5 text-xs font-bold text-[var(--paper)] hover:opacity-90 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Study Note
                </button>
              </div>

              {isCreatingNote && (
                <form
                  onSubmit={handleCreateNoteSubmit}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--green)] uppercase">
                      New Note for {currentBookSlug.toUpperCase()} {currentChapter}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[var(--subtle)]">Verse #:</label>
                      <input
                        type="number"
                        min={1}
                        max={176}
                        value={noteVerseNum}
                        onChange={(e) => setNoteVerseNum(Number(e.target.value) || 1)}
                        className="w-16 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-xs text-[var(--ink)]"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Exegetical Note Title (e.g., Greek Eulogia & Twi Nhyira)"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] placeholder-[var(--subtle)] focus:border-[var(--green)] focus:outline-none"
                    required
                  />
                  <textarea
                    rows={4}
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder="Write your theological insights, Strong's word links, or parallel translation comparisons..."
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-xs text-[var(--ink)] placeholder-[var(--subtle)] focus:border-[var(--green)] focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="Comma-separated tags (e.g. Ephesians, Twi, Strongs)"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] placeholder-[var(--subtle)] focus:border-[var(--green)] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNote(false)}
                      className="rounded-lg px-3 py-1.5 text-xs text-[var(--subtle)] hover:text-[var(--ink)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[var(--green)] px-4 py-1.5 text-xs font-bold text-[var(--paper)] hover:opacity-90"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              )}

              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                          {note.verseKey}
                        </span>
                        <h4 className="font-bold text-sm text-[var(--green)]">{note.title}</h4>
                      </div>
                      <p className="text-xs italic text-[var(--subtle)] mt-1 line-clamp-2">
                        &ldquo;{note.verseText}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onJumpToVerse(note.bookSlug, note.chapter, note.verse);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--soft)] px-2.5 py-1 text-xs font-semibold text-[var(--green)] hover:opacity-80 transition"
                      >
                        Open <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveNote(note.id)}
                        className="rounded-lg p-1 text-[var(--subtle)] hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink)] whitespace-pre-line">
                    {note.body}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--soft)] border border-[var(--line)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--green)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
