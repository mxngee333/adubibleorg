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
              Elohim Bible Hub — Institutional Covenant &amp; Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
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
            <BookOpen className="h-3.5 w-3.5" /> About Mission
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
            <Scale className="h-3.5 w-3.5" /> Terms of Use
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm leading-relaxed text-stone-300">
          {page === 'about' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-200">
                About Elohim Bible Hub — A Generational Sanctuary for Scripture &amp; Exegesis
              </h3>
              <p>
                <strong>Elohim Bible Hub</strong> was architected with a singular generational mission: to provide believers, pastors, translators, and scholars worldwide with an unhurried, 100% ad-free, deeply scholarly yet mobile-friendly Scripture reading and parallel study platform.
              </p>
              <p>
                Where legacy Bible portals clutter the sacred text with intrusive pop-up advertisements and fragmented navigation, Elohim Bible Hub unites the exegetical rigor of <strong>BibleHub</strong> (Interlinear Hebrew &amp; Greek, Strong&apos;s Exhaustive Concordance, Matthew Henry, Jamieson-Fausset-Brown, John Gill, and Geneva Commentaries) with the personal study ergonomics of <strong>YouVersion</strong> (cloud-synced Highlights, Pinned Verses, Bookmarks, Personal Notes, and Shareable Verse Art).
              </p>
              <p>
                With first-class support for <strong>Asante Twi (Twerɛ Kronkron)</strong>, <strong>Akuapem Twi</strong>, Ewe, Ga, Yoruba, Hausa, Swahili, and all 24+ major global languages, plus an open-ended Language &amp; Version Add-on Manager, communities can study the Word of Elohim side-by-side in their mother tongue and the original biblical languages.
              </p>
            </div>
          )}

          {page === 'how-to-use' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-200">
                How to Use Parallel Reading, Strong&apos;s Concordance &amp; Add-on Languages
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Parallel Reading (1 to 4 Columns):</strong> Click <em>+ Add Parallel Language</em> in the top bar to open up to 4 synchronized translation columns (e.g., NKJV + Asante Twi + Original Greek + French Louis Segond). On mobile, switch seamlessly between Stacked Verse-by-Verse Interlinear cards or Side-by-Side view.
                </li>
                <li>
                  <strong>Strong&apos;s Exhaustive Concordance:</strong> Enable the <em>Strong&apos;s / Interlinear</em> toggle on any verse or click any badge like <code>G2128</code> or <code>H430</code> to open the full Greek/Hebrew Lexicon with audio pronunciation, root etymology, BDB/Thayer definitions, and Twi theological resonance.
                </li>
                <li>
                  <strong>Add New Languages or Custom Versions:</strong> Open the <em>Languages &amp; Add-ons</em> modal to connect over 1,000 open-source translations from the Free Use Bible API or upload/paste your own custom language translation pack.
                </li>
                <li>
                  <strong>Cloud Study Sync:</strong> Tap any verse to Highlight (6 colors), Pin to your top study bar, Bookmark, or write a rich Study Note. Sign in via Email or Google 1-Tap to synchronize across all your devices.
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
                Elohim Bible Hub operates under a strict <strong>Zero-Advertising Covenant</strong>. We never sell, rent, or monetize your scripture reading habits, prayer notes, or personal study highlights.
              </p>
              <p>
                By default, all your highlights, pins, bookmarks, notes, and custom language add-ons are stored locally in your device&apos;s encrypted IndexedDB &amp; LocalStorage vault. When you optionally sign in with Cloud Sync, your study data is synchronized exclusively to your private account vault so you can access your Bible notes across mobile and desktop devices. You can export or delete your entire study vault as JSON or Markdown at any time with 1 click.
              </p>
            </div>
          )}

          {page === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-200">
                Terms of Service &amp; Open-Source Scripture Licensing
              </h3>
              <p>
                Public domain and open-access biblical texts (including KJV, WEB, BSB, ASV, YLT, WLC Hebrew, Textus Receptus Greek, Louis Segond, Reina-Valera, Luther, and Open-Source Commentaries by Matthew Henry, Jamieson-Fausset-Brown, John Gill, and Treasury of Scripture Knowledge) are provided freely for personal study, ministry, pulpit teaching, and academic research.
              </p>
              <p>
                Users importing custom language packs via the Add-on Manager retain full ownership of their uploaded translations and study notes. For inquiries or ministry partnerships, contact us at <code>support[at]elohimbible.org</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
