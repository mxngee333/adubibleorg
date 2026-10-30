import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  Compass,
} from 'lucide-react';
import {
  getAllTopicalHubs,
  getTopicalHubBySlug,
  TopicalHubEntry,
} from '../data/topicalScriptureCorpus';

interface TopicalScriptureHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicSlug?: string | null;
  onNavigateChapter?: (bookSlug: string, chapter: number) => void;
}

export const TopicalScriptureHubModal: React.FC<TopicalScriptureHubModalProps> = ({
  isOpen,
  onClose,
  initialTopicSlug,
  onNavigateChapter,
}) => {
  const allHubs = useMemo(() => getAllTopicalHubs(), []);
  const [activeSlug, setActiveSlug] = useState<string>(
    initialTopicSlug || allHubs[0]?.slug || 'healing'
  );
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const activeHub: TopicalHubEntry = useMemo(
    () => getTopicalHubBySlug(activeSlug) || allHubs[0],
    [activeSlug, allHubs]
  );

  if (!isOpen) return null;

  const handleCopyVerse = (ref: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} — ${ref} (AduBible.org®)`);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const handlePlayVoicePreview = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.88;
      utter.pitch = 0.95;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0d1310] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 167, 44, 0.15)',
        }}
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-[#121a15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
              {activeHub.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Topical Scripture Hubs
                </span>
                <span className="text-xs text-stone-400">10 Life Themes</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100 line-clamp-1">
                {activeHub.h1}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
            title="Close Topics Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 overflow-x-auto bg-[#0a0f0c] border-b border-stone-800/80 scrollbar-thin">
          {allHubs.map((hub) => {
            const isSelected = hub.slug === activeSlug;
            return (
              <button
                key={hub.slug}
                onClick={() => {
                  setActiveSlug(hub.slug);
                  setExpandedFaqIndex(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-stone-800'
                }`}
              >
                <span>{hub.icon}</span>
                <span>{hub.slug.charAt(0).toUpperCase() + hub.slug.slice(1)}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 text-stone-300">
          {/* Banner Hero */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/30 via-emerald-950/20 to-stone-950 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
              Divine Promise & Covenant Heritage
            </p>
            <p className="text-base sm:text-lg font-serif italic text-amber-100/90 leading-relaxed">
              "{activeHub.tagline}"
            </p>
          </div>

          {/* Theological Exposition */}
          <div className="space-y-3 bg-[#111713] p-4 sm:p-5 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Theological Context & Scriptural Exegesis
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed font-sans">
              {activeHub.historicalExposition}
            </p>
            <div className="pt-2 border-t border-stone-800/60 text-xs text-amber-200/80 font-mono">
              {activeHub.hebrewGreekRoots}
            </div>
          </div>

          {/* Curated Scripture Verses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Foundational Parallel Scriptures ({activeHub.verses.length})
              </h3>
              <span className="text-[11px] text-stone-400">NKJV • KJV • Asante Twi</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeHub.verses.map((verse, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-xl bg-[#131b16] border border-amber-500/15 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-serif font-bold text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {verse.reference}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlayVoicePreview(verse.nkjv)}
                        className="p-1.5 rounded-lg bg-stone-800/60 hover:bg-amber-500/20 text-stone-300 hover:text-amber-400 transition-colors"
                        title="Listen to 24kHz Audio Voice"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyVerse(verse.reference, verse.nkjv)}
                        className="p-1.5 rounded-lg bg-stone-800/60 hover:bg-amber-500/20 text-stone-300 hover:text-amber-400 transition-colors"
                        title="Copy Scripture"
                      >
                        {copiedRef === verse.reference ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NKJV Primary */}
                  <div className="text-sm sm:text-base font-serif text-stone-100 leading-relaxed">
                    <span className="text-[10px] font-bold font-sans text-amber-500 uppercase mr-2 px-1.5 py-0.5 rounded bg-amber-500/10">
                      NKJV
                    </span>
                    {verse.nkjv}
                  </div>

                  {/* KJV Translation */}
                  <div className="text-xs sm:text-sm font-serif text-stone-300/80 leading-relaxed pt-1 border-t border-stone-800/60">
                    <span className="text-[10px] font-bold font-sans text-stone-400 uppercase mr-2 px-1.5 py-0.5 rounded bg-stone-800/80">
                      KJV
                    </span>
                    {verse.kjv}
                  </div>

                  {/* Asante Twi Translation */}
                  <div className="text-xs sm:text-sm font-serif text-emerald-300/80 leading-relaxed pt-1 border-t border-stone-800/60">
                    <span className="text-[10px] font-bold font-sans text-emerald-400 uppercase mr-2 px-1.5 py-0.5 rounded bg-emerald-500/10">
                      TWI
                    </span>
                    {verse.twi}
                  </div>

                  {/* Strong's Root Notes & Direct Navigation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/60 text-xs text-stone-400">
                    <span className="italic">{verse.strongsNotes}</span>
                    {onNavigateChapter && (
                      <button
                        onClick={() => {
                          onNavigateChapter(verse.bookSlug, verse.chapter);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <span>Open in 4-Column Parallel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theological FAQs */}
          {activeHub.faqs && activeHub.faqs.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                Frequently Asked Exegetical Questions
              </h3>
              <div className="space-y-2">
                {activeHub.faqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-stone-800 rounded-xl overflow-hidden bg-[#101712]"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-xs sm:text-sm font-semibold text-stone-200 hover:text-amber-300 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 transition-transform ${
                            isExpanded ? 'rotate-180 text-amber-400' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 text-xs sm:text-sm text-stone-400 leading-relaxed border-t border-stone-800/80 pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-800 bg-[#0d1310] text-xs text-stone-400">
          <span>AduBible.org® · 100% Ad-Free Scripture Sanctuary</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
