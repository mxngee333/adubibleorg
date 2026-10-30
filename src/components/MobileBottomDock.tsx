import React from 'react';
import { BookOpen, Search, Headphones, Repeat, Settings, Bookmark } from 'lucide-react';

interface MobileBottomDockProps {
  onOpenBooks: () => void;
  onOpenSearch: () => void;
  onToggleAudio: () => void;
  isAudioActive: boolean;
  onSwapLanguages: () => void;
  canSwap: boolean;
  onOpenSettings: () => void;
  isSettingsOpen?: boolean;
  onOpenVault: () => void;
  vaultCount: number;
  currentBookName: string;
  currentChapter: number;
  currentBookAbbrev?: string;
  onOpenSlideMode?: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  onOpenBooks,
  onOpenSearch,
  onToggleAudio,
  isAudioActive,
  onSwapLanguages,
  canSwap,
  onOpenSettings,
  isSettingsOpen = false,
  onOpenVault,
  vaultCount,
  currentBookName,
  currentChapter,
  currentBookAbbrev,
  onOpenSlideMode,
}) => {
  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
      <div className="dock-container">
        {/* 1. Scripture Reading Page / Books Navigator */}
        <button
          type="button"
          className="dock-item"
          onClick={onOpenBooks}
          aria-label={`Return to Bible Reading Page or Open Scripture Navigator (${currentBookName} ${currentChapter})`}
          title={`Bible Reading: ${currentBookName} ${currentChapter}`}
        >
          <BookOpen className="dock-icon" />
          <span className="dock-label truncate max-w-[76px]">
            {(() => {
              if (currentBookAbbrev) {
                return `${currentBookAbbrev} ${currentChapter}`;
              }
              const words = currentBookName.trim().split(' ');
              if (words.length > 1 && /^[1-4]$/.test(words[0])) {
                return `${words[0]} ${words[1].slice(0, 3)} ${currentChapter}`;
              }
              const first = words[0].toLowerCase();
              if (first === 'genesis') return `Gen ${currentChapter}`;
              if (first === 'exodus') return `Ex ${currentChapter}`;
              if (first === 'psalms' || first === 'psalm') return `Ps ${currentChapter}`;
              if (first === 'matthew') return `Mt ${currentChapter}`;
              if (first === 'revelation') return `Rev ${currentChapter}`;
              return `${words[0].slice(0, 3)} ${currentChapter}`;
            })()}
          </span>
        </button>

        {/* 2. Scripture & Passage Search */}
        <button
          type="button"
          className="dock-item"
          onClick={onOpenSearch}
          aria-label="Search scripture, reference, or topic"
        >
          <Search className="dock-icon" />
          <span className="dock-label">Search</span>
        </button>

        {/* 3. Center Highlighted Audio Button */}
        <button
          type="button"
          className={`dock-item center-action ${isAudioActive ? 'active' : ''}`}
          onClick={onToggleAudio}
          aria-label={isAudioActive ? 'Audio Bible Playing' : 'Listen to 24kHz Neural Audio Bible'}
        >
          <div className="audio-pulse-ring" />
          <Headphones className="dock-icon-prominent" />
          <span className="dock-label">Audio</span>
        </button>

        {/* 4. Scripture Slide Presentation Mode / Swap / Vault */}
        {onOpenSlideMode ? (
          <button
            type="button"
            className="dock-item"
            onClick={onOpenSlideMode}
            aria-label="Open Scripture Slide Mode"
            title="Open Scripture Slide Mode"
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>📽️</span>
            <span className="dock-label" style={{ color: '#10b981', fontWeight: 700 }}>Slide</span>
          </button>
        ) : canSwap ? (
          <button
            type="button"
            className="dock-item"
            onClick={onSwapLanguages}
            aria-label="Swap parallel translations"
            title="Swap parallel translations"
          >
            <Repeat className="dock-icon" />
            <span className="dock-label">Swap ⇄</span>
          </button>
        ) : (
          <button
            type="button"
            className="dock-item"
            onClick={onOpenVault}
            aria-label={`Study Vault (${vaultCount} saved items)`}
          >
            <Bookmark className="dock-icon" />
            <span className="dock-label">Vault ({vaultCount})</span>
          </button>
        )}

        {/* 5. Reading Settings & Themes */}
        <button
          type="button"
          className={`dock-item ${isSettingsOpen ? 'active' : ''}`}
          onClick={onOpenSettings}
          aria-label={isSettingsOpen ? 'Close Settings' : 'Reading Settings and Palettes'}
        >
          <Settings className="dock-icon" />
          <span className="dock-label">Settings</span>
        </button>
      </div>
    </nav>
  );
};
