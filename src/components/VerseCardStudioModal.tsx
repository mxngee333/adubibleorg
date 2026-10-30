import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon, Sparkles, Sliders, Smartphone, Square } from 'lucide-react';

interface VerseCardStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  primaryVersionName: string;
  primaryText: string;
  secondaryVersionName?: string;
  secondaryText?: string;
  onOpenVideoStudio?: () => void;
}

export interface CardTheme {
  id: string;
  name: string;
  description: string;
  bgCenter: string;
  bgMid: string;
  bgOuter: string;
  accent: string;
  accentGlow: string;
  badgeBg: string;
  badgeText: string;
  textMain: string;
  textSub: string;
  isLight?: boolean;
  hasStars?: boolean;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'midnight-sanctuary',
    name: 'Midnight Sanctuary',
    description: 'Deep obsidian sapphire with subtle emerald sanctuary light',
    bgCenter: '#10243d',
    bgMid: '#080e18',
    bgOuter: '#020408',
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(16, 185, 129, 0.22)',
    badgeText: '#34d399',
    textMain: '#ffffff',
    textSub: '#94a3b8',
    hasStars: true,
  },
  {
    id: 'celestial-gold',
    name: 'Celestial Dawn',
    description: 'Radiant morning sunbeams and warm golden glory',
    bgCenter: '#3b2006',
    bgMid: '#1a0d02',
    bgOuter: '#070301',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.5)',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    badgeText: '#fbbf24',
    textMain: '#fffbeb',
    textSub: '#fde68a',
    hasStars: true,
  },
  {
    id: 'royal-tyrian',
    name: 'Royal Tyrian Velvet',
    description: 'Imperial purple & warm gold for majestic kingly scriptures',
    bgCenter: '#380e54',
    bgMid: '#180526',
    bgOuter: '#08020e',
    accent: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.45)',
    badgeBg: 'rgba(192, 132, 252, 0.22)',
    badgeText: '#e9d5ff',
    textMain: '#fbf7ff',
    textSub: '#d8b4fe',
    hasStars: true,
  },
  {
    id: 'deep-emerald',
    name: 'Emerald Grove',
    description: 'Tranquil sacred forest with life-giving living water glow',
    bgCenter: '#0b3824',
    bgMid: '#04170e',
    bgOuter: '#010704',
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.5)',
    badgeBg: 'rgba(16, 185, 129, 0.22)',
    badgeText: '#4ade80',
    textMain: '#f0fdf4',
    textSub: '#86efac',
    hasStars: true,
  },
  {
    id: 'sacred-flame',
    name: 'Sacred Flame',
    description: 'Deep amber warmth resembling candlelight sanctuary',
    bgCenter: '#3a1604',
    bgMid: '#1a0901',
    bgOuter: '#080301',
    accent: '#fb923c',
    accentGlow: 'rgba(251, 146, 60, 0.45)',
    badgeBg: 'rgba(251, 146, 60, 0.22)',
    badgeText: '#fdba74',
    textMain: '#fff7ed',
    textSub: '#fed7aa',
    hasStars: true,
  },
  {
    id: 'mount-sinai',
    name: 'Mount Sinai Stone',
    description: 'Clean slate granite with ultra-sharp sapphire contrast',
    bgCenter: '#222b3b',
    bgMid: '#10151f',
    bgOuter: '#06080c',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.4)',
    badgeBg: 'rgba(56, 189, 248, 0.22)',
    badgeText: '#7dd3fc',
    textMain: '#f8fafc',
    textSub: '#cbd5e1',
    hasStars: true,
  },
  {
    id: 'ancient-parchment',
    name: 'Ancient Parchment',
    description: 'Warm historic parchment paper with dark sepia ink',
    bgCenter: '#faf5ea',
    bgMid: '#eadcc3',
    bgOuter: '#d8caae',
    accent: '#854d0e',
    accentGlow: 'rgba(133, 77, 14, 0.25)',
    badgeBg: 'rgba(133, 77, 14, 0.16)',
    badgeText: '#713f12',
    textMain: '#291809',
    textSub: '#5a3d1c',
    isLight: true,
    hasStars: false,
  },
  {
    id: 'oled-black',
    name: 'Pure OLED Obsidian',
    description: 'True pitch black (#000000) with diamond gold accents',
    bgCenter: '#000000',
    bgMid: '#000000',
    bgOuter: '#000000',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeText: '#fbbf24',
    textMain: '#ffffff',
    textSub: '#a1a1aa',
    hasStars: false,
  },
];

type AspectRatio = '1:1' | '9:16';
type FontSizePreset = 'standard' | 'large' | 'cinema';

