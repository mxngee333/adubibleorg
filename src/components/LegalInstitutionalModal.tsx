import React, { useState } from 'react';
import { X, Shield, BookOpen, Scale, HelpCircle, Sparkles, FileText, Bookmark, Library } from 'lucide-react';

export type LegalPageKey = 'about' | 'how-to-use' | 'privacy' | 'terms' | 'editorial-policy' | 'glossary' | 'sources';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 font-sans">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-amber-500/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-amber-200 font-serif">
              AduBible (Adubible.org) — Institutional Trust, Heritage &amp; Standards
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-stone-800 bg-stone-900/60 px-5 py-2.5 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setPage('about')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'about' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> About &amp; Legacy
          </button>
          <button
            onClick={() => setPage('editorial-policy')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'editorial-policy' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Editorial Policy
          </button>
          <button
            onClick={() => setPage('glossary')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'glossary' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" /> Glossary
          </button>
          <button
            onClick={() => setPage('sources')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'sources' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Library className="h-3.5 w-3.5" /> Sources &amp; Archives
          </button>
          <button
            onClick={() => setPage('how-to-use')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'how-to-use' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" /> How To Use
          </button>
          <button
            onClick={() => setPage('privacy')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'privacy' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Privacy Policy
          </button>
          <button
            onClick={() => setPage('terms')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
              page === 'terms' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Scale className="h-3.5 w-3.5" /> Terms &amp; Commons
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm leading-relaxed text-stone-300 font-serif">
          {page === 'about' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-4 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                    SACRED MEMORIAL &amp; GOSPEL COVENANT
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Dedicated to Humanity
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      100% Ads-Free
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-stone-200">
                  <p className="text-sm font-semibold text-amber-200">
                    Honoring the Apostolic Life, Ministry and Generational Legacy of
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                    Apostle Kwame Adu · Nsuhia, Ghana
                  </p>
                  <p className="text-xs text-amber-400 font-mono">
                    <a
                      href="https://nsuhia.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-amber-300"
                    >
                      https://nsuhia.com/ ↗
                    </a>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg border border-amber-500/20 bg-stone-900/60 p-3 flex flex-col justify-between">
                    <p className="text-xs italic text-stone-200 leading-normal">
                      &ldquo;Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.&rdquo;
                    </p>
                    <span className="mt-2 text-[10px] font-bold tracking-wider uppercase text-amber-400">
                      Ephesians 1:3 · Efesofoɔ 1:3
                    </span>
                  </div>

                  <div className="rounded-lg border border-amber-500/20 bg-stone-900/60 p-3 flex flex-col justify-between">
                    <p className="text-xs italic text-stone-200 leading-normal">
                      &ldquo;For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit...&rdquo;
                    </p>
                    <span className="mt-2 text-[10px] font-bold tracking-wider uppercase text-amber-400">
                      Hebrews 4:12 · Hebrifoɔ 4:12
                    </span>
                  </div>

                  <div className="rounded-lg border border-amber-500/20 bg-stone-900/60 p-3 flex flex-col justify-between">
                    <p className="text-xs italic text-stone-200 leading-normal">
                      &ldquo;All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.&rdquo;
                    </p>
                    <span className="mt-2 text-[10px] font-bold tracking-wider uppercase text-amber-400">
                      2 Timothy 3:16 · 2 Timoteo 3:16
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="text-base font-bold text-amber-300 font-serif">
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

          {page === 'editorial-policy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-200 font-serif">
                Institutional Editorial Policy &amp; Translation Standards
              </h3>
              <p>
                At AduBible, we hold the Holy Scriptures of the Old and New Testaments to be the inspired, inerrant, and fully trustworthy Word of the Living God. Our editorial and technical decisions are governed by strict institutional criteria:
              </p>
              <div className="space-y-3 font-sans text-xs">
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
                  <h4 className="font-bold text-amber-300">1. Textual Integrity &amp; Manuscript Fidelity</h4>
                  <p className="text-stone-300">
                    We strictly present biblical translations that adhere to recognized manuscript traditions—the Hebrew Masoretic Text (Westminster Leningrad Codex), the Greek Textus Receptus, and the Byzantine Majority consensus—while transparently noting manuscript variations without sectarian bias.
                  </p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
                  <h4 className="font-bold text-amber-300">2. Strict Commercial Non-Affiliation</h4>
                  <p className="text-stone-300">
                    No publishing corporation, commercial sponsor, or advertising exchange exercises any influence over our editorial, translation, or commentary offerings. Our platform is completely independent, unmonetized, and dedicated to the global body of Christ.
                  </p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
                  <h4 className="font-bold text-amber-300">3. Errata &amp; Correction Transparency</h4>
                  <p className="text-stone-300">
                    Any typographical error, formatting anomaly, or lexical indexing misalignment reported by scholars or readers is reviewed by our research faculty within 48 hours and corrected transparently across our edge deployment pipeline.
                  </p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
                  <h4 className="font-bold text-amber-300">4. Linguistic Dignity for Global Vernaculars</h4>
                  <p className="text-stone-300">
                    Indigenous African and global non-Western languages are treated with identical typographical care, proofreading rigor, and technical features as English, Greek, and Hebrew.
                  </p>
                </div>
              </div>
            </div>
          )}

          {page === 'glossary' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-200 font-serif">
                AduBible Glossary of Biblical &amp; Textual Terminology
              </h3>
              <p className="text-xs font-sans text-stone-400">
                A reference guide to essential terms in biblical scholarship, translation theory, and textual criticism:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Textus Receptus (TR):</strong>
                  <p className="text-stone-300">The "Received Text" — the historic printed Greek New Testament compiled by Renaissance scholars (Erasmus, Stephanus, Beza) underlying the 1611 KJV and NKJV.</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Westminster Leningrad Codex (WLC):</strong>
                  <p className="text-stone-300">The oldest complete manuscript of the Hebrew Bible (dated AD 1008), fully vocalized with Masoretic vowel points and cantillation accents.</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Septuagint (LXX):</strong>
                  <p className="text-stone-300">The ancient 3rd-century BC Greek translation of the Hebrew Old Testament and historical books, quoted widely by the New Testament Apostles.</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Strong’s Exhaustive Concordance:</strong>
                  <p className="text-stone-300">Numerical indexing system created by Dr. James Strong in 1890 mapping every KJV word to 8,674 Hebrew roots (H) and 5,624 Greek roots (G).</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Formal Equivalence:</strong>
                  <p className="text-stone-300">Word-for-word translation methodology (NKJV, KJV, ASV) prioritizing grammatical structure, verbal aspect, and doctrinal technical terms.</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Optimal Equivalence:</strong>
                  <p className="text-stone-300">Translation methodology (Berean Standard Bible) balancing strict word-for-word manuscript fidelity with flowing contemporary English clarity.</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Twerɛ Kronkron:</strong>
                  <p className="text-stone-300">The Akan Twi Holy Bible (literally "Sacred Scripture"), translated initially by J. G. Christaller (1871) and updated in Asante Twi (1964).</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 space-y-1">
                  <strong className="text-amber-300">Analogia Scripturae:</strong>
                  <p className="text-stone-300">"The Analogy of Scripture" — the classical Reformation hermeneutical rule that holy scripture is its own infallible interpreter.</p>
                </div>
              </div>
            </div>
          )}

          {page === 'sources' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-200 font-serif">
                Manuscript Sources, Academic Citations &amp; Institutional Archives
              </h3>
              <p className="text-xs font-sans text-stone-400">
                AduBible’s digital textual engine is built upon primary scholarly archives and public-domain manuscript databases:
              </p>
              <div className="space-y-3 font-sans text-xs">
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1.5">
                  <h4 className="font-bold text-amber-300">Primary Manuscript Witnesses &amp; Critical Editions:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-stone-300">
                    <li><strong>Westminster Leningrad Codex:</strong> J. Alan Groves Center for Advanced Biblical Research, Westminster Theological Seminary.</li>
                    <li><strong>Greek Textus Receptus:</strong> Robert Estienne (Stephanus 1550) &amp; Theodore Beza (1598) consensus editions.</li>
                    <li><strong>Berean Standard Bible (BSB):</strong> Dedicated to the public domain via the Open-Access Biblical Commons.</li>
                    <li><strong>Septuagint LXX:</strong> Alfred Rahlfs and Robert Hanhart critical edition; British and Foreign Bible Society.</li>
                    <li><strong>Asante Twi (Twerɛ Kronkron):</strong> Historical Bible Society of Ghana text, Basel Evangelical Missionary Society archives.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1.5">
                  <h4 className="font-bold text-amber-300">Key Academic &amp; Scholarly Citations:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-stone-300">
                    <li>Metzger, Bruce M. <em>The Text of the New Testament.</em> Oxford University Press, 2005.</li>
                    <li>Thayer, Joseph Henry. <em>A Greek-English Lexicon of the New Testament.</em> Harper &amp; Brothers, 1889.</li>
                    <li>Gesenius, Wilhelm. <em>Hebrew and Chaldee Lexicon to the Old Testament.</em> Baker Books, 1979.</li>
                    <li>Christaller, Johannes Gottlieb. <em>A Grammar and Dictionary of the Asante and Fante Language.</em> Basel, 1875/1881.</li>
                    <li>Bediako, Kwame. <em>Christianity in Africa: The Renewal of a Non-Western Religion.</em> Edinburgh University Press, 1995.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
                  <h4 className="font-bold text-amber-300">Institutional Memorial Archives:</h4>
                  <p className="text-stone-300">
                    Apostle Kwame Adu Memorial Gospel Archive, Nsuhia, Ghana · <a href="https://nsuhia.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">https://nsuhia.com/</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {page === 'how-to-use' && (
            <div className="space-y-3 font-sans">
              <h3 className="text-lg font-bold text-amber-200 font-serif">
                How to Use Parallel Columns, Language Swap &amp; Strong&apos;s Concordance
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-stone-300 text-xs">
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
            <div className="space-y-3 font-sans text-xs">
              <h3 className="text-lg font-bold text-amber-200 font-serif">
                Sovereign Privacy Policy — Zero Ads, Zero Behavioral Tracking
              </h3>
              <p className="text-stone-300">
                AduBible operates under a permanent <strong>Zero-Advertising Covenant</strong>. We never sell, rent, or monetize your scripture reading habits, prayer notes, or personal study highlights.
              </p>
              <p className="text-stone-300">
                By default, all your highlights, pins, bookmarks, notes, and custom language add-ons are stored locally in your device&apos;s private IndexedDB &amp; LocalStorage vault. When you optionally sign in with Cloud Sync, your study data is synchronized exclusively to your secure private account vault. You can export or delete your entire study vault as JSON or Markdown at any time with 1 click.
              </p>
            </div>
          )}

          {page === 'terms' && (
            <div className="space-y-3 font-sans text-xs">
              <h3 className="text-lg font-bold text-amber-200 font-serif">
                Terms of Service &amp; Open-Source Scripture Commons
              </h3>
              <p className="text-stone-300">
                Public domain and open-access biblical texts (including KJV 1769, WEB, BSB, ASV, YLT, WLC Hebrew, Textus Receptus Greek, Louis Segond, Reina-Valera, Luther, and Open-Source Commentaries by Matthew Henry, Jamieson-Fausset-Brown, John Gill, and Treasury of Scripture Knowledge) are provided freely for personal devotion, sermon preparation, academic research, and Christian ministry.
              </p>
              <p className="text-stone-300">
                Users importing custom translation packs via the Add-on Manager retain full ownership of their files. For ministry inquiries or community partnerships, contact us at <code>support[at]adubible.org</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
