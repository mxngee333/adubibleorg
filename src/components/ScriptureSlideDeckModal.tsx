import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Play,
  Pause,
  Palette,
  Type,
  Lock,
  Unlock,
  Sliders,
  Volume2,
} from 'lucide-react';
import {
  BibleBook,
  BibleVersion,
  ChapterData,
  VerseData,
} from '../types/bible';

export interface SlideTheme {
  id: string;
  name: string;
  description: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentGlow: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  isLight?: boolean;
}

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: 'midnight-sanctuary',
    name: 'Midnight Sanctuary',
    description: 'Deep obsidian sapphire with subtle emerald sanctuary light',
    background: 'radial-gradient(ellipse at 50% 15%, #0f1c30 0%, #080d17 60%, #03060a 100%)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    badgeText: '#34d399',
    cardBg: 'rgba(15, 23, 42, 0.65)',
    cardBorder: 'rgba(148, 163, 184, 0.18)',
  },
  {
    id: 'celestial-gold',
    name: 'Celestial Dawn',
    description: 'Radiant morning sunbeams and warm golden glory',
    background: 'radial-gradient(ellipse at 50% 10%, #2e1a06 0%, #170c02 60%, #080401 100%)',
    textPrimary: '#fffbeb',
    textSecondary: '#fde68a',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeText: '#fbbf24',
    cardBg: 'rgba(30, 18, 5, 0.65)',
    cardBorder: 'rgba(245, 158, 11, 0.24)',
  },
  {
    id: 'royal-tyrian',
    name: 'Royal Tyrian Velvet',
    description: 'Imperial purple & warm gold for majestic kingly scriptures',
    background: 'radial-gradient(ellipse at 50% 15%, #2a0b3f 0%, #150522 60%, #09020e 100%)',
    textPrimary: '#fbf7ff',
    textSecondary: '#d8b4fe',
    accent: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.4)',
    badgeBg: 'rgba(192, 132, 252, 0.18)',
    badgeText: '#e9d5ff',
    cardBg: 'rgba(27, 8, 41, 0.65)',
    cardBorder: 'rgba(192, 132, 252, 0.24)',
  },
  {
    id: 'deep-emerald',
    name: 'Emerald Grove',
    description: 'Tranquil sacred forest with life-giving living water glow',
    background: 'radial-gradient(ellipse at 50% 15%, #08281b 0%, #03140d 60%, #010805 100%)',
    textPrimary: '#f0fdf4',
    textSecondary: '#86efac',
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeText: '#4ade80',
    cardBg: 'rgba(4, 25, 16, 0.65)',
    cardBorder: 'rgba(16, 185, 129, 0.24)',
  },
  {
    id: 'sacred-flame',
    name: 'Sacred Flame',
    description: 'Deep amber warmth resembling candlelight sanctuary',
    background: 'radial-gradient(ellipse at 50% 15%, #2a1205 0%, #150902 60%, #080301 100%)',
    textPrimary: '#fff7ed',
    textSecondary: '#fed7aa',
    accent: '#fb923c',
    accentGlow: 'rgba(251, 146, 60, 0.4)',
    badgeBg: 'rgba(251, 146, 60, 0.2)',
    badgeText: '#fdba74',
    cardBg: 'rgba(32, 14, 5, 0.65)',
    cardBorder: 'rgba(251, 146, 60, 0.24)',
  },
  {
    id: 'mount-sinai',
    name: 'Mount Sinai Stone',
    description: 'Clean slate granite with ultra-sharp projector contrast',
    background: 'radial-gradient(ellipse at 50% 15%, #1e2430 0%, #0f131a 60%, #08090d 100%)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    badgeBg: 'rgba(56, 189, 248, 0.16)',
    badgeText: '#7dd3fc',
    cardBg: 'rgba(18, 22, 30, 0.65)',
    cardBorder: 'rgba(203, 213, 225, 0.2)',
  },
  {
    id: 'ancient-parchment',
    name: 'Ancient Parchment',
    description: 'Warm historic parchment paper with dark sepia ink',
    background: 'radial-gradient(ellipse at 50% 20%, #f7f2e4 0%, #eaddc4 65%, #d8caad 100%)',
    textPrimary: '#291809',
    textSecondary: '#5a3d1c',
    accent: '#854d0e',
    accentGlow: 'rgba(133, 77, 14, 0.25)',
    badgeBg: 'rgba(133, 77, 14, 0.15)',
    badgeText: '#713f12',
    cardBg: 'rgba(255, 255, 255, 0.75)',
    cardBorder: 'rgba(133, 77, 14, 0.25)',
    isLight: true,
  },
  {
    id: 'oled-black',
    name: 'Pure OLED Obsidian',
    description: 'True pitch black (#000000) for OLED screens & high-lumen projectors',
    background: '#000000',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#e4e4e7',
    accentGlow: 'rgba(255, 255, 255, 0.25)',
    badgeBg: 'rgba(255, 255, 255, 0.14)',
    badgeText: '#ffffff',
    cardBg: 'rgba(20, 20, 24, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
  },
];

