import React from 'react';
import { Layers, Plus, Check } from 'lucide-react';
import { BibleVersion } from '../types/bible';

interface QuickVersionRibbonProps {
  activeVersionIds: string[];
  allVersions: BibleVersion[];
  onToggleVersion: (versionId: string) => void;
  onOpenVersionPicker: () => void;
}

// Curated high-impact versions for instant 1-tap switching & parallel comparison
const CURATED_RIBBON_VERSIONS: Array<{ id: string; short: string; flag?: string; name: string }> = [
  { id: 'twi', short: 'TWI', flag: '🇬🇭', name: 'Asante Twi (Twerɛ Kronkron)' },
  { id: 'ak-twi', short: 'AK-TWI', flag: '🇬🇭', name: 'Akuapem Twi' },
  { id: 'kjv', short: 'KJV', flag: '👑', name: 'King James Version 1769' },
  { id: 'nkjv', short: 'NKJV', flag: '📖', name: 'New King James Version' },
  { id: 'bsb', short: 'BSB', flag: '📜', name: 'Berean Standard Bible' },
  { id: 'asv', short: 'ASV', flag: '🇺🇸', name: 'American Standard Version' },
  { id: 'web', short: 'WEB', flag: '🌐', name: 'World English Bible' },
  { id: 'lxx', short: 'LXX', flag: '🏛️', name: 'Brenton Septuagint' },
  { id: 'dra', short: 'DRA', flag: '✝️', name: 'Douay-Rheims Catholic' },
  { id: 'charles', short: 'ENOCH', flag: '🏺', name: 'R.H. Charles (1 Enoch)' },
  { id: 'lightfoot', short: 'DIDACHE', flag: '🕊️', name: 'J.B. Lightfoot (Apostolic)' },
  { id: 'fr-lsg', short: 'FR-LSG', flag: '🇫🇷', name: 'Louis Segond Français' },
  { id: 'es-rvr', short: 'ES-RVR', flag: '🇪🇸', name: 'Reina-Valera 1909' },
  { id: 'ha', short: 'HAUSA', flag: '🇳🇬', name: 'Hausa (Littafi Mai Tsarki)' },
  { id: 'yo', short: 'YORÙBÁ', flag: '🇳🇬', name: 'Èdè Yorùbá (Bíbélì Mímọ́)' },
  { id: 'sw', short: 'SWAHILI', flag: '🇰🇪', name: 'Kiswahili Union Version' },
  { id: 'de-lut', short: 'DE-LUT', flag: '🇩🇪', name: 'Lutherbibel Deutsch' },
  { id: 'tr-gk', short: 'GREEK', flag: '🇬🇷', name: 'Textus Receptus Greek' },
  { id: 'wlc-he', short: 'HEBREW', flag: '🇮🇱', name: 'Westminster Leningrad Codex' },
];

export const QuickVersionRibbon: React.FC<QuickVersionRibbonProps> = ({
  activeVersionIds,
  allVersions,
  onToggleVersion,
  onOpenVersionPicker,
}) => {
  return (
    <div className="version-ribbon-bar" aria-label="Quick Translation Switcher">
      <div className="ribbon-label">
        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
        <span>PARALLEL EDITIONS:</span>
      </div>

      <div className="ribbon-scroll-container">
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
              {item.flag && <span className="pill-flag">{item.flag}</span>}
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
    </div>
  );
};
