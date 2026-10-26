import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface VerseCardStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  primaryVersionName: string;
  primaryText: string;
  secondaryVersionName?: string;
  secondaryText?: string;
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
}) => {
  const [selectedTheme, setSelectedTheme] = useState(STUDIO_THEMES[0]);
  const [includeParallel, setIncludeParallel] = useState(Boolean(secondaryText));
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    ctx.fillText('✦ ELOHIM BIBLE HUB • PARALLEL SCRIPTURE ✦', W / 2, 130);

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
    ctx.fillText('ELOHIM BIBLE HUB • AD-FREE PARALLEL SCRIPTURE & EXEGESIS', W / 2, H - 90);
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
    a.download = `elohim-verse-${reference.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    a.click();
  };

  const handleCopyCitation = () => {
    const citation =
      includeParallel && secondaryText
        ? `${reference} (${primaryVersionName})\n"${primaryText}"\n\n${reference} (${secondaryVersionName})\n"${secondaryText}"\n— via Elohim Bible Hub`
        : `${reference} (${primaryVersionName})\n"${primaryText}"\n— via Elohim Bible Hub`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-amber-200">
              Parallel Verse Art &amp; Citation Studio — {reference}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-5 gap-5 items-center">
          <div className="md:col-span-3 flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full max-w-[340px] aspect-square rounded-xl border border-amber-500/30 shadow-xl"
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Sanctuary Art Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STUDIO_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition ${
                      selectedTheme.id === t.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {secondaryText && (
              <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeParallel}
                  onChange={(e) => setIncludeParallel(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>Include Parallel ({secondaryVersionName}) on Card</span>
              </label>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownloadImage}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition"
              >
                <Download className="h-4 w-4" />
                Download 1080p Verse Card (PNG)
              </button>
              <button
                onClick={handleCopyCitation}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-800 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Copied Parallel Citation!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-amber-400" />
                    Copy Parallel Text Citation
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3 text-[11px] text-stone-400 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Zero watermarks or third-party ads. Ready to share on WhatsApp, Telegram, X, or sermon slides.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
