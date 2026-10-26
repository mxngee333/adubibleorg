import React, { useState } from 'react';
import { X, Shield, BookOpen, Scale, HelpCircle, Sparkles } from 'lucide-react';

export type LegalPageKey = 'about' | 'how-to-use' | 'privacy' | 'terms';

interface LegalInstitutionalModalProps {
  isOpen: boolean;
  initialPage?: LegalPageKey;
  onClose: () => void;
}

export const LegalInstitutionalModal: React.FC<LegalInstitutionalModalProps> = ({
  isOpen,
  initialPage = 'about',
  onClose,
}) => {
  const [page, setPage] = useState<LegalPageKey>(initialPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-2xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-amber-200">
              AduBible (Adubible.org) — Institutional Covenant &amp; Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-stone-800 bg-stone-900/60 px-5 py-2.5">
          <button
            onClick={() => setPage('about')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              page === 'about'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> About &amp; Legacy
          </button>
          <button
            onClick={() => setPage('how-to-use')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              page === 'how-to-use'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" /> How To Use
          </button>
          <button
            onClick={() => setPage('privacy')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              page === 'privacy'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Privacy Policy
          </button>
          <button
            onClick={() => setPage('terms')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              page === 'terms'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Scale className="h-3.5 w-3.5" /> Open-Source Terms
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm leading-relaxed text-stone-300">
          {page === 'about' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                  SACRED MEMORIAL &amp; COVENANT
                </span>
                <h3 className="text-lg font-bold text-amber-200 mt-1">
                  Honoring the Legacy of Apostle Kwame Adu — Nushia, Ghana
                </h3>
                <p className="mt-2 text-stone-200">
                  <strong>AduBible (Adubible.org)</strong> is dedicated to honor the life, spiritual leadership, and enduring gospel ministry of <strong>Apostle Kwame Adu</strong> of Nushia, Ghana. Rooted in deep devotion to Christ and a steadfast love for the scriptures, this sanctuary stands as a living generational monument to spread the uncorrupted Word of God across Ghana, Africa, and the nations of the earth.
                </p>
              </div>

              <h4 className="text-base font-bold text-amber-300">
                A Modern Sanctuary for Multilingual Scripture &amp; Exegetical Depth
              </h4>
              <p>
                <strong>AduBible</strong> was architected with a singular covenant: to provide believers, pastors, translators, and students with an unhurried, 100% ad-free, deeply scholarly yet mobile-friendly parallel study platform.
              </p>
              <p>
                Where legacy portals clutter the sacred text with intrusive advertisements and fragmented reading, AduBible unites the exegetical power of <strong>BibleHub</strong> (Original Hebrew &amp; Greek Interlinear, Strong&apos;s Exhaustive Concordance, Matthew Henry, Jamieson-Fausset-Brown, John Gill, and Geneva Commentaries) with the personal study sync of <strong>YouVersion</strong> (cloud-synced Highlights, Pinned Verses, Bookmarks, Exegetical Notes, and 1080p Verse Studio Art).
              </p>
              <p>
                With native first-class fidelity for <strong>Asante Twi (Twerɛ Kronkron)</strong>, <strong>Akuapem Twi (Kyerew Kronkron)</strong>, Ewe, Ga, Yoruba, Hausa, Swahili, and 35+ world languages, plus instant <strong>1-Click Language Swap (⇄)</strong>, readers can compare the Word of God side-by-side in their mother tongue and the original biblical languages.
              </p>
            </div>
          )}

          {page === 'how-to-use' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-200">
                How to Use Parallel Columns, Language Swap &amp; Strong&apos;s Concordance
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Parallel Reading (1 to 4 Columns):</strong> Click <em>+ Add translation</em> to open up to 4 synchronized version columns (e.g. KJV + Asante Twi + Original Greek + French Louis Segond).
                </li>
                <li>
                  <strong>1-Click Language Swap (⇄):</strong> Tap the <em>⇄ Swap</em> button in the chapter toolbar or within any column header to immediately invert parallel languages (e.g., swapping KJV on the left and Asante Twi on the right).
                </li>
                <li>
                  <strong>Strong&apos;s Exhaustive Concordance:</strong> Enable the <em>Strong&apos;s / Interlinear</em> toggle or click any code badge like <code>G2128</code> or <code>H430</code> to inspect the Hebrew/Greek Lexicon with phonetic pronunciation, root etymology, Thayer/BDB definitions, and Twi theological cross-references.
                </li>
                <li>
                  <strong>Add New Translations:</strong> Open the <em>+ Add-on Hub</em> to connect over 1,000 open-source translations from the Free Use Bible API or upload your own custom dialect translation pack.
                </li>
                <li>
                  <strong>Personal Study Vault &amp; Cloud Sync:</strong> Tap any verse to Highlight (6 royal colors), Pin to your top study deck, Bookmark, or author deep Exegetical Notes. All data syncs to your private vault across devices.
                </li>
              </ul>
            </div>
          )}

          {page === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-200">
                Sovereign Privacy Policy — Zero Ads, Zero Behavioral Tracking
              </h3>
              <p>
                AduBible operates under a permanent <strong>Zero-Advertising Covenant</strong>. We never sell, rent, or monetize your scripture reading habits, prayer notes, or personal study highlights.
              </p>
              <p>
                By default, all your highlights, pins, bookmarks, notes, and custom language add-ons are stored locally in your device&apos;s private IndexedDB &amp; LocalStorage vault. When you optionally sign in with Cloud Sync, your study data is synchronized exclusively to your secure private account vault. You can export or delete your entire study vault as JSON or Markdown at any time with 1 click.
              </p>
            </div>
          )}

          {page === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-200">
                Terms of Service &amp; Open-Source Scripture Commons
              </h3>
              <p>
                Public domain and open-access biblical texts (including KJV 1769, WEB, BSB, ASV, YLT, WLC Hebrew, Textus Receptus Greek, Louis Segond, Reina-Valera, Luther, and Open-Source Commentaries by Matthew Henry, Jamieson-Fausset-Brown, John Gill, and Treasury of Scripture Knowledge) are provided freely for personal devotion, sermon preparation, academic research, and Christian ministry.
              </p>
              <p>
                Users importing custom translation packs via the Add-on Manager retain full ownership of their files. For ministry inquiries or community partnerships, contact us at <code>support[at]adubible.org</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
