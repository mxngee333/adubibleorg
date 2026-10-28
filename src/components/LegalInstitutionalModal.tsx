import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  BookOpen,
  Scale,
  HelpCircle,
  Sparkles,
  FileText,
  Bookmark,
  Library,
  Mail,
  Cookie,
  Printer,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { LEGAL_PAGES_CORPUS, LegalPageData } from '../data/legalPagesCorpus';

export type LegalPageKey =
  | 'about'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'cookie-policy'
  | 'how-to-use'
  | 'editorial-policy'
  | 'glossary'
  | 'sources';

interface LegalInstitutionalModalProps {
  isOpen: boolean;
  initialPage?: LegalPageKey;
  onClose: () => void;
}

const TAB_CONFIG: Array<{
  key: LegalPageKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'about', label: 'About & Legacy', icon: BookOpen },
  { key: 'privacy', label: 'Privacy Policy', icon: Shield },
  { key: 'terms', label: 'Terms of Service', icon: Scale },
  { key: 'contact', label: 'Contact Us', icon: Mail },
  { key: 'cookie-policy', label: 'Cookie Policy', icon: Cookie },
  { key: 'how-to-use', label: 'How to Use', icon: HelpCircle },
  { key: 'editorial-policy', label: 'Editorial Policy', icon: FileText },
  { key: 'glossary', label: 'Glossary', icon: Bookmark },
  { key: 'sources', label: 'Sources & Archives', icon: Library },
];

export const LegalInstitutionalModal: React.FC<LegalInstitutionalModalProps> = ({
  isOpen,
  initialPage = 'about',
  onClose,
}) => {
  const [page, setPage] = useState<LegalPageKey>(initialPage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialPage) {
      setPage(initialPage);
    }
  }, [initialPage, isOpen]);

  const pageData: LegalPageData =
    LEGAL_PAGES_CORPUS[page] || LEGAL_PAGES_CORPUS['about'];

  const handleTabChange = (nextKey: LegalPageKey) => {
    setPage(nextKey);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${nextKey}/`);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `https://adubible.org/${page}/`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-amber-500/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Masthead */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900/90 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="h-5 w-5 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <h2
                id="legal-modal-title"
                className="text-sm sm:text-base font-bold text-amber-200 font-serif truncate"
              >
                AduBible (Adubible.org) — Institutional Trust, Heritage &amp; Standards
              </h2>
              <div className="text-[11px] text-stone-400 truncate">
                Dedicated to Humanity · Memorial of Apostle Kwame Adu · Nsuhia, Ghana
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-stone-400 hover:bg-stone-800 hover:text-amber-300 transition"
              title="Copy link to this page"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-stone-400 hover:bg-stone-800 hover:text-white transition"
              title="Print document"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition ml-1"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Ribbon */}
        <div className="flex items-center gap-1.5 border-b border-stone-800 bg-stone-900/60 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none text-xs">
          {TAB_CONFIG.map((t) => {
            const Icon = t.icon;
            const isActive = page === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabChange(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md ring-1 ring-amber-400'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 text-sm leading-relaxed text-stone-300">
          {/* Page Header Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5 space-y-3 font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-amber-400">
                {pageData.badge}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Dedicated to Humanity
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  100% Ads-Free
                </span>
                <span className="text-[11px] text-stone-400">
                  Updated: {pageData.lastUpdated}
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-white tracking-wide">
              {pageData.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300">
              {pageData.metaDescription}
            </p>
          </div>

          {/* Render Sections */}
          <div className="space-y-6">
            {pageData.sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 sm:p-6 space-y-3"
              >
                <h3 className="text-base sm:text-lg font-bold text-amber-300 font-serif border-b border-stone-800/80 pb-2">
                  {sec.heading}
                </h3>
                <div className="text-stone-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-serif">
                  {sec.content.split('\n\n').map((para, pIdx) => {
                    // Check if paragraph has email obfuscation patterns
                    const hasEmail = para.includes('[at]adubible.org');
                    if (hasEmail) {
                      return (
                        <p key={pIdx} className="mb-2">
                          {para.split(/([a-zA-Z0-9._-]+\[at\][a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g).map((chunk, cIdx) => {
                            if (chunk.includes('[at]')) {
                              const realEmail = chunk.replace('[at]', '@');
                              return (
                                <a
                                  key={cIdx}
                                  href={`mailto:${realEmail}`}
                                  className="text-amber-400 underline font-mono hover:text-amber-300 font-semibold"
                                  title={`Click to email ${realEmail}`}
                                >
                                  {chunk}
                                </a>
                              );
                            }
                            return chunk;
                          })}
                        </p>
                      );
                    }
                    return (
                      <p key={pIdx} className="mb-2">
                        {para}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Institutional Heritage Footer Banner */}
          <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <strong className="text-stone-200">AduBible.org</strong> · Dedicated to Humanity in Honor of the Ministry of Apostle Kwame Adu · Nsuhia, Ghana.
            </div>
            <a
              href="https://nsuhia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline font-medium"
            >
              <span>Nsuhia Community Heritage</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-stone-800 bg-stone-900 px-4 sm:px-6 py-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>Canonical Link:</span>
            <code className="text-amber-300 font-mono">https://adubible.org/{page}/</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-1.5 font-bold transition"
          >
            ← Return to Scripture Reader
          </button>
        </div>
      </div>
    </div>
  );
};
