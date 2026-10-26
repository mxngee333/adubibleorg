import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { BibleVersion } from '../types/bible';

interface QuickVersionRibbonProps {
  activeVersionIds: string[];
  allVersions: BibleVersion[];
  onToggleVersion: (versionId: string) => void;
  onOpenVersionPicker: () => void;
}

// Complete BibleHub Canonical Editions + Ghanaian & Classical Heritage
export const BIBLEHUB_RIBBON_VERSIONS: Array<{ id: string; short: string; name: string; tag?: string }> = [
  // ── Ghanaian Heritage Jewels ──
  { id: 'twi', short: 'TWI', name: 'Asante Twi (Twerɛ Kronkron)', tag: 'GH' },
  { id: 'ak-twi', short: 'AK-TWI', name: 'Akuapem Twi (Kyerew Kronkron)', tag: 'GH' },

  // ── 29 BibleHub Exact Canonical Editions (Matching BibleHub Lineup) ──
  { id: 'niv', short: 'NIV', name: 'New International Version (1984 / 2011)' },
  { id: 'nlt', short: 'NLT', name: 'New Living Translation (2015)' },
  { id: 'esv', short: 'ESV', name: 'English Standard Version (2016)' },
  { id: 'bsb', short: 'BSB', name: 'Berean Standard Bible' },
  { id: 'kjv', short: 'KJV', name: 'King James Version 1769' },
  { id: 'nkjv', short: 'NKJ', name: 'New King James Version' },
  { id: 'nasb', short: 'NAS', name: 'New American Standard Bible (1995)' },
  { id: 'amp', short: 'AMP', name: 'Amplified Bible (2015)' },
  { id: 'csb', short: 'CSB', name: 'Christian Standard Bible (2017)' },
  { id: 'hcsb', short: 'HCS', name: 'Holman Christian Standard Bible' },
  { id: 'lsb', short: 'LSB', name: 'Legacy Standard Bible (2021)' },
  { id: 'net', short: 'NET', name: 'New English Translation (NET Bible)' },
  { id: 'cev', short: 'CEV', name: 'Contemporary English Version' },
  { id: 'gnt', short: 'GNT', name: 'Good News Translation' },
  { id: 'ara', short: 'ARA', name: 'Almeida Revista e Atualizada (Português)' },
  { id: 'asv', short: 'ASV', name: 'American Standard Version (1901)' },
  { id: 'dbt', short: 'DBT', name: 'Darby Bible Translation (1890)' },
  { id: 'drb', short: 'DRB', name: 'Douay-Rheims Bible (Challoner Revision)' },
  { id: 'erv', short: 'ERV', name: 'Easy-to-Read Version' },
  { id: 'gwt', short: 'GWT', name: "GOD'S WORD Translation" },
  { id: 'isr', short: 'ISR', name: 'The Scriptures (ISR 2009)' },
  { id: 'isv', short: 'ISV', name: 'International Standard Version' },
  { id: 'kjp', short: 'KJP', name: 'King James 2000' },
  { id: 'rfp', short: 'RFP', name: 'Almeida Revista e Fiel' },
  { id: 'nhe', short: 'NHE', name: 'New Heart English Bible' },
  { id: 'ojb', short: 'OJB', name: 'Orthodox Jewish Bible' },
  { id: 'web', short: 'WEB', name: 'World English Bible' },
  { id: 'wbt', short: 'WBT', name: 'Webster Bible (1833)' },
  { id: 'wyc', short: 'WYC', name: "Wycliffe's Bible (1395)" },

  // ── African & Classical Translations ──
  { id: 'ee', short: 'EWE', name: 'Eʋegbe Biblia (Ghana / Togo)' },
  { id: 'gaa', short: 'GA', name: 'Gã Ŋmalɛ Krɔŋkrɔŋ (Accra, Ghana)' },
  { id: 'yo', short: 'YOR', name: 'Èdè Yorùbá (Bíbélì Mímọ́)' },
  { id: 'ha', short: 'HAU', name: 'Hausa (Littafi Mai Tsarki)' },
  { id: 'sw', short: 'SWA', name: 'Kiswahili Union Version' },
  { id: 'tr-gk', short: 'GRK', name: 'Textus Receptus Greek' },
  { id: 'wlc', short: 'HEB', name: 'Westminster Leningrad Codex Hebrew' },
  { id: 'vul', short: 'VUL', name: 'Biblia Sacra Vulgata' },
];

export const QuickVersionRibbon: React.FC<QuickVersionRibbonProps> = ({
  activeVersionIds,
  allVersions,
  onToggleVersion,
  onOpenVersionPicker,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <nav className="version-ribbon-bar biblehub-sky-ribbon" aria-label="BibleHub Quick Translation Ribbon">
      <div className="ribbon-scroll-wrapper">
        <button
          type="button"
          className="ribbon-nav-btn left"
          onClick={() => handleScroll('left')}
          title="Scroll translations left"
          aria-label="Scroll translations left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div ref={scrollRef} className="ribbon-scroll-container">
          {BIBLEHUB_RIBBON_VERSIONS.map((item) => {
            const activeIndex = activeVersionIds.indexOf(item.id);
            const isActive = activeIndex !== -1;
            const isPrimary = activeIndex === 0;

            return (
              <button
                type="button"
                key={item.id}
                className={`ribbon-pill ${isActive ? 'active' : ''} ${isPrimary ? 'primary' : ''}`}
                onClick={() => onToggleVersion(item.id)}
                title={`${item.name} · Click to ${isActive ? 'remove from' : 'add to'} parallel comparison`}
                aria-pressed={isActive}
              >
                <span className="pill-code">{item.short}</span>
                {isActive && (
                  <span className="pill-status">
                    {isPrimary ? '1' : `${activeIndex + 1}`}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            className="ribbon-pill add-more"
            onClick={onOpenVersionPicker}
            title="Browse all 35+ global languages & editions"
          >
            <Plus className="h-3 w-3" />
            <span>MORE</span>
          </button>
        </div>

        <button
          type="button"
          className="ribbon-nav-btn right"
          onClick={() => handleScroll('right')}
          title="Scroll translations right"
          aria-label="Scroll translations right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};
