import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  Search,
  Check,
  Film,
  Music,
  ExternalLink,
} from 'lucide-react';
import {
  StatusVideoRenderer,
  STATUS_THEMES,
  StatusVideoTheme,
  VideoAspectRatio,
} from '../services/statusVideoEngine';
import {
  GOOGLE_NEURAL_VOICES,
  GoogleNeuralVoiceName,
} from '../services/neuralTtsService';

export interface AnimatedStatusStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
  initialText?: string;
  initialVersionName?: string;
  initialSecondaryText?: string;
  initialSecondaryVersionName?: string;
  langCode?: string;
}

interface QuickInspiration {
  reference: string;
  version: string;
  text: string;
  topic: string;
}

const QUICK_INSPIRATIONS: QuickInspiration[] = [
  {
    reference: 'John 3:16',
    version: 'NKJV',
    text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
    topic: 'Salvation & Love',
  },
  {
    reference: 'Psalm 23:1-3',
    version: 'NKJV',
    text: 'The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters. He restores my soul.',
    topic: 'Peace & Comfort',
  },
  {
    reference: 'Philippians 4:13',
    version: 'NKJV',
    text: 'I can do all things through Christ who strengthens me.',
    topic: 'Strength & Victory',
  },
  {
    reference: 'Romans 8:28',
    version: 'NKJV',
    text: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
    topic: 'Hope & Purpose',
  },
  {
    reference: 'Isaiah 40:31',
    version: 'NKJV',
    text: 'Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.',
    topic: 'Renewal',
  },
  {
    reference: 'Efesofoɔ 1:3',
    version: 'ASANTE TWI',
    text: 'Nhyira nka yɛn Awurade Yesu Kristo Nyankopɔn ne n’Agya no a ɔnam Kristo so de honhom mu nhyira nyinaa a ɛwɔ soro adom yɛn.',
    topic: 'Twi · Nhyira (Blessings)',
  },
  {
    reference: 'Dwom 23:1',
    version: 'ASANTE TWI',
    text: 'Awurade ne me hwɛfoɔ, hwee renhia me. Ɔma meda wura foforɔ mu, ɔgya me kɔ nsu a ɛho dwoɔ ho.',
    topic: 'Twi · Asomdwoeɛ (Peace)',
  },
  {
    reference: 'Proverbs 3:5-6',
    version: 'KJV',
    text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    topic: 'Guidance & Faith',
  },
];

