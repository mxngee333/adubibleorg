import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Link2,
  ChevronRight,
  ScrollText,
  Layers,
} from 'lucide-react';
import { CommentarySource, VerseCommentary, ReadingTheme } from '../types/bible';

interface CommentaryPanelProps {
  bookId: string;
  bookName: string;
  chapter: number;
  selectedVerse: number;
  selectedVerseText: string;
  sources: CommentarySource[];
  bundledCommentaries: VerseCommentary[];
  onSelectStrongCode?: (code: string) => void;
  onJumpToReference?: (ref: string) => void;
  themeMode: ReadingTheme;
}

export const CommentaryPanel: React.FC<CommentaryPanelProps> = ({
  bookId,
  bookName,
  chapter,
  selectedVerse,
  selectedVerseText,
  sources,
  bundledCommentaries,
  onSelectStrongCode,
  onJumpToReference,
  themeMode,
}) => {
  const [activeSourceId, setActiveSourceId] = useState<string>('all');
  const [liveCommentaries, setLiveCommentaries] = useState<VerseCommentary[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);

  // Fetch live open-source commentaries from Free Use Bible API if available
  useEffect(() => {
    let cancelled = false;
    const fetchLiveCommentary = async () => {
      setLoadingLive(true);
      try {
        const res = await fetch(
          `https://bible.helloao.org/api/c/matthew-henry/${bookId}/${chapter}.json`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.chapter?.content) return;
        const extracted: VerseCommentary[] = [];
        for (const item of data.chapter.content) {
          if (item.type === 'verse' && Array.isArray(item.content)) {
            const text = item.content
              .map((c: unknown) => (typeof c === 'string' ? c : (c as { text?: string })?.text || ''))
              .join(' ')
              .trim();
            if (text) {
              extracted.push({
                sourceId: 'matthew-henry',
                sourceName: "Matthew Henry's Complete Commentary (Live Stream)",
                author: 'Matthew Henry (1706)',
                bookId,
                chapter,
                verse: item.number || 1,
                content: text,
              });
            }
          }
        }
        if (!cancelled) {
          setLiveCommentaries(extracted);
        }
      } catch {
        // Offline or unavailable; bundled commentaries will still render
      } finally {
        if (!cancelled) setLoadingLive(false);
      }
    };
    fetchLiveCommentary();
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter]);

  // Combine bundled + live without duplicates
  const combinedCommentaries = React.useMemo(() => {
    const list = [...bundledCommentaries];
    for (const live of liveCommentaries) {
      const exists = list.some(
        (b) =>
          b.sourceId === live.sourceId &&
          b.bookId === live.bookId &&
          b.chapter === live.chapter &&
          b.verse === live.verse
      );
      if (!exists) {
        list.push(live);
      }
    }
    return list;
  }, [bundledCommentaries, liveCommentaries]);

  const verseSpecific = combinedCommentaries.filter(
    (c) =>
      c.bookId === bookId &&
      c.chapter === chapter &&
      (c.verse === selectedVerse || c.verse === 0) &&
      (activeSourceId === 'all' || c.sourceId === activeSourceId)
  );

  const chapterOtherVerses = combinedCommentaries.filter(
    (c) =>
      c.bookId === bookId &&
      c.chapter === chapter &&
      c.verse !== selectedVerse &&
      (activeSourceId === 'all' || c.sourceId === activeSourceId)
  );

  const isLight =
    themeMode === 'parchment' ||
    themeMode === 'daylight' ||
    themeMode === 'lilac-light';

  // Helper to make Strong's codes like G2128 or H430 clickable inside commentary text
  const renderFormattedCommentary = (text: string) => {
    const parts = text.split(/\b([GH]\d{1,4})\b/g);
    return parts.map((part, idx) => {
      if (/^[GH]\d{1,4}$/.test(part) && onSelectStrongCode) {
        return (
          <button
            key={idx}
            onClick={() => onSelectStrongCode(part)}
            className="mx-0.5 inline-flex items-center rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 transition"
          >
            {part}
          </button>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <section
      className={`rounded-2xl border p-4 sm:p-6 transition ${
        isLight
          ? 'border-amber-900/20 bg-amber-50/70 text-stone-900 shadow-sm'
          : 'border-stone-800 bg-stone-900/60 text-stone-100'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Open-Source Exegetical Commentaries &amp; Cross-References
            </h3>
            <p className="text-xs opacity-70">
              Active Focus: <strong>{bookName} {chapter}:{selectedVerse}</strong> • Matthew Henry • JFB • John Gill • Geneva • TSK
            </p>
          </div>
        </div>

        {loadingLive && (
          <span className="text-xs font-medium text-amber-500 animate-pulse">
            Syncing open-source commentary stream...
          </span>
        )}
      </div>

      {/* Commentary Source Filter Tabs */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveSourceId('all')}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
            activeSourceId === 'all'
              ? 'bg-amber-500 text-stone-950 shadow'
              : isLight
              ? 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          All Commentaries
        </button>
        {sources.map((src) => (
          <button
            key={src.id}
            onClick={() => setActiveSourceId(src.id)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeSourceId === src.id
                ? 'bg-amber-500 text-stone-950 shadow'
                : isLight
                ? 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {src.shortName}
          </button>
        ))}
      </div>

      {/* Active Verse Exegetical Synthesis */}
      <div className="mt-4 space-y-4">
        <div
          className={`rounded-xl border p-3.5 ${
            isLight
              ? 'border-amber-900/15 bg-white/80'
              : 'border-amber-500/20 bg-stone-950/70'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            Focused Verse Text ({bookName} {chapter}:{selectedVerse})
          </div>
          <p className="font-serif text-sm sm:text-base italic leading-relaxed">
            &ldquo;{selectedVerseText}&rdquo;
          </p>
        </div>

        {verseSpecific.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {verseSpecific.map((item, i) => (
              <div
                key={`${item.sourceId}-${item.verse}-${i}`}
                className={`rounded-xl border p-4 flex flex-col justify-between transition ${
                  isLight
                    ? 'border-stone-300/80 bg-white shadow-xs'
                    : 'border-stone-800 bg-stone-950/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <BookOpen className="h-3.5 w-3.5" />
                      {item.sourceName}
                    </span>
                    <span className="text-[11px] opacity-60">
                      {bookName} {chapter}:{item.verse}
                    </span>
                  </div>
                  {item.title && (
                    <h4 className="font-bold text-sm mb-1.5 text-amber-800 dark:text-amber-200">
                      {item.title}
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 whitespace-pre-line">
                    {renderFormattedCommentary(item.content)}
                  </p>
                </div>

                {item.crossReferences && item.crossReferences.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-current/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5 flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      Treasury of Scripture Knowledge (TSK) Cross-References
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.crossReferences.map((cr) => (
                        <button
                          key={cr}
                          onClick={() => onJumpToReference && onJumpToReference(cr)}
                          className="inline-flex items-center gap-1 rounded-md border border-current/15 px-2 py-0.5 text-[11px] font-medium hover:border-amber-500 hover:text-amber-500 transition"
                        >
                          <span>{cr}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-xl border p-4 ${
              isLight ? 'border-stone-300 bg-white' : 'border-stone-800 bg-stone-950'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
              <Sparkles className="h-4 w-4" />
              Elohim Exegetical &amp; Parallel Synthesis ({bookName} {chapter}:{selectedVerse})
            </div>
            <p className="text-xs sm:text-sm leading-relaxed opacity-85">
              In {bookName} {chapter}:{selectedVerse}, examine the parallel rendering across your active language panes above. Click any highlighted Strong&apos;s number in the interlinear ribbon to inspect the original Hebrew (Masoretic WLC) or Greek (Textus Receptus) root morphology, or switch verses to view specific historical expositions from Matthew Henry, Jamieson-Fausset-Brown, and John Gill.
            </p>
          </div>
        )}

        {/* Additional Chapter Exegetical Notes */}
        {chapterOtherVerses.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2.5">
              More Verse Commentaries in {bookName} Chapter {chapter}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {chapterOtherVerses.slice(0, 14).map((item, idx) => (
                <div
                  key={`${item.sourceId}-other-${item.verse}-${idx}`}
                  className={`rounded-xl border p-3 text-xs ${
                    isLight
                      ? 'border-stone-200 bg-white/70'
                      : 'border-stone-800/80 bg-stone-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-amber-600 dark:text-amber-400">
                      Verse {item.verse} • {item.sourceName}
                    </span>
                  </div>
                  <p className="line-clamp-3 opacity-85 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
