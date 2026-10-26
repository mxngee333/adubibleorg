import React from 'react';
import { BookOpen, Search, Headphones, Repeat, Grid, Settings, Bookmark, Sparkles } from 'lucide-react';

interface MobileBottomDockProps {
  onOpenBooks: () => void;
  onOpenSearch: () => void;
  onOpenAskAi?: () => void;
  onToggleAudio: () => void;
  isAudioActive: boolean;
  onSwapLanguages: () => void;
  canSwap: boolean;
  onOpenSettings: () => void;
  onOpenVault: () => void;
  vaultCount: number;
  currentBookName: string;
  currentChapter: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  onOpenBooks,
  onOpenSearch,
  onOpenAskAi,
  onToggleAudio,
  isAudioActive,
  onSwapLanguages,
  canSwap,
  onOpenSettings,
  onOpenVault,
  vaultCount,
  currentBookName,
  currentChapter,
}) => {
  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
      <div className="dock-container">
        {/* 1. Books & Chapter Button */}
        <button
          type="button"
          className="dock-item"
          onClick={onOpenBooks}
          aria-label={`Open Book and Chapter Navigator (${currentBookName} ${currentChapter})`}
        >
          <BookOpen className="dock-icon" />
          <span className="dock-label truncate max-w-[64px]">
            {currentBookName.split(' ')[0]} {currentChapter}
          </span>
        </button>

        {/* 2. Ask AduBible AI Button (Prominent) */}
        {onOpenAskAi ? (
          <button
            type="button"
            className="dock-item ask-ai-dock"
            onClick={onOpenAskAi}
            aria-label="Ask AduBible AI Scripture Companion"
          >
            <Sparkles className="dock-icon text-amber-400" />
            <span className="dock-label font-bold text-amber-400">Ask AI</span>
          </button>
        ) : (
          <button
            type="button"
            className="dock-item"
            onClick={onOpenSearch}
            aria-label="Search scripture or topic"
          >
            <Search className="dock-icon" />
            <span className="dock-label">Search</span>
          </button>
        )}

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

        {/* 4. Instant Language Swap (if multiple versions active) or Study Vault */}
        {canSwap ? (
          <button
            type="button"
            className="dock-item"
            onClick={onSwapLanguages}
            aria-label="Swap parallel languages"
            title="Swap parallel languages"
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

        {/* 5. Settings & Reading Tools */}
        <button
          type="button"
          className="dock-item"
          onClick={onOpenSettings}
          aria-label="Reading Settings and Palettes"
        >
          <Settings className="dock-icon" />
          <span className="dock-label">Settings</span>
        </button>
      </div>
    </nav>
  );
};