export const AnimatedStatusStudioModal: React.FC<AnimatedStatusStudioModalProps> = ({
  isOpen,
  onClose,
  initialReference = 'John 3:16',
  initialText = 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
  initialVersionName = 'NKJV',
  initialSecondaryText,
  initialSecondaryVersionName,
  langCode = 'en',
}) => {
  // Scripture state
  const [reference, setReference] = useState(initialReference);
  const [verseText, setVerseText] = useState(initialText);
  const [versionName, setVersionName] = useState(initialVersionName);
  const [secondaryText, setSecondaryText] = useState(initialSecondaryText || '');
  const [secondaryVersionName, setSecondaryVersionName] = useState(initialSecondaryVersionName || '');
  const [includeSecondary, setIncludeSecondary] = useState(Boolean(initialSecondaryText));

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Video customization state
  const [selectedTheme, setSelectedTheme] = useState<StatusVideoTheme>(STATUS_THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('3:4');
  const [voiceName, setVoiceName] = useState<GoogleNeuralVoiceName>('Charon');
  const [includeAmbientMusic, setIncludeAmbientMusic] = useState<boolean>(true);

  // Playback & Export state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [audioLoaded, setAudioLoaded] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [shareNotice, setShareNotice] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StatusVideoRenderer | null>(null);
  const stopPreviewRef = useRef<(() => void) | null>(null);

  // Update when initial props change
  useEffect(() => {
    if (initialReference) setReference(initialReference);
    if (initialText) setVerseText(initialText);
    if (initialVersionName) setVersionName(initialVersionName);
    if (initialSecondaryText) {
      setSecondaryText(initialSecondaryText);
      setIncludeSecondary(true);
    }
    if (initialSecondaryVersionName) setSecondaryVersionName(initialSecondaryVersionName);
  }, [initialReference, initialText, initialVersionName, initialSecondaryText, initialSecondaryVersionName]);

  // Initialize or reconfigure renderer
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    if (!rendererRef.current) {
      rendererRef.current = new StatusVideoRenderer(canvasRef.current, {
        reference,
        versionName,
        verseText,
        secondaryVersionName: includeSecondary ? secondaryVersionName : undefined,
        secondaryText: includeSecondary ? secondaryText : undefined,
        theme: selectedTheme,
        aspectRatio,
        durationSeconds: 10.0,
        voiceName,
        langCode,
        includeAmbientMusic,
      });
    } else {
      rendererRef.current.updateOptions({
        reference,
        versionName,
        verseText,
        secondaryVersionName: includeSecondary ? secondaryVersionName : undefined,
        secondaryText: includeSecondary ? secondaryText : undefined,
        theme: selectedTheme,
        aspectRatio,
        voiceName,
        langCode,
        includeAmbientMusic,
      });
    }

    // Draw initial 0s frame
    rendererRef.current.drawFrame(0);

    return () => {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
        stopPreviewRef.current = null;
      }
    };
  }, [isOpen, reference, versionName, verseText, secondaryText, secondaryVersionName, includeSecondary, selectedTheme, aspectRatio, voiceName, langCode, includeAmbientMusic]);

  // Cleanup renderer on modal unmount
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      if (exportedUrl) {
        URL.revokeObjectURL(exportedUrl);
      }
    };
  }, []);

  // Preload 24kHz Neural Audio when verse or voice changes
  const handlePreloadAudio = useCallback(async () => {
    if (!rendererRef.current) return;
    setAudioLoading(true);
    try {
      const ok = await rendererRef.current.preloadAudio();
      setAudioLoaded(ok);
    } catch {
      setAudioLoaded(false);
    } finally {
      setAudioLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      handlePreloadAudio();
    }
  }, [isOpen, verseText, voiceName, handlePreloadAudio]);

  // Toggle Play / Pause preview
  const handleTogglePlay = () => {
    if (!rendererRef.current) return;

    if (isPlaying) {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
        stopPreviewRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      stopPreviewRef.current = rendererRef.current.playPreview(
        (sec) => setPlaybackSeconds(sec),
        () => {
          setIsPlaying(false);
          setPlaybackSeconds(10.0);
        }
      );
    }
  };

  const handleResetPreview = () => {
    if (stopPreviewRef.current) {
      stopPreviewRef.current();
      stopPreviewRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackSeconds(0);
    if (rendererRef.current) {
      rendererRef.current.drawFrame(0);
    }
  };

  // Video Export pipeline (10s Canvas Capture + Audio)
  const handleExportVideo = async () => {
    if (!rendererRef.current) return;
    if (isPlaying && stopPreviewRef.current) {
      stopPreviewRef.current();
      stopPreviewRef.current = null;
      setIsPlaying(false);
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await rendererRef.current.exportVideo((pct) => {
        setExportProgress(pct);
      });

      setExportedBlob(blob);
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);

      // Trigger instant automatic download
      const cleanRef = reference.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `AduBible_${cleanRef}_${aspectRatio.replace(':', 'x')}_10s_Status.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShareNotice(`✅ 10s Status Video exported as "${filename}"! Ready for WhatsApp Status & Stories.`);
      setTimeout(() => setShareNotice(''), 6000);
    } catch (err: any) {
      setShareNotice(`⚠️ Export notice: ${err?.message || 'Could not export video'}`);
      setTimeout(() => setShareNotice(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Social Share Handlers
  const getShareText = () => {
    return `"${verseText}" — ${reference} (${versionName})\n\n✨ Created with AduBible Status Sanctuary • 100% Free & Ad-Free Parallel Bible in 35+ Languages at https://adubible.org/`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Also trigger mobile native share sheet if video file is exported
    if (navigator.share && exportedBlob) {
      const file = new File([exportedBlob], `AduBible_${reference.replace(/\s+/g, '_')}_Status.mp4`, {
        type: exportedBlob.type,
      });
      navigator.share({
        title: `${reference} — AduBible Status`,
        text: getShareText(),
        files: [file],
      }).catch(() => {});
    }
  };

  const handleShareFacebook = () => {
    const quote = encodeURIComponent(getShareText());
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://adubible.org/')}&quote=${quote}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${verseText.slice(0, 160)}..." — ${reference}\n\nRead free at Adubible.org`);
    const twUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent('https://adubible.org/')}&hashtags=AduBible,BibleVerse,Faith,Scripture`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTikTokOrYouTube = (platform: 'tiktok' | 'youtube') => {
    // If not exported yet, trigger export first
    if (!exportedUrl) {
      handleExportVideo();
    }
    // Copy optimized metadata caption to clipboard
    const caption = `"${verseText}" — ${reference} (${versionName}) #AduBible #BibleVerse #Scripture #Faith #God #Jesus #DailyBible #Christian #AdubibleOrg`;
    navigator.clipboard.writeText(caption);
    setShareNotice(`📋 ${platform === 'youtube' ? 'YouTube Shorts' : 'TikTok'} title & tags copied to clipboard! Video downloaded.`);
    setTimeout(() => setShareNotice(''), 6000);
  };

  const handleNativeShare = async () => {
    const title = `${reference} — AduBible Status`;
    const text = getShareText();

    if (navigator.share) {
      try {
        if (exportedBlob) {
          const file = new File([exportedBlob], `AduBible_${reference.replace(/\s+/g, '_')}_Status.mp4`, {
            type: exportedBlob.type,
          });
          await navigator.share({ title, text, files: [file] });
        } else {
          await navigator.share({ title, text, url: 'https://adubible.org/' });
        }
        setShareNotice('✨ Shared successfully!');
        setTimeout(() => setShareNotice(''), 4000);
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      setShareNotice('📋 Verse quote copied to clipboard!');
      setTimeout(() => setShareNotice(''), 4000);
    }
  };

  // Quick Inspiration selection
  const handleSelectInspiration = (item: QuickInspiration) => {
    setReference(item.reference);
    setVersionName(item.version);
    setVerseText(item.text);
  };

  // Filtered inspirations by search
  const filteredInspirations = QUICK_INSPIRATIONS.filter((q) => {
    if (!searchQuery.trim()) return true;
    const qLower = searchQuery.toLowerCase();
    return (
      q.reference.toLowerCase().includes(qLower) ||
      q.topic.toLowerCase().includes(qLower) ||
      q.text.toLowerCase().includes(qLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-studio-title"
    >
      <div className="relative w-full max-w-5xl bg-[var(--paper)] border border-[var(--line)] rounded-2xl shadow-2xl text-[var(--ink)] overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center text-[var(--green)]">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 id="status-studio-title" className="text-base sm:text-lg font-serif font-bold text-[var(--ink)] flex items-center gap-2">
                10s Animated Scripture Status Studio
                <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--soft)] text-[var(--green)] border border-[var(--line)]">
                  Viral Reels
                </span>
              </h2>
              <p className="text-xs text-[var(--subtle)]">
                Generate 10s kinetic text videos with 24kHz Google neural voice &amp; permanent <span className="text-[var(--green)] font-semibold">Adubible.org</span> watermark
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--ink)] hover:bg-[var(--soft)] transition-colors"
            aria-label="Close Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Toast */}
        {shareNotice && (
          <div className="px-4 py-2 bg-amber-500/20 border-b border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
            <span>{shareNotice}</span>
            <button type="button" onClick={() => setShareNotice('')} className="text-amber-400 hover:text-amber-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main 2-Column Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls, Search, Themes & Voices (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Scripture Passage Input & Search */}
            <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Scripture Passage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. John 3:16"
                    className="w-28 sm:w-36 text-xs bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-stone-100 font-semibold focus:border-amber-500 outline-none"
                  />
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="NKJV"
                    className="w-20 text-xs bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-amber-300 font-semibold focus:border-amber-500 outline-none text-center"
                  />
                </div>
              </div>

              <textarea
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm bg-stone-900 border border-stone-800 rounded-lg p-3 text-stone-100 font-serif leading-relaxed focus:border-amber-500/60 outline-none resize-none"
                placeholder="Enter scripture verse text for 10s kinetic animation..."
              />

              {/* Quick Inspiration Pills */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-semibold">Quick Scripture Inspirations:</span>
                  <div className="flex items-center gap-1">
                    <Search className="w-3 h-3 text-stone-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter topic or book..."
                      className="text-[10px] bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-stone-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {filteredInspirations.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectInspiration(item)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left flex items-center gap-1.5 ${
                        reference === item.reference
                          ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold'
                          : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-stone-100'
                      }`}
                    >
                      <span className="text-amber-400 font-medium">{item.reference}</span>
                      <span className="text-stone-500 text-[10px]">({item.topic})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Theme Shaders & Backgrounds */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Cinematic Theme Shaders
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATUS_THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30'
                          : 'border-stone-800 hover:border-stone-700'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold" style={{ color: theme.textMain }}>
                            {theme.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[10px] line-clamp-2 mt-0.5" style={{ color: theme.textSub }}>
                          {theme.description}
                        </p>
                      </div>
                      <div className="w-full h-1 rounded-full mt-1" style={{ backgroundColor: theme.accent }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Audio & Neural Voice Settings */}
            <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  24kHz Google Neural Voice Narration
                </label>
                {audioLoading ? (
                  <span className="text-[11px] text-amber-400 animate-pulse">Synthesizing audio...</span>
                ) : audioLoaded ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Voice Ready
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOOGLE_NEURAL_VOICES.map((v) => {
                  const isSelected = voiceName === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVoiceName(v.id)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{v.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-stone-400">{v.tone}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={includeAmbientMusic}
                    onChange={(e) => setIncludeAmbientMusic(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  Sacred 432Hz Ambient Soundscape Pad
                </label>

                <button
                  type="button"
                  onClick={handlePreloadAudio}
                  disabled={audioLoading}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  Reload Voice
                </button>
              </div>
            </div>

            {/* 4. Aspect Ratio & Format */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-950/60 p-3 rounded-xl border border-stone-800 gap-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Canvas Format:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAspectRatio('3:4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    aspectRatio === '3:4'
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-[9px] text-amber-200 uppercase font-extrabold tracking-wider">
                    Best
                  </span>
                  3:4 (Portrait Feed / Status)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  9:16 (Story / Reel)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    aspectRatio === '1:1'
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  1:1 (Square)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  16:9 (Landscape)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Canvas Stage, Controls & Viral Share Suite (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            {/* Live Canvas Stage */}
            <div className="relative w-full flex items-center justify-center bg-stone-950 p-2 sm:p-3 rounded-2xl border border-stone-800 shadow-inner">
              <div
                className="relative overflow-hidden rounded-xl shadow-2xl border border-stone-800/80 bg-black flex items-center justify-center transition-all duration-200"
                style={{
                  width:
                    aspectRatio === '3:4'
                      ? '285px'
                      : aspectRatio === '9:16'
                      ? '240px'
                      : aspectRatio === '1:1'
                      ? '290px'
                      : '340px',
                  height:
                    aspectRatio === '3:4'
                      ? '380px'
                      : aspectRatio === '9:16'
                      ? '426px'
                      : aspectRatio === '1:1'
                      ? '290px'
                      : '191px',
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain select-none"
                />

                {/* Overlay Playing Badge */}
                {isPlaying && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold tracking-wider uppercase animate-pulse flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE 10s
                  </div>
                )}
              </div>
            </div>

            {/* Playback Transport Controls */}
            <div className="w-full flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlaying ? 'Pause' : 'Play 10s'}
                </button>

                <button
                  type="button"
                  onClick={handleResetPreview}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  title="Reset to 0:00"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-300">
                  {`0:0${Math.min(10, Math.floor(playbackSeconds))} / 0:10`}
                </span>
                <span className="block text-[10px] text-stone-500 font-sans">
                  Adubible.org Watermark Locked
                </span>
              </div>
            </div>

            {/* Main Export Button */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={handleExportVideo}
                disabled={isExporting}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isExporting
                    ? 'bg-amber-600/50 text-stone-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-stone-950 shadow-lg shadow-amber-500/30'
                }`}
              >
                <Download className="w-4 h-4" />
                {isExporting ? `Rendering 10s Video (${exportProgress}%)...` : '🎬 Export 10s Video (MP4 / WebM)'}
              </button>

              {isExporting && (
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-100 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* VIRAL SHARE SUITE (WhatsApp, Facebook, X, YouTube Shorts, TikTok) */}
            <div className="w-full bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  Instant Social Status Share
                </span>
                <span className="text-[10px] font-sans text-stone-400 lowercase">with watermark</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 1. WhatsApp Status */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
                  title="Share to WhatsApp Status & Chats"
                >
                  <span>💬 WhatsApp Status</span>
                </button>

                {/* 2. Facebook */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
                  title="Share to Facebook Feed & Stories"
                >
                  <span>📘 Facebook</span>
                </button>

                {/* 3. X / Twitter */}
                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Share to X (Twitter)"
                >
                  <span>𝕏 Post to X</span>
                </button>

                {/* 4. YouTube Shorts */}
                <button
                  type="button"
                  onClick={() => handleShareTikTokOrYouTube('youtube')}
                  className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-900/30 transition-all"
                  title="Download & Copy YouTube Shorts tags"
                >
                  <span>▶ YouTube Shorts</span>
                </button>

                {/* 5. TikTok */}
                <button
                  type="button"
                  onClick={() => handleShareTikTokOrYouTube('tiktok')}
                  className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Download & Copy TikTok caption"
                >
                  <span>🎵 TikTok Reel</span>
                </button>

                {/* 6. Native Share Drawer (Mobile WhatsApp, Instagram, Camera Roll) */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Open phone share menu (Instagram, WhatsApp, TikTok, etc.)"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>More Apps...</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 text-center pt-1 border-t border-stone-800/80">
                Watermarked with <span className="text-amber-400 font-semibold">Adubible.org</span> to guide seekers to the free Scripture sanctuary.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
