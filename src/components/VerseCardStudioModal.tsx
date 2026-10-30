import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon, Sparkles, BookOpen } from 'lucide-react';

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

const STUDIO_THEMES = [
  {
    id: 'imperial',
    name: 'Imperial Gold',
    bgStart: '#0c0a09',
    bgEnd: '#292018',
    accent: '#f59e0b',
    textMain: '#fafaf9',
    textSub: '#fde68a',
  },
  {
    id: 'parchment',
    name: 'Sacred Parchment',
    bgStart: '#f5f0e6',
    bgEnd: '#e6dcc8',
    accent: '#92400e',
    textMain: '#1c1917',
    textSub: '#78350f',
  },
  {
    id: 'celestial',
    name: 'Celestial Sapphire',
    bgStart: '#081426',
    bgEnd: '#0f2942',
    accent: '#38bdf8',
    textMain: '#f0f9ff',
    textSub: '#bae6fd',
  },
  {
    id: 'covenant',
    name: 'Covenant Emerald',
    bgStart: '#061c14',
    bgEnd: '#0c3829',
    accent: '#34d399',
    textMain: '#ecfdf5',
    textSub: '#a7f3d0',
  },
];

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
  const [selectedTheme, setSelectedTheme] = useState(STUDIO_THEMES[0]);
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

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, selectedTheme.bgStart);
    grad.addColorStop(1, selectedTheme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ornamental Double Frame
    ctx.strokeStyle = selectedTheme.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.lineWidth = 1;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    // Header Badge
    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ADUBIBLE • ADUBIBLE.ORG ✦', W / 2, 130);

    // Reference Title
    ctx.fillStyle = selectedTheme.textMain;
    ctx.font = 'bold 46px Georgia, serif';
    ctx.fillText(reference.toUpperCase(), W / 2, 200);

    const wrapParagraph = (
      text: string,
      x: number,
      startY: number,
      maxWidth: number,
      lineHeight: number,
      font: string,
      color: string
    ): number => {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      const words = text.split(' ');
      let line = '';
      let y = startY;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), x, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), x, y);
        y += lineHeight;
      }
      return y;
    };

    let currentY = 290;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = selectedTheme.accent;
    ctx.fillText(`[ ${primaryVersionName} ]`, W / 2, currentY);
    currentY += 52;

    currentY = wrapParagraph(
      `“${primaryText}”`,
      W / 2,
      currentY,
      W - 220,
      48,
      'italic 34px Georgia, serif',
      selectedTheme.textMain
    );

    if (includeParallel && secondaryText && secondaryVersionName) {
      currentY += 40;
      ctx.strokeStyle = selectedTheme.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 140, currentY);
      ctx.lineTo(W / 2 + 140, currentY);
      ctx.stroke();

      currentY += 50;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = selectedTheme.accent;
      ctx.fillText(`[ ${secondaryVersionName} ]`, W / 2, currentY);
      currentY += 50;

      wrapParagraph(
        `“${secondaryText}”`,
        W / 2,
        currentY,
        W - 220,
        46,
        '32px Georgia, serif',
        selectedTheme.textSub
      );
    }

    // Footer Signature
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = selectedTheme.accent;
    ctx.fillText('ADUBIBLE.ORG • THE LEGACY OF APOSTLE KWAME ADU', W / 2, H - 90);
  }, [
    isOpen,
    selectedTheme,
    includeParallel,
    reference,
    primaryVersionName,
    primaryText,
    secondaryVersionName,
    secondaryText,
  ]);

  if (!isOpen) return null;

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `adubible-verse-${reference.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
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
        // Dismiss when clicking outer dark backdrop
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-center">
            {/* Visual Canvas Display */}
            <div className="md:col-span-3 flex justify-center">
              <canvas
                ref={canvasRef}
                className="w-full max-w-[320px] sm:max-w-[340px] aspect-square rounded-xl border border-[var(--line)] shadow-xl"
              />
            </div>

            {/* Controls Suite */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-2">
                  Sanctuary Art Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STUDIO_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                        selectedTheme.id === t.id
                          ? 'border-[var(--green)] bg-[var(--soft)] text-[var(--ink)] shadow-sm'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)] hover:border-[var(--green)]'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {secondaryText && (
                <label className="flex items-center gap-2 text-xs text-[var(--ink)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeParallel}
                    onChange={(e) => setIncludeParallel(e.target.checked)}
                    className="rounded accent-[var(--green)]"
                  />
                  <span>Include Parallel ({secondaryVersionName}) on Card</span>
                </label>
              )}

              <div className="space-y-2.5 pt-1">
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

              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-[11px] text-[var(--subtle)] flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[var(--green)] shrink-0 mt-0.5" />
                <span>
                  Zero watermarks or third-party ads. Ready to share on WhatsApp, Telegram, X, or sermon slides.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
