import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Search,
  Sparkles,
  Globe2,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { StrongsLexiconEntry } from '../types/bible';

interface StrongsPopoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEntry: StrongsLexiconEntry | null;
  allEntries: Record<string, StrongsLexiconEntry>;
  onSelectEntry: (code: string) => void;
  onNavigateReference?: (refString: string) => void;
}

export const StrongsPopoverModal: React.FC<StrongsPopoverModalProps> = ({
  isOpen,
  onClose,
  selectedEntry,
  allEntries,
  onSelectEntry,
  onNavigateReference,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const entriesList = useMemo(() => Object.values(allEntries), [allEntries]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entriesList.slice(0, 24);
    return entriesList.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.transliteration.toLowerCase().includes(q) ||
        e.originalWord.toLowerCase().includes(q) ||
        e.shortDefinition.toLowerCase().includes(q) ||
        e.fullDefinition.toLowerCase().includes(q) ||
        (e.twiEquivalent && e.twiEquivalent.toLowerCase().includes(q))
    );
  }, [entriesList, searchQuery]);

  if (!isOpen) return null;

  const active = selectedEntry || filteredEntries[0] || entriesList[0];

  const handleSpeakPronunciation = (entry: StrongsLexiconEntry) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    const utter = new SpeechSynthesisUtterance(
      `${entry.transliteration}. ${entry.shortDefinition}`
    );
    utter.rate = 0.9;
    utter.lang = 'en-US';
    (window as any).__strongsUtterance = utter;
    utter.onend = () => {
      (window as any).__strongsUtterance = null;
    };
    utter.onerror = () => {
      (window as any).__strongsUtterance = null;
    };
    try {
      window.speechSynthesis.speak(utter);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  };

  const handleCopyEntry = (entry: StrongsLexiconEntry) => {
    const text = `Strong's ${entry.code} (${entry.originalWord} - ${entry.transliteration} [${entry.phonetic}]): ${entry.shortDefinition}\n${entry.fullDefinition}\nTwi Equivalent: ${entry.twiEquivalent || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[90vh] rounded-2xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        {/* Left Sidebar: Strong's Concordance Search */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-stone-800 bg-stone-900/60 flex flex-col max-h-56 md:max-h-none">
          <div className="p-3.5 border-b border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Strong&apos;s Concordance
              </span>
              <span className="text-[11px] text-stone-400">{entriesList.length} Lexicon Keys</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search G2128, H430, grace, nhyira..."
                className="w-full rounded-xl border border-stone-700 bg-stone-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60">
            {filteredEntries.map((item) => {
              const isSelected = active && active.code === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => onSelectEntry(item.code)}
                  className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-l-2 border-amber-400 text-amber-200'
                      : 'hover:bg-stone-800/60 text-stone-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.language === 'Hebrew'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {item.code}
                      </span>
                      <span className="text-sm font-serif font-semibold truncate">
                        {item.originalWord}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 truncate mt-0.5">
                      <span className="italic text-stone-300">{item.transliteration}</span> —{' '}
                      {item.shortDefinition}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main View: Detailed Lexicon Breakdown */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/30 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  active?.language === 'Hebrew'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                }`}
              >
                {active?.code} • {active?.language} Lexicon
              </span>
              <span className="text-xs text-stone-400 hidden sm:inline">
                {active?.partOfSpeech}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {active && (
                <button
                  onClick={() => handleCopyEntry(active)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-xs text-stone-300 hover:bg-stone-800 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-amber-400" />
                      Copy Lexicon
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
                aria-label="Close lexicon"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {active ? (
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Hero Word Card */}
              <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-stone-900 via-stone-900/90 to-amber-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-200 tracking-wide">
                    {active.originalWord}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-stone-300">
                    <span className="font-semibold text-white">{active.transliteration}</span>
                    <span className="text-stone-500">•</span>
                    <span className="font-mono text-xs text-amber-300/90">
                      [{active.phonetic}]
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="rounded-md bg-stone-800 px-2 py-0.5 text-xs text-stone-300">
                      {active.partOfSpeech}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSpeakPronunciation(active)}
                  className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl bg-amber-500/20 border border-amber-400/40 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition"
                >
                  <Volume2 className="h-4 w-4 text-amber-400" />
                  Pronounce
                </button>
              </div>

              {/* Primary Gloss & Twi Equivalent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Primary Definition (Gloss)
                  </div>
                  <div className="text-base font-bold text-white">
                    {active.shortDefinition}
                  </div>
                  <div className="mt-2 text-xs text-stone-400">
                    <strong className="text-stone-300">Root / Etymology:</strong> {active.rootWord}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5" />
                    Asante Twi (Twerɛ Kronkron) Resonance
                  </div>
                  <div className="text-base font-bold text-amber-200">
                    {active.twiEquivalent || 'Kronkron / Nyankopɔn Asɛm'}
                  </div>
                  <div className="mt-2 text-xs text-stone-400">
                    Occurrences in Canon: <strong className="text-amber-300">{active.occurrences}x</strong>
                  </div>
                </div>
              </div>

              {/* Exhaustive Strong's & BDB / Thayer's Definition */}
              <div className="space-y-3">
                <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Strong&apos;s Exhaustive Definition
                  </h4>
                  <p className="text-sm leading-relaxed text-stone-200">
                    {active.fullDefinition}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5">
                    {active.language === 'Hebrew'
                      ? 'Brown-Driver-Briggs (BDB) Hebrew Lexicon'
                      : "Thayer's Greek-English Lexicon of the NT"}
                  </h4>
                  <p className="text-sm leading-relaxed text-stone-300">
                    {active.bdbOrThayer}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                    Authorized KJV / NKJV Translation Usage
                  </h4>
                  <p className="text-xs leading-relaxed text-stone-300">
                    {active.kjvUsage}
                  </p>
                </div>
              </div>

              {/* Key Concordance Occurrences */}
              {active.keyVerses && active.keyVerses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Key Scriptural Occurrences
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {active.keyVerses.map((ref) => (
                      <button
                        key={ref}
                        onClick={() => {
                          if (onNavigateReference) {
                            onNavigateReference(ref);
                            onClose();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-medium text-amber-300 hover:border-amber-500/50 hover:bg-stone-800 transition"
                      >
                        <span>{ref}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
