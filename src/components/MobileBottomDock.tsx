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
}) => {
  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
      <div className="dock-container">
        {/* 1. Books & Chapter Selector */}
        <button
          type="button"
          className="dock-item"
          onClick={onOpenBooks}
          aria-label={`Open Scripture Navigator (${currentBookName} ${currentChapter})`}
        >
          <BookOpen className="dock-icon" />
          <span className="dock-label truncate max-w-[76px]">
            {(() => {
              const words = currentBookName.trim().split(' ');
              if (words.length > 1 && /^[1-4]$/.test(words[0])) {
                return `${words[0]} ${words[1].slice(0, 3)} ${currentChapter}`;
              }
              return `${words[0].slice(0, 4)} ${currentChapter}`;
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

        {/* 4. Instant Parallel Language Swap / Study Vault */}
        {canSwap ? (
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
