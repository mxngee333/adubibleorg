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
  Award,
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
  { key: 'about', label: 'Institutional Charter', icon: BookOpen },
  { key: 'privacy', label: 'Privacy Policy', icon: Shield },
  { key: 'terms', label: 'Terms of Service', icon: Scale },
  { key: 'contact', label: 'Secretariat Directory', icon: Mail },
  { key: 'cookie-policy', label: 'Storage & Cookies', icon: Cookie },
  { key: 'how-to-use', label: 'Exegetical Manual', icon: HelpCircle },
  { key: 'editorial-policy', label: 'Textual Protocol', icon: FileText },
  { key: 'glossary', label: 'Theological Glossary', icon: Bookmark },
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

  // Render text blocks: handles Markdown tables, email obfuscation, bold text, and paragraphs
  const renderFormattedBlock = (block: string, idx: number) => {
    const lines = block.trim().split('\n');

    // Check if block is a Markdown table
    if (lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|')) {
      const headerCols = lines[0]
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      const rowLines = lines.slice(2).filter((l) => l.trim().startsWith('|'));

      return (
        <div key={idx} className="my-4 overflow-x-auto rounded-xl border border-[var(--line)] shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                {headerCols.map((col, hIdx) => (
                  <th key={hIdx} className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px]">
                    {col.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] bg-[var(--paper)]">
              {rowLines.map((rowStr, rIdx) => {
                const cols = rowStr
                  .split('|')
                  .map((c) => c.trim())
                  .filter(Boolean);
                return (
                  <tr key={rIdx} className="hover:bg-[var(--surface)] transition-colors">
                    {cols.map((colVal, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 text-[var(--ink)] leading-normal">
                        {colVal.startsWith('**') && colVal.endsWith('**') ? (
                          <strong className="font-bold text-[var(--green)]">
                            {colVal.replace(/\*\*/g, '')}
                          </strong>
                        ) : (
                          colVal
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Normal paragraph rendering with email obfuscation
    const hasEmail = block.includes('[at]adubible.org');
    if (hasEmail) {
      return (
        <p key={idx} className="mb-3 leading-relaxed text-[var(--ink)] opacity-90">
          {block.split(/([a-zA-Z0-9._-]+\[at\][a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g).map((chunk, cIdx) => {
            if (chunk.includes('[at]')) {
              const realEmail = chunk.replace('[at]', '@');
              return (
                <a
                  key={cIdx}
                  href={`mailto:${realEmail}`}
                  className="font-mono font-semibold underline text-[var(--green)] hover:opacity-80 transition"
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
      <p key={idx} className="mb-3 leading-relaxed text-[var(--ink)] opacity-90">
        {block}
      </p>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Masthead */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Award className="h-5 w-5 shrink-0 text-[var(--green)]" />
            <div className="min-w-0">
              <h2
                id="legal-modal-title"
                className="text-sm sm:text-base font-bold text-[var(--ink)] font-serif truncate"
              >
                AduBible (adubible.org) — Institutional Governance, Heritage &amp; Commons
              </h2>
              <div className="text-[11px] text-[var(--subtle)] truncate">
                Apostle Kwame Adu Gospel Center · Domiciled in Nsuhia, Bono Region, Ghana
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)] transition border border-[var(--line)]"
              title="Copy link to this document"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--green)]" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)] transition border border-[var(--line)]"
              title="Print institutional document"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--subtle)] hover:bg-[var(--soft)] hover:text-[var(--ink)] transition ml-1 border border-[var(--line)]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Ribbon */}
        <div className="flex items-center gap-1.5 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none text-xs">
          {TAB_CONFIG.map((t) => {
            const Icon = t.icon;
            const isActive = page === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabChange(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-[var(--green)] text-[var(--paper)] border-[var(--green)] shadow-sm'
                    : 'text-[var(--subtle)] border-transparent hover:bg-[var(--soft)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 text-sm leading-relaxed text-[var(--ink)]">
          {/* Page Header Folio */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 space-y-3 font-sans shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--green)]">
                {pageData.badge}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--soft)] border border-[var(--line)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                  Dedicated to Humanity
                </span>
                <span className="rounded-full bg-[var(--soft)] border border-[var(--line)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--green)]">
                  100% Ads-Free
                </span>
                <span className="text-[11px] text-[var(--subtle)]">
                  Updated: {pageData.lastUpdated}
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[var(--ink)] tracking-wide">
              {pageData.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--subtle)] leading-relaxed">
              {pageData.metaDescription}
            </p>
          </div>

          {/* Render Sections */}
          <div className="space-y-6">
            {pageData.sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6 space-y-3"
              >
                <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] font-serif border-b border-[var(--line)] pb-2 flex items-center justify-between">
                  <span>{sec.heading}</span>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-[var(--subtle)] font-normal">
                    Statutory Clause
                  </span>
                </h3>
                <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-serif">
                  {sec.content.split('\n\n').map((block, bIdx) => renderFormattedBlock(block, bIdx))}
                </div>
              </section>
            ))}
          </div>

          {/* Institutional Heritage & Domicile Seal */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-xs text-[var(--subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-[var(--green)] shrink-0" />
              <div>
                <strong className="text-[var(--ink)]">AduBible.org</strong> · Ministry of Apostle Kwame Adu · Domiciled at Nsuhia, Bono Region, Ghana.
              </div>
            </div>
            <a
              href="https://nsuhia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--green)] hover:underline font-medium"
            >
              <span>Nsuhia Civic Heritage Portal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6 py-3 text-xs text-[var(--subtle)] gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span>Canonical Folio:</span>
            <code className="text-[var(--green)] font-mono">https://adubible.org/{page}/</code>
            <span className="hidden sm:inline text-stone-500">·</span>
            <a
              href="/donate/"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/donate/');
                  window.location.href = '/donate/';
                }
              }}
              className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>💛 Support Mission (Donate)</span>
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--green)] text-[var(--paper)] hover:opacity-90 px-4 py-1.5 font-bold transition shadow-sm"
          >
            ← Return to Scripture Reader
          </button>
        </div>
      </div>
    </div>
  );
};
