import React, { useRef } from 'react';
import { Layers, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { BibleVersion } from '../types/bible';

interface QuickVersionRibbonProps {
  activeVersionIds: string[];
  allVersions: BibleVersion[];
  onToggleVersion: (versionId: string) => void;
  onOpenVersionPicker: () => void;
}

// Curated high-impact versions with universal cross-platform symbols
// (Avoiding Windows Chromium 2-letter country flag box fallback: GH, US, FR, etc.)
const CURATED_RIBBON_VERSIONS: Array<{ id: string; short: string; symbol?: string; name: string }> = [
  { id: 'twi', short: 'TWI', symbol: '⭐', name: 'Asante Twi (Twerɛ Kronkron)' },
  { id: 'ak-twi', short: 'AK-TWI', symbol: '🌿', name: 'Akuapem Twi' },
  { id: 'kjv', short: 'KJV', symbol: '👑', name: 'King James Version 1769' },
  { id: 'nkjv', short: 'NKJV', symbol: '📖', name: 'New King James Version' },
  { id: 'bsb', short: 'BSB', symbol: '📜', name: 'Berean Standard Bible' },
  { id: 'asv', short: 'ASV', symbol: '🕊️', name: 'American Standard Version' },
  { id: 'web', short: 'WEB', symbol: '🌐', name: 'World English Bible' },
  { id: 'fr-lsg', short: 'FR-LSG', symbol: '⚜️', name: 'Louis Segond Français' },
  { id: 'es-rvr', short: 'ES-RVR', symbol: '☀️', name: 'Reina-Valera 1909' },
  { id: 'ha', short: 'HAUSA', symbol: '🌍', name: 'Hausa (Littafi Mai Tsarki)' },
  { id: 'yo', short: 'YORÙBÁ', symbol: '👑', name: 'Èdè Yorùbá (Bíbélì Mímọ́)' },
  { id: 'sw', short: 'SWAHILI', symbol: '🌅', name: 'Kiswahili Union Version' },
  { id: 'de-lut', short: 'DE-LUT', symbol: '🛡️', name: 'Lutherbibel Deutsch' },
  { id: 'tr-gk', short: 'GREEK', symbol: '🏛️', name: 'Textus Receptus Greek' },
  { id: 'wlc-he', short: 'HEBREW', symbol: '✡️', name: 'Westminster Leningrad Codex' },
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
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="version-ribbon-bar" aria-label="Quick Translation Switcher">
      <div className="ribbon-label">
        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
        <span>PARALLEL EDITIONS:</span>
      </div>

      <div className="ribbon-scroll-wrapper">
        <button
          type="button"
          className="ribbon-nav-btn left"
          onClick={() => handleScroll('left')}
          title="Scroll translations left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div ref={scrollRef} className="ribbon-scroll-container">
          {CURATED_RIBBON_VERSIONS.map((item) => {
            const activeIndex = activeVersionIds.indexOf(item.id);
            const isActive = activeIndex !== -1;
            const isPrimary = activeIndex === 0;

            return (
              <button
                type="button"
                key={item.id}
                className={`ribbon-pill ${isActive ? 'active' : ''} ${isPrimary ? 'primary' : ''}`}
                onClick={() => onToggleVersion(item.id)}
                title={`${item.name} · Click to ${isActive ? 'remove from' : 'add to'} parallel reading`}
                aria-pressed={isActive}
              >
                {item.symbol && <span className="pill-flag">{item.symbol}</span>}
                <span className="pill-code">{item.short}</span>
                {isActive && (
                  <span className="pill-status">
                    {isPrimary ? 'Col 1' : `Col ${activeIndex + 1}`}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            className="ribbon-pill add-more"
            onClick={onOpenVersionPicker}
            title="Browse all 35+ languages & Bible translations"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>More (35+)</span>
          </button>
        </div>

        <button
          type="button"
          className="ribbon-nav-btn right"
          onClick={() => handleScroll('right')}
          title="Scroll translations right"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