export const VerseCardStudioModal: React.FC<VerseCardStudioModalProps> = ({
  isOpen,
  onClose,
  reference,
  primaryVersionName,
  primaryText,
  secondaryVersionName,
  secondaryText,
  onOpenVideoStudio,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [fontSizePreset, setFontSizePreset] = useState<FontSizePreset>('standard');
  const [includeParallel, setIncludeParallel] = useState(Boolean(secondaryText));
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Deterministic Star Stardust Generation
  const stars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < reference.length; i++) {
      seed = (seed * 31 + reference.charCodeAt(i)) >>> 0;
    }
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed & 0xffff) / 0xffff;
    };
    const list: Array<{ x: number; y: number; r: number; alpha: number }> = [];
    for (let i = 0; i < 45; i++) {
      list.push({
        x: rand(),
        y: rand(),
        r: 0.8 + rand() * 1.8,
        alpha: 0.25 + rand() * 0.55,
      });
    }
    return list;
  }, [reference]);

  // Canvas Render Loop
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = aspectRatio === '9:16' ? 1920 : 1080;
    canvas.width = W;
    canvas.height = H;

    // 1. BACKGROUND RENDERING
    if (selectedTheme.id === 'oled-black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
    } else {
      // Radial glow gradient matching ScriptureSlideDeckModal
      const grad = ctx.createRadialGradient(
        W / 2,
        H * 0.28,
        50,
        W / 2,
        H * 0.48,
        Math.max(W, H) * 0.82
      );
      grad.addColorStop(0, selectedTheme.bgCenter);
      grad.addColorStop(0.55, selectedTheme.bgMid);
      grad.addColorStop(1, selectedTheme.bgOuter);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Central divine light bloom
      const bloom = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, W * 0.55);
      bloom.addColorStop(0, selectedTheme.accentGlow);
      bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      // Parchment subtle organic texture simulation
      if (selectedTheme.isLight) {
        ctx.fillStyle = 'rgba(120, 80, 30, 0.035)';
        for (let i = 0; i < 40; i++) {
          const px = Math.random() * W;
          const py = Math.random() * H;
          const pw = 20 + Math.random() * 80;
          ctx.fillRect(px, py, pw, 1.2);
        }
      }

      // Celestial Stardust Flecks
      if (selectedTheme.hasStars) {
        ctx.save();
        stars.forEach((s) => {
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * 0.7})`;
          ctx.shadowColor = selectedTheme.accent;
          ctx.shadowBlur = s.r * 2.5;
          ctx.fill();
        });
        ctx.restore();
      }

      // Soft perimeter vignette
      const vignette = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.45,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.75
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, selectedTheme.isLight ? 'rgba(80, 50, 20, 0.22)' : 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. ORNATE DOUBLE FRAMING & CORNER FLOURISHES
    const padOuter = 46;
    const padInner = 60;
    ctx.save();
    ctx.strokeStyle = selectedTheme.accent;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(padOuter, padOuter, W - padOuter * 2, H - padOuter * 2);

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = selectedTheme.accent;
    ctx.globalAlpha = 0.65;
    ctx.strokeRect(padInner, padInner, W - padInner * 2, H - padInner * 2);
    ctx.globalAlpha = 1.0;

    // Corner Diamond Flourishes
    const cornerOffsets = [
      [padInner + 14, padInner + 14],
      [W - padInner - 14, padInner + 14],
      [padInner + 14, H - padInner - 14],
      [W - padInner - 14, H - padInner - 14],
    ];
    ctx.fillStyle = selectedTheme.accent;
    cornerOffsets.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7);
      ctx.lineTo(cx + 7, cy);
      ctx.lineTo(cx, cy + 7);
      ctx.lineTo(cx - 7, cy);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();

    // 3. FONT SIZING & DYNAMIC TYPOGRAPHY ENGINE
    const fontMultiplier =
      fontSizePreset === 'cinema' ? 1.28 : fontSizePreset === 'large' ? 1.15 : 1.0;
    const hasParallel = Boolean(includeParallel && secondaryText && secondaryVersionName);

    // Compute text lengths
    const pLen = primaryText.length;
    const sLen = secondaryText ? secondaryText.length : 0;
    const maxLen = Math.max(pLen, sLen);

    // Compute base sizes
    let primaryFontSize: number;
    let primaryLineHeight: number;
    let secondaryFontSize = 0;
    let secondaryLineHeight = 0;
    let refFontSize = 52;

    if (!hasParallel) {
      if (pLen < 80) {
        primaryFontSize = 66;
        primaryLineHeight = 92;
      } else if (pLen < 150) {
        primaryFontSize = 56;
        primaryLineHeight = 80;
      } else if (pLen < 250) {
        primaryFontSize = 48;
        primaryLineHeight = 70;
      } else if (pLen < 380) {
        primaryFontSize = 42;
        primaryLineHeight = 62;
      } else {
        primaryFontSize = 36;
        primaryLineHeight = 54;
      }
      primaryFontSize = Math.round(primaryFontSize * fontMultiplier);
      primaryLineHeight = Math.round(primaryLineHeight * fontMultiplier);
    } else {
      if (maxLen < 120) {
        primaryFontSize = 46;
        primaryLineHeight = 66;
        secondaryFontSize = 40;
        secondaryLineHeight = 58;
      } else if (maxLen < 220) {
        primaryFontSize = 40;
        primaryLineHeight = 58;
        secondaryFontSize = 35;
        secondaryLineHeight = 50;
      } else if (maxLen < 340) {
        primaryFontSize = 35;
        primaryLineHeight = 50;
        secondaryFontSize = 31;
        secondaryLineHeight = 44;
      } else {
        primaryFontSize = 30;
        primaryLineHeight = 44;
        secondaryFontSize = 27;
        secondaryLineHeight = 38;
      }
      primaryFontSize = Math.round(primaryFontSize * fontMultiplier);
      primaryLineHeight = Math.round(primaryLineHeight * fontMultiplier);
      secondaryFontSize = Math.round(secondaryFontSize * fontMultiplier);
      secondaryLineHeight = Math.round(secondaryLineHeight * fontMultiplier);
      refFontSize = 48;
    }

    // Wrap Text Helper with Canvas Measurement
    const wrapLines = (text: string, maxWidth: number, font: string): string[] => {
      ctx.font = font;
      const words = text.split(' ');
      const lines: string[] = [];
      let curLine = '';
      for (let i = 0; i < words.length; i++) {
        const testLine = curLine ? `${curLine} ${words[i]}` : words[i];
        const m = ctx.measureText(testLine);
        if (m.width > maxWidth && curLine) {
          lines.push(curLine);
          curLine = words[i];
        } else {
          curLine = testLine;
        }
      }
      if (curLine) lines.push(curLine);
      return lines;
    };

    const maxTextWidth = W - 220;
    const primaryFontString = `italic ${primaryFontSize}px Georgia, "Playfair Display", serif`;
    let primaryLines = wrapLines(`“${primaryText}”`, maxTextWidth, primaryFontString);

    let secondaryFontString = '';
    let secondaryLines: string[] = [];
    if (hasParallel && secondaryText) {
      secondaryFontString = `${secondaryFontSize}px Georgia, "Playfair Display", serif`;
      secondaryLines = wrapLines(`“${secondaryText}”`, maxTextWidth, secondaryFontString);
    }

    // 4. VERTICAL CENTERING CALCULUS
    // Height components
    const refBlockH = refFontSize + 28;
    const versionBadgeH = 34 + 24;
    const primaryTextH = primaryLines.length * primaryLineHeight;
    const dividerH = hasParallel ? 48 : 0;
    const secondaryBadgeH = hasParallel ? 34 + 22 : 0;
    const secondaryTextH = hasParallel ? secondaryLines.length * secondaryLineHeight : 0;
    const footerMarginH = 110;

    let totalContentH =
      refBlockH +
      versionBadgeH +
      primaryTextH +
      dividerH +
      secondaryBadgeH +
      secondaryTextH;

    const maxAvailableH = H - footerMarginH - 120;

    // Safety Auto-Scaling Clamp: if content exceeds card height, scale font down safely
    if (totalContentH > maxAvailableH) {
      const scaleDown = maxAvailableH / totalContentH;
      primaryFontSize = Math.max(24, Math.round(primaryFontSize * scaleDown));
      primaryLineHeight = Math.max(34, Math.round(primaryLineHeight * scaleDown));
      if (hasParallel) {
        secondaryFontSize = Math.max(22, Math.round(secondaryFontSize * scaleDown));
        secondaryLineHeight = Math.max(30, Math.round(secondaryLineHeight * scaleDown));
      }
      primaryLines = wrapLines(
        `“${primaryText}”`,
        maxTextWidth,
        `italic ${primaryFontSize}px Georgia, "Playfair Display", serif`
      );
      if (hasParallel && secondaryText) {
        secondaryLines = wrapLines(
          `“${secondaryText}”`,
          maxTextWidth,
          `${secondaryFontSize}px Georgia, "Playfair Display", serif`
        );
      }
      totalContentH =
        refBlockH +
        versionBadgeH +
        primaryLines.length * primaryLineHeight +
        dividerH +
        secondaryBadgeH +
        secondaryLines.length * secondaryLineHeight;
    }

    // Golden Vertical Origin: perfectly centered between frame top (80px) and footer (H - 90px)
    let y = Math.max(110, Math.round((H - 85 - totalContentH) / 2));

    // 5. DRAW REFERENCE TITLE (e.g. "◆ GENESIS 1:22 ◆")
    ctx.textAlign = 'center';
    ctx.fillStyle = selectedTheme.textMain;
    ctx.font = `bold ${refFontSize}px Georgia, "Playfair Display", serif`;
    ctx.shadowColor = selectedTheme.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = selectedTheme.isLight ? 0 : 10;
    ctx.shadowOffsetY = 2;

    const refString = `◆  ${reference.toUpperCase()}  ◆`;
    ctx.fillText(refString, W / 2, y + refFontSize);
    y += refFontSize + 28;

    // Draw Version Pill Badge Helper
    const drawVersionBadge = (badgeText: string, currentY: number) => {
      ctx.save();
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textM = ctx.measureText(badgeText);
      const bW = Math.max(90, textM.width + 36);
      const bH = 34;
      const bX = (W - bW) / 2;
      const bY = currentY;

      // Rounded Pill Shape
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 17);
      ctx.fillStyle = selectedTheme.badgeBg;
      ctx.fill();
      ctx.strokeStyle = selectedTheme.accent;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = selectedTheme.badgeText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, W / 2, bY + bH / 2);
      ctx.restore();
    };

    // 6. DRAW PRIMARY VERSION BADGE
    drawVersionBadge(primaryVersionName.toUpperCase(), y);
    y += 34 + 24;

    // 7. DRAW PRIMARY SCRIPTURE TEXT
    ctx.font = `italic ${primaryFontSize}px Georgia, "Playfair Display", serif`;
    ctx.fillStyle = selectedTheme.textMain;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = selectedTheme.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = selectedTheme.isLight ? 0 : 12;
    ctx.shadowOffsetY = 2;

    for (let i = 0; i < primaryLines.length; i++) {
      ctx.fillText(primaryLines[i], W / 2, y + primaryFontSize * 0.85);
      y += primaryLineHeight;
    }

    // 8. PARALLEL SECTION (IF INCLUDED)
    if (hasParallel && secondaryText && secondaryVersionName) {
      y += 18;

      // Ornate Divider: Fade Out Horizontal Lines with Central Diamond
      ctx.save();
      const divW = 320;
      const gradLine = ctx.createLinearGradient((W - divW) / 2, 0, (W + divW) / 2, 0);
      gradLine.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradLine.addColorStop(0.5, selectedTheme.accent);
      gradLine.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = gradLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo((W - divW) / 2, y);
      ctx.lineTo((W + divW) / 2, y);
      ctx.stroke();

      // Central Diamond
      ctx.fillStyle = selectedTheme.accent;
      ctx.beginPath();
      ctx.moveTo(W / 2, y - 6);
      ctx.lineTo(W / 2 + 6, y);
      ctx.lineTo(W / 2, y + 6);
      ctx.lineTo(W / 2 - 6, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      y += 30;

      // Secondary Version Badge
      drawVersionBadge(secondaryVersionName.toUpperCase(), y);
      y += 34 + 22;

      // Secondary Scripture Text
      ctx.font = `${secondaryFontSize}px Georgia, "Playfair Display", serif`;
      ctx.fillStyle = selectedTheme.textSub;
      ctx.textAlign = 'center';
      ctx.shadowColor = selectedTheme.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = selectedTheme.isLight ? 0 : 8;

      for (let i = 0; i < secondaryLines.length; i++) {
        ctx.fillText(secondaryLines[i], W / 2, y + secondaryFontSize * 0.85);
        y += secondaryLineHeight;
      }
    }

    // 9. CLEAN SOVEREIGN FOOTER (Strictly "AduBible.org", Preheader Purged)
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillStyle = selectedTheme.accent;
    ctx.fillText('AduBible.org', W / 2, H - 75);
    ctx.restore();
  }, [
    isOpen,
    selectedTheme,
    aspectRatio,
    fontSizePreset,
    includeParallel,
    reference,
    primaryVersionName,
    primaryText,
    secondaryVersionName,
    secondaryText,
    stars,
  ]);

  if (!isOpen) return null;

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `adubible-verse-${reference.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${aspectRatio.replace(':', 'x')}.png`;
    a.click();
  };

  const handleCopyCitation = () => {
    const citation =
      includeParallel && secondaryText
        ? `${reference} (${primaryVersionName})\n"${primaryText}"\n\n${reference} (${secondaryVersionName})\n"${secondaryText}"\n— via AduBible (Adubible.org)`
        : `${reference} (${primaryVersionName})\n"${primaryText}"\n— via AduBible (Adubible.org)`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verse-card-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Header with Labeled High-Contrast Close Button */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-5 py-3 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="h-5 w-5 text-[var(--green)] shrink-0" />
            <h3 id="verse-card-title" className="text-sm sm:text-base font-bold text-[var(--ink)] truncate">
              Verse Card Studio — {reference}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] font-bold text-xs transition shrink-0 ml-2 shadow-sm cursor-pointer"
            aria-label="Close Verse Card"
            title="Close Verse Card (Esc)"
          >
            <X className="h-4 w-4 text-[var(--green)]" />
            <span>Close</span>
          </button>
        </div>

        {/* Scrollable Studio Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
            {/* Visual Canvas Display */}
            <div className="md:col-span-3 flex flex-col items-center justify-center gap-3">
              <div
                className="w-full flex items-center justify-center rounded-xl p-2 bg-black/50 border border-[var(--line)] shadow-xl overflow-hidden"
                style={{
                  maxHeight: '440px',
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="rounded-lg shadow-2xl max-h-[420px] w-auto max-w-full object-contain transition-all"
                  style={{
                    aspectRatio: aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
                  }}
                />
              </div>

              {/* Format & Aspect Ratio Selector */}
              <div className="flex items-center gap-2 w-full justify-center">
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    aspectRatio === '1:1'
                      ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--green)] shadow-sm'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
                  }`}
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>1:1 Square (Feed)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--green)] shadow-sm'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>9:16 Vertical (Story / Status)</span>
                </button>
              </div>
            </div>

            {/* Controls Suite */}
            <div className="md:col-span-2 space-y-4">
              {/* Sanctuary Background Theme Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--green)]" />
                    <span>Card Art Theme</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--subtle)]">8 Themes</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CARD_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold text-left transition cursor-pointer ${
                        selectedTheme.id === t.id
                          ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--ink)] shadow-sm ring-1 ring-[var(--green)]'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:border-[var(--green)] hover:text-[var(--ink)]'
                      }`}
                      title={t.description}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                        style={{ background: t.accent }}
                      />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Preset Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-1.5 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[var(--green)]" />
                  <span>Font Size Scale</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setFontSizePreset('standard')}
                    className={`rounded-lg border py-1.5 text-xs font-semibold text-center transition cursor-pointer ${
                      fontSizePreset === 'standard'
                        ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--green)] font-bold'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizePreset('large')}
                    className={`rounded-lg border py-1.5 text-xs font-semibold text-center transition cursor-pointer ${
                      fontSizePreset === 'large'
                        ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--green)] font-bold'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
                    }`}
                  >
                    Large
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizePreset('cinema')}
                    className={`rounded-lg border py-1.5 text-xs font-semibold text-center transition cursor-pointer ${
                      fontSizePreset === 'cinema'
                        ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--green)] font-bold'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
                    }`}
                  >
                    Cinema XL
                  </button>
                </div>
              </div>

              {/* Parallel Toggle */}
              {secondaryText && (
                <label className="flex items-center gap-2 text-xs text-[var(--ink)] cursor-pointer bg-[var(--surface)] p-2 rounded-xl border border-[var(--line)]">
                  <input
                    type="checkbox"
                    checked={includeParallel}
                    onChange={(e) => setIncludeParallel(e.target.checked)}
                    className="rounded accent-[var(--green)] h-4 w-4"
                  />
                  <span className="font-medium">Include Parallel ({secondaryVersionName})</span>
                </label>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {onOpenVideoStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenVideoStudio();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--soft)] py-2.5 text-xs font-bold text-[var(--green)] hover:opacity-90 shadow-md transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-[var(--green)]" />
                    <span>🎬 Switch to 10s Video Studio</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)] py-2.5 text-xs font-bold text-[var(--paper)] hover:opacity-90 transition shadow-md cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download 1080p Verse Card (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCitation}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--soft)] transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Copied Parallel Citation!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[var(--green)]" />
                      <span>Copy Parallel Text Citation</span>
                    </>
                  )}
                </button>

                {/* Explicit Bottom Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--soft)] py-2.5 text-xs font-bold text-[var(--subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Close Card &amp; Return to Reading</span>
                </button>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5 text-[11px] text-[var(--subtle)] flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[var(--green)] shrink-0 mt-0.5" />
                <span>
                  High-res 1080p card with clean <span className="font-semibold text-[var(--green)]">AduBible.org</span> watermark. Zero ads.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