export interface ScriptureSlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BibleBook;
  chapter: number;
  initialVerse: number;
  activeVersionIds: string[];
  chaptersByVersion: Record<string, ChapterData | undefined>;
  allVersions: BibleVersion[];
  bookDisplayName: string;
  // Audio Playback & Sync
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
  currentAudioVerse?: number;
  onSelectVerse?: (vNum: number) => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
}

export const ScriptureSlideDeckModal: React.FC<ScriptureSlideDeckModalProps> = ({
  isOpen,
  onClose,
  book,
  chapter,
  initialVerse,
  activeVersionIds,
  chaptersByVersion,
  allVersions,
  bookDisplayName,
  isAudioPlaying = false,
  onToggleAudio,
  currentAudioVerse,
  onSelectVerse,
  onNextChapter,
  onPrevChapter,
  hasNextChapter = true,
  hasPrevChapter = true,
}) => {
  // Primary chapter data to determine total verses
  const primaryVersionId = activeVersionIds[0] || 'nkjv';
  const primaryChapter = chaptersByVersion[primaryVersionId];
  const versesList: VerseData[] = useMemo(() => {
    return primaryChapter?.verses || [];
  }, [primaryChapter]);

  const totalVerses = versesList.length || 1;

  // Active verse index in the chapter (0-indexed)
  const [activeIdx, setActiveIdx] = useState<number>(() => {
    const idx = versesList.findIndex((v) => v.verse === initialVerse);
    return idx >= 0 ? idx : 0;
  });

  // Track slide animation transition direction: 'next' | 'prev' | 'none'
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | 'none'>('none');
  const [animatingKey, setAnimatingKey] = useState<number>(0);

  // Background Theme
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adubible_slide_theme');
      if (saved && SLIDE_THEMES.some((t) => t.id === saved)) {
        return saved;
      }
    }
    return 'midnight-sanctuary';
  });

  const currentTheme = useMemo(() => {
    return SLIDE_THEMES.find((t) => t.id === selectedThemeId) || SLIDE_THEMES[0];
  }, [selectedThemeId]);

  // Typography Size: 0 = Medium (30px), 1 = Large (38px), 2 = XL (48px), 3 = XXL (58px)
  const [fontScaleIndex, setFontScaleIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adubible_slide_font_scale');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) return parsed;
      }
    }
    return 1; // Default Large
  });

  const fontSizes = [
    { label: 'Normal', primaryPx: 26, subPx: 21, lineH: 1.55 },
    { label: 'Large', primaryPx: 34, subPx: 26, lineH: 1.55 },
    { label: 'XL Projector', primaryPx: 44, subPx: 34, lineH: 1.5 },
    { label: 'Sanctuary Max', primaryPx: 56, subPx: 42, lineH: 1.45 },
  ];
  const activeFontSize = fontSizes[fontScaleIndex];

  // Distraction-Free Auto-Hide Controls
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);
  const [isControlsPinned, setIsControlsPinned] = useState<boolean>(false);
  const hideTimerRef = useRef<any>(null);

  // Background Palette Dropdown State
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);

  // Fullscreen state
  const [isDeckFullscreen, setIsDeckFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement
    );
  });

  // Thumbnail Scrubber scroll container
  const scrubberListRef = useRef<HTMLDivElement | null>(null);

  // Sync to initialVerse when modal opens
  useEffect(() => {
    if (isOpen) {
      const idx = versesList.findIndex((v) => v.verse === initialVerse);
      setActiveIdx(idx >= 0 ? idx : 0);
      setSlideDirection('none');
    }
  }, [isOpen, initialVerse, versesList]);

  // Sync to currentAudioVerse in real-time as narration progresses
  useEffect(() => {
    if (!isOpen || typeof currentAudioVerse !== 'number') return;
    const targetIdx = versesList.findIndex((v) => v.verse === currentAudioVerse);
    if (targetIdx >= 0 && targetIdx !== activeIdx) {
      setSlideDirection(targetIdx > activeIdx ? 'next' : 'prev');
      setActiveIdx(targetIdx);
      setAnimatingKey((prev) => prev + 1);
    }
  }, [currentAudioVerse, isOpen, versesList, activeIdx]);

  // Keep active scrubber pill visible in horizontal track
  useEffect(() => {
    if (!scrubberListRef.current) return;
    const activePill = scrubberListRef.current.querySelector(
      `[data-pill-idx="${activeIdx}"]`
    ) as HTMLElement;
    if (activePill) {
      activePill.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIdx]);

  // Auto-hide controls after 3.5s of mouse inactivity (ProPresenter style)
  const resetHideTimer = useCallback(() => {
    setAreControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isControlsPinned) {
      hideTimerRef.current = setTimeout(() => {
        setAreControlsVisible(false);
        setIsPaletteOpen(false);
      }, 3500);
    }
  }, [isControlsPinned]);

  useEffect(() => {
    if (!isOpen) return;
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isOpen, resetHideTimer]);

  // Slide navigation handlers
  const goToNextVerse = useCallback(() => {
    if (activeIdx < totalVerses - 1) {
      setSlideDirection('next');
      setActiveIdx((prev) => prev + 1);
      setAnimatingKey((prev) => prev + 1);
      const nextVerseNum = versesList[activeIdx + 1]?.verse;
      if (nextVerseNum && onSelectVerse) onSelectVerse(nextVerseNum);
    } else if (hasNextChapter && onNextChapter) {
      onNextChapter();
      setActiveIdx(0);
      setSlideDirection('next');
      setAnimatingKey((prev) => prev + 1);
    }
    resetHideTimer();
  }, [
    activeIdx,
    totalVerses,
    versesList,
    onSelectVerse,
    hasNextChapter,
    onNextChapter,
    resetHideTimer,
  ]);

  const goToPrevVerse = useCallback(() => {
    if (activeIdx > 0) {
      setSlideDirection('prev');
      setActiveIdx((prev) => prev - 1);
      setAnimatingKey((prev) => prev + 1);
      const prevVerseNum = versesList[activeIdx - 1]?.verse;
      if (prevVerseNum && onSelectVerse) onSelectVerse(prevVerseNum);
    } else if (hasPrevChapter && onPrevChapter) {
      onPrevChapter();
      setActiveIdx(0);
      setSlideDirection('prev');
      setAnimatingKey((prev) => prev + 1);
    }
    resetHideTimer();
  }, [
    activeIdx,
    versesList,
    onSelectVerse,
    hasPrevChapter,
    onPrevChapter,
    resetHideTimer,
  ]);

  const jumpToVerseIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalVerses && index !== activeIdx) {
        setSlideDirection(index > activeIdx ? 'next' : 'prev');
        setActiveIdx(index);
        setAnimatingKey((prev) => prev + 1);
        const targetV = versesList[index]?.verse;
        if (targetV && onSelectVerse) onSelectVerse(targetV);
      }
      resetHideTimer();
    },
    [totalVerses, activeIdx, versesList, onSelectVerse, resetHideTimer]
  );

  // Fullscreen toggler
  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    const doc = document as any;
    const docEl = document.documentElement as any;
    const isFull = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement
    );
    if (!isFull) {
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFS = () => {
      setIsDeckFullscreen(
        !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      );
    };
    document.addEventListener('fullscreenchange', handleFS);
    document.addEventListener('webkitfullscreenchange', handleFS);
    return () => {
      document.removeEventListener('fullscreenchange', handleFS);
      document.removeEventListener('webkitfullscreenchange', handleFS);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextVerse();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevVerse();
      } else if (e.key === 'Home') {
        e.preventDefault();
        jumpToVerseIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        jumpToVerseIndex(totalVerses - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    goToNextVerse,
    goToPrevVerse,
    jumpToVerseIndex,
    totalVerses,
    toggleFullscreen,
    onClose,
  ]);

  // Touch Swipe handlers
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    resetHideTimer();
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goToNextVerse();
      else goToPrevVerse();
    }
    touchStartXRef.current = null;
  };

  if (!isOpen) return null;

  const currentVerseObj = versesList[activeIdx];
  const currentVerseNum = currentVerseObj?.verse || activeIdx + 1;

  return (
    <div
      className="scripture-slide-deck-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: currentTheme.background,
        color: currentTheme.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        overflow: 'hidden',
        fontFamily:
          'Georgia, "Times New Roman", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif',
      }}
      onMouseMove={resetHideTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (!areControlsVisible) {
          resetHideTimer();
        }
      }}
    >
      {/* 1. TOP PRESENTATION BAR (Auto-hides on idle) */}
      <header
        className="slide-deck-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: areControlsVisible || isControlsPinned ? 1 : 0,
          pointerEvents: areControlsVisible || isControlsPinned ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
          zIndex: 20,
        }}
      >
        {/* Left: Scripture Reference & Verse Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              background: currentTheme.badgeBg,
              color: currentTheme.badgeText,
              border: `1px solid ${currentTheme.accent}`,
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 0 14px ${currentTheme.accentGlow}`,
            }}
          >
            <span>📽️</span>
            <span>
              {bookDisplayName} {chapter}:{currentVerseNum}
            </span>
          </div>

          <span style={{ fontSize: '12px', color: currentTheme.textSecondary, fontWeight: 500 }}>
            Slide {activeIdx + 1} of {totalVerses}
          </span>
        </div>

        {/* Center: Translation Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {activeVersionIds.map((vId) => {
            const verMeta = allVersions.find((v) => v.id === vId);
            return (
              <span
                key={vId}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: currentTheme.textPrimary,
                }}
              >
                {verMeta?.shortName || vId.toUpperCase()}
              </span>
            );
          })}
        </div>

        {/* Right: Quick Tools (Play Audio, Background Palette, Text Size, Fullscreen, Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Audio Recitation Toggle Button */}
          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: `1px solid ${isAudioPlaying ? currentTheme.accent : 'rgba(255, 255, 255, 0.2)'}`,
                background: isAudioPlaying ? currentTheme.accent : 'rgba(255, 255, 255, 0.08)',
                color: isAudioPlaying ? '#000000' : currentTheme.textPrimary,
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isAudioPlaying ? 'Pause Audio Recitation' : 'Play Audio Recitation'}
            >
              {isAudioPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isAudioPlaying ? 'Reciting' : 'Play Audio'}</span>
            </button>
          )}

          {/* Background Theme Chooser Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsPaletteOpen((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: isPaletteOpen ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                color: currentTheme.textPrimary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Change Background Theme"
            >
              <Palette size={14} style={{ color: currentTheme.accent }} />
              <span className="hide-mobile-sm">Theme</span>
            </button>

            {/* Background Dropdown Swatches */}
            {isPaletteOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '280px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  zIndex: 30,
                }}
              >
                {SLIDE_THEMES.map((theme) => {
                  const isSelected = theme.id === selectedThemeId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedThemeId(theme.id);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('adubible_slide_theme', theme.id);
                        }
                        setIsPaletteOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        gap: '4px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? theme.accent : 'transparent'}`,
                        background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '24px',
                          borderRadius: '4px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          boxShadow: `0 0 8px ${theme.accentGlow}`,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                        }}
                      >
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Text Size Stepper */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              disabled={fontScaleIndex <= 0}
              onClick={() => {
                const next = Math.max(0, fontScaleIndex - 1);
                setFontScaleIndex(next);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('adubible_slide_font_scale', String(next));
                }
              }}
              style={{
                padding: '6px 9px',
                background: 'none',
                border: 'none',
                color: currentTheme.textPrimary,
                cursor: fontScaleIndex <= 0 ? 'not-allowed' : 'pointer',
                opacity: fontScaleIndex <= 0 ? 0.35 : 1,
                fontSize: '11px',
                fontWeight: 700,
              }}
              title="Smaller font size"
            >
              A-
            </button>
            <span
              style={{
                padding: '0 4px',
                fontSize: '10px',
                color: currentTheme.textSecondary,
                fontWeight: 700,
              }}
            >
              {activeFontSize.label}
            </span>
            <button
              type="button"
              disabled={fontScaleIndex >= fontSizes.length - 1}
              onClick={() => {
                const next = Math.min(fontSizes.length - 1, fontScaleIndex + 1);
                setFontScaleIndex(next);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('adubible_slide_font_scale', String(next));
                }
              }}
              style={{
                padding: '6px 9px',
                background: 'none',
                border: 'none',
                color: currentTheme.textPrimary,
                cursor: fontScaleIndex >= fontSizes.length - 1 ? 'not-allowed' : 'pointer',
                opacity: fontScaleIndex >= fontSizes.length - 1 ? 0.35 : 1,
                fontSize: '12px',
                fontWeight: 700,
              }}
              title="Larger font size (for Sanctuary / Projection)"
            >
              A+
            </button>
          </div>

          {/* Pin Controls Toggle */}
          <button
            type="button"
            onClick={() => setIsControlsPinned((prev) => !prev)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: `1px solid ${isControlsPinned ? currentTheme.accent : 'rgba(255, 255, 255, 0.2)'}`,
              background: isControlsPinned ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
              color: currentTheme.textPrimary,
              cursor: 'pointer',
            }}
            title={isControlsPinned ? 'Controls permanently visible' : 'Controls auto-hide after 3.5s of idle'}
          >
            {isControlsPinned ? <Lock size={14} style={{ color: currentTheme.accent }} /> : <Unlock size={14} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: isDeckFullscreen ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
              color: currentTheme.textPrimary,
              cursor: 'pointer',
            }}
            title={isDeckFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Presentation'}
          >
            {isDeckFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>

          {/* Close Slide Mode Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Exit Slide Mode (Esc)"
          >
            <X size={15} />
            <span className="hide-mobile-sm">Exit</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CINEMATIC SCRIPTURE SLIDE BODY */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px clamp(20px, 5vw, 64px)',
          position: 'relative',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* Floating Left Arrow (Prev) */}
        <button
          type="button"
          onClick={goToPrevVerse}
          disabled={activeIdx <= 0 && !hasPrevChapter}
          style={{
            position: 'absolute',
            left: 'clamp(12px, 2.5vw, 32px)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'clamp(44px, 5vw, 60px)',
            height: 'clamp(44px, 5vw, 60px)',
            borderRadius: '50%',
            border: `1px solid ${currentTheme.cardBorder}`,
            background: currentTheme.cardBg,
            color: currentTheme.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: activeIdx <= 0 && !hasPrevChapter ? 'not-allowed' : 'pointer',
            opacity: areControlsVisible || isControlsPinned ? (activeIdx <= 0 && !hasPrevChapter ? 0.2 : 0.85) : 0,
            pointerEvents: areControlsVisible || isControlsPinned ? 'auto' : 'none',
            transition: 'all 0.25s ease',
            boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 15,
          }}
          title="Previous Verse (Left Arrow or Backspace)"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Floating Right Arrow (Next) */}
        <button
          type="button"
          onClick={goToNextVerse}
          disabled={activeIdx >= totalVerses - 1 && !hasNextChapter}
          style={{
            position: 'absolute',
            right: 'clamp(12px, 2.5vw, 32px)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'clamp(44px, 5vw, 60px)',
            height: 'clamp(44px, 5vw, 60px)',
            borderRadius: '50%',
            border: `1px solid ${currentTheme.cardBorder}`,
            background: currentTheme.cardBg,
            color: currentTheme.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: activeIdx >= totalVerses - 1 && !hasNextChapter ? 'not-allowed' : 'pointer',
            opacity: areControlsVisible || isControlsPinned ? (activeIdx >= totalVerses - 1 && !hasNextChapter ? 0.2 : 0.85) : 0,
            pointerEvents: areControlsVisible || isControlsPinned ? 'auto' : 'none',
            transition: 'all 0.25s ease',
            boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 15,
          }}
          title="Next Verse (Right Arrow or Spacebar)"
        >
          <ChevronRight size={28} />
        </button>

        {/* Active Verse Presentation Card with Smooth Slide Transition */}
        <div
          key={`${chapter}-${currentVerseNum}-${animatingKey}`}
          className={`scripture-slide-card slide-anim-${slideDirection}`}
          style={{
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            padding: 'clamp(24px, 4vw, 56px)',
            borderRadius: '24px',
            background: currentTheme.cardBg,
            border: `1px solid ${currentTheme.cardBorder}`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.65), 0 0 32px ${currentTheme.accentGlow}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            textAlign: activeVersionIds.length > 1 ? 'left' : 'center',
          }}
        >
          {/* Slide Header: Chapter & Verse Badge + Section Heading */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: activeVersionIds.length > 1 ? 'flex-start' : 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '999px',
                background: currentTheme.badgeBg,
                color: currentTheme.badgeText,
                border: `1px solid ${currentTheme.accent}`,
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span>{bookDisplayName}</span>
              <span>•</span>
              <span>
                {chapter}:{currentVerseNum}
              </span>
            </div>

            {currentVerseObj?.heading && (
              <h3
                style={{
                  margin: '4px 0 0 0',
                  fontSize: 'clamp(15px, 2vw, 20px)',
                  fontWeight: 600,
                  color: currentTheme.textSecondary,
                  letterSpacing: '0.02em',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {currentVerseObj.heading}
              </h3>
            )}
          </div>

          {/* Scripture Text: Single vs Parallel Layout */}
          {activeVersionIds.length === 1 ? (
            /* Single Column Grand Display */
            <div style={{ padding: '8px 0' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: `${activeFontSize.primaryPx}px`,
                  lineHeight: activeFontSize.lineH,
                  color: currentTheme.textPrimary,
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  textShadow: currentTheme.isLight
                    ? 'none'
                    : '0 2px 14px rgba(0,0,0,0.6)',
                }}
              >
                {currentVerseObj?.text || '—'}
              </p>
            </div>
          ) : (
            /* Parallel Translations Grid (2 to 4 columns) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(activeVersionIds.length, 3)}, minmax(280px, 1fr))`,
                gap: '24px',
                width: '100%',
              }}
            >
              {activeVersionIds.map((vId, idx) => {
                const verMeta = allVersions.find((v) => v.id === vId);
                const chData = chaptersByVersion[vId];
                const verseObj = chData?.verses.find((v) => v.verse === currentVerseNum);
                const isPrimary = idx === 0;

                return (
                  <div
                    key={vId}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '16px',
                      background: isPrimary
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.25)',
                      border: `1px solid ${isPrimary ? currentTheme.accent : 'rgba(255, 255, 255, 0.1)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isPrimary ? currentTheme.accent : currentTheme.textSecondary,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {verMeta?.name || verMeta?.shortName || vId.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: currentTheme.textSecondary,
                        }}
                      >
                        {verMeta?.shortName || vId.toUpperCase()}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: `${isPrimary ? activeFontSize.primaryPx : activeFontSize.subPx}px`,
                        lineHeight: activeFontSize.lineH,
                        color: currentTheme.textPrimary,
                        fontWeight: 400,
                      }}
                    >
                      {verseObj?.text || (isPrimary ? currentVerseObj?.text : '—')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM SLIDER & VERSE SCRUBBER (Auto-hides on idle) */}
      <footer
        className="slide-deck-footer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '16px 24px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: areControlsVisible || isControlsPinned ? 1 : 0,
          pointerEvents: areControlsVisible || isControlsPinned ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
          zIndex: 20,
        }}
      >
        {/* Interactive Slider Track (Range Scrubber) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: currentTheme.textSecondary, minWidth: '48px' }}>
            v. {activeIdx + 1}
          </span>

          <input
            type="range"
            min={0}
            max={Math.max(0, totalVerses - 1)}
            value={activeIdx}
            onChange={(e) => jumpToVerseIndex(parseInt(e.target.value, 10))}
            style={{
              flex: 1,
              accentColor: currentTheme.accent,
              cursor: 'pointer',
              height: '6px',
            }}
            title="Drag to slide across chapter verses"
          />

          <span style={{ fontSize: '12px', fontWeight: 600, color: currentTheme.textSecondary, minWidth: '48px', textAlign: 'right' }}>
            v. {totalVerses}
          </span>
        </div>

        {/* Thumbnail Verse Chips (Scrollable) */}
        <div
          ref={scrubberListRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            padding: '4px 8px',
            maxWidth: '1080px',
            margin: '0 auto',
            width: '100%',
            scrollbarWidth: 'none',
          }}
        >
          {versesList.map((vObj, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <button
                key={vObj.verse || idx}
                data-pill-idx={idx}
                type="button"
                onClick={() => jumpToVerseIndex(idx)}
                style={{
                  minWidth: '36px',
                  height: '32px',
                  borderRadius: '6px',
                  border: isSelected
                    ? `1px solid ${currentTheme.accent}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isSelected
                    ? currentTheme.accent
                    : 'rgba(255, 255, 255, 0.06)',
                  color: isSelected ? '#000000' : currentTheme.textPrimary,
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 0 12px ${currentTheme.accentGlow}` : 'none',
                }}
                title={`Jump to Verse ${vObj.verse || idx + 1}`}
              >
                {vObj.verse || idx + 1}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
