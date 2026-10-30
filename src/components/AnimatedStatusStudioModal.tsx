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
  Key,
} from 'lucide-react';
import {
  StatusVideoRenderer,
  STATUS_THEMES,
  StatusVideoTheme,
  VideoAspectRatio,
  calculateTailoredDuration,
} from '../services/statusVideoEngine';
import {
  GOOGLE_NEURAL_VOICES,
  GoogleNeuralVoiceName,
  cleanVerseForSpeech,
  getStoredGeminiKey,
  setStoredGeminiKey,
  getOrPreloadAudioBuffer,
} from '../services/neuralTtsService';
import {
  getAllCanonicalBooks,
  resolveChapterData,
  resolveVersionId,
} from '../services/bibleEngineService';
import { parsePassageQuery } from '../services/passageService';

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
  const [durationMode, setDurationMode] = useState<number>(0); // 0 = Smart Auto-Tailored to verse length
  const [currentDuration, setCurrentDuration] = useState<number>(() => calculateTailoredDuration(initialText));
  const [voiceName, setVoiceName] = useState<GoogleNeuralVoiceName>('Kore');
  const [includeAmbientMusic, setIncludeAmbientMusic] = useState<boolean>(true);
  const [boldTypography, setBoldTypography] = useState<boolean>(true);
  const [voiceBoost, setVoiceBoost] = useState<boolean>(true);
  const [geminiKey, setGeminiKey] = useState<string>(getStoredGeminiKey());
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>(getStoredGeminiKey());
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // Real-time scripture passage resolution state
  const lastResolvedKeyRef = useRef<string>('');
  const [isLookingUpVerse, setIsLookingUpVerse] = useState<boolean>(false);
  const [lookupStatus, setLookupStatus] = useState<string>('');

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

  // Real-time scripture reference & translation lookup (e.g. "Psalm 3:3", "John 3:16", "Dwom 23:1")
  useEffect(() => {
    if (!isOpen || !reference.trim()) return;
    const queryKey = `${reference.trim()}_${versionName.trim()}`;
    if (lastResolvedKeyRef.current === queryKey) return;

    const timer = setTimeout(async () => {
      const books = getAllCanonicalBooks();
      const parsed = parsePassageQuery(reference, books);
      if (!parsed) {
        setLookupStatus('');
        return;
      }

      setIsLookingUpVerse(true);
      setLookupStatus('Finding verse...');

      try {
        const vId = resolveVersionId(versionName);
        const chapterData = await resolveChapterData(vId, parsed.book.slug, parsed.chapter);
        if (chapterData && chapterData.verses && chapterData.verses.length > 0) {
          let selectedText = '';
          if (parsed.verse) {
            if (parsed.endVerse && parsed.endVerse >= parsed.verse) {
              const rangeVerses = chapterData.verses.filter(
                (v) => v.verse >= parsed.verse! && v.verse <= parsed.endVerse!
              );
              if (rangeVerses.length > 0) {
                selectedText = rangeVerses.map((v) => cleanVerseForSpeech(v.text)).join(' ');
              }
            }
            if (!selectedText) {
              const matched = chapterData.verses.find((v) => v.verse === parsed.verse);
              if (matched) {
                selectedText = cleanVerseForSpeech(matched.text);
              }
            }
          }
          if (!selectedText && chapterData.verses[0]) {
            selectedText = cleanVerseForSpeech(chapterData.verses[0].text);
          }

          if (selectedText) {
            setVerseText(selectedText);
            lastResolvedKeyRef.current = queryKey;
            setLookupStatus(`${parsed.book.names.en} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}` : ''}`);
            setTimeout(() => setLookupStatus(''), 3000);
          }
        }
      } catch (err) {
        console.warn('[AnimatedStatusStudioModal] Real-time lookup error:', err);
        setLookupStatus('');
      } finally {
        setIsLookingUpVerse(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [isOpen, reference, versionName]);

  const [generatingVoiceId, setGeneratingVoiceId] = useState<GoogleNeuralVoiceName | null>(null);
  const [speakingVoiceId, setSpeakingVoiceId] = useState<GoogleNeuralVoiceName | null>(null);

  const handleGenerateVoice = async (vId: GoogleNeuralVoiceName) => {
    setVoiceName(vId);
    setGeneratingVoiceId(vId);
    setAudioLoading(true);

    try {
      if (rendererRef.current) {
        rendererRef.current.ensureAudioUnlocked();
        rendererRef.current.updateOptions({ voiceName: vId });
        const ok = await rendererRef.current.preloadAudio();
        setAudioLoaded(ok);
        const newDur = rendererRef.current.getDuration();
        setCurrentDuration(newDur);

        // Instantly audition the freshly generated voice narration
        const speechBuf = rendererRef.current.getSpeechBuffer();
        if (speechBuf) {
          setGeneratingVoiceId(null);
          setSpeakingVoiceId(vId);

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const src = ctx.createBufferSource();
            src.buffer = speechBuf;
            src.connect(ctx.destination);
            src.onended = () => {
              setSpeakingVoiceId(null);
              ctx.close().catch(() => {});
            };
            src.start();
          }
        }
      }
    } catch (err) {
      console.warn('[AnimatedStatusStudio] Generate voice error:', err);
    } finally {
      setGeneratingVoiceId(null);
      setAudioLoading(false);
    }
  };

  const handleSaveGeminiKey = () => {
    const clean = geminiKeyInput.trim();
    setStoredGeminiKey(clean);
    setGeminiKey(clean);
    setShowKeyInput(false);
    setShareNotice(clean ? '✦ Google Gemini 24kHz Studio Key active!' : 'Gemini Key cleared.');
    setTimeout(() => setShareNotice(''), 4000);
    handlePreloadAudio();
  };

  // Initialize or reconfigure renderer
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const effectiveDuration = durationMode > 0 ? durationMode : 0;
    if (!rendererRef.current) {
      rendererRef.current = new StatusVideoRenderer(canvasRef.current, {
        reference,
        versionName,
        verseText,
        secondaryVersionName: includeSecondary ? secondaryVersionName : undefined,
        secondaryText: includeSecondary ? secondaryText : undefined,
        theme: selectedTheme,
        aspectRatio,
        durationSeconds: effectiveDuration,
        voiceName,
        langCode,
        includeAmbientMusic,
        boldTypography,
        voiceBoost,
      });
      setCurrentDuration(rendererRef.current.getDuration());
    } else {
      rendererRef.current.updateOptions({
        reference,
        versionName,
        verseText,
        secondaryVersionName: includeSecondary ? secondaryVersionName : undefined,
        secondaryText: includeSecondary ? secondaryText : undefined,
        theme: selectedTheme,
        aspectRatio,
        durationSeconds: effectiveDuration,
        voiceName,
        langCode,
        includeAmbientMusic,
        boldTypography,
        voiceBoost,
      });
      setCurrentDuration(rendererRef.current.getDuration());
    }

    // Draw initial 0s frame
    rendererRef.current.drawFrame(0);

    return () => {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
        stopPreviewRef.current = null;
      }
    };
  }, [isOpen, reference, versionName, verseText, secondaryText, secondaryVersionName, includeSecondary, selectedTheme, aspectRatio, durationMode, voiceName, langCode, includeAmbientMusic, boldTypography, voiceBoost]);

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
    rendererRef.current.ensureAudioUnlocked();
    setAudioLoading(true);
    try {
      const ok = await rendererRef.current.preloadAudio();
      setAudioLoaded(ok);
      if (rendererRef.current) {
        setCurrentDuration(rendererRef.current.getDuration());
      }
    } catch {
      setAudioLoaded(false);
    } finally {
      setAudioLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handlePreloadAudio();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen, verseText, voiceName, handlePreloadAudio]);

  // Toggle Play / Pause preview
  const handleTogglePlay = () => {
    if (!rendererRef.current) return;
    rendererRef.current.ensureAudioUnlocked();

    if (isPlaying) {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
        stopPreviewRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const totalDur = rendererRef.current.getDuration();
      stopPreviewRef.current = rendererRef.current.playPreview(
        (sec) => setPlaybackSeconds(sec),
        () => {
          setIsPlaying(false);
          setPlaybackSeconds(totalDur);
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

  // Video Export pipeline (Smart Tailored Canvas Capture + Audio)
  const handleExportVideo = async () => {
    if (!rendererRef.current) return;
    rendererRef.current.ensureAudioUnlocked();

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

      // Trigger instant automatic download with sample-accurate tailored duration
      const durSec = Math.round(rendererRef.current.getDuration());
      const cleanRef = reference.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `AduBible_${cleanRef}_${aspectRatio.replace(':', 'x')}_${durSec}s_Status.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShareNotice(`✅ ${durSec}s Tailored Status Video exported as "${filename}"! Full verse recited cleanly.`);
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

  const handleShareWhatsApp = async () => {
    // 1. If video is already exported, share video file directly via native share
    if (exportedBlob && navigator.share) {
      try {
        const file = new File(
          [exportedBlob],
          `AduBible_${reference.replace(/\s+/g, '_')}_Status.${exportedBlob.type.includes('mp4') ? 'mp4' : 'webm'}`,
          { type: exportedBlob.type }
        );
        await navigator.share({
          title: `${reference} — AduBible Status`,
          text: getShareText(),
          files: [file],
        });
        setShareNotice('✨ Video shared to WhatsApp Status!');
        setTimeout(() => setShareNotice(''), 4000);
        return;
      } catch {
        // Fall back to link if cancelled or unsupported
      }
    }

    // 2. If not exported yet, prompt user or auto-render
    if (!exportedBlob && rendererRef.current) {
      setShareNotice('🎬 Preparing video for WhatsApp Status...');
      try {
        const blob = await rendererRef.current.exportVideo((pct) => setExportProgress(pct));
        setExportedBlob(blob);
        const url = URL.createObjectURL(blob);
        setExportedUrl(url);

        if (navigator.share) {
          const file = new File(
            [blob],
            `AduBible_${reference.replace(/\s+/g, '_')}_Status.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`,
            { type: blob.type }
          );
          await navigator.share({
            title: `${reference} — AduBible Status`,
            text: getShareText(),
            files: [file],
          });
          setShareNotice('✨ Video shared to WhatsApp Status!');
          setTimeout(() => setShareNotice(''), 4000);
          return;
        }
      } catch {
        // Continue to fallback
      }
    }

    // 3. Fallback: Open WhatsApp API with verse text and site link
    const text = encodeURIComponent(getShareText());
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-studio-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl bg-[var(--paper)] border border-[var(--line)] rounded-2xl shadow-2xl text-[var(--ink)] overflow-hidden flex flex-col max-h-[96vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center text-[var(--green)] shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="status-studio-title" className="text-base sm:text-lg font-serif font-bold text-[var(--ink)] flex items-center gap-2 truncate">
                Animated Scripture Status Studio
                <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--soft)] text-[var(--green)] border border-[var(--line)] shrink-0">
                  Tailored Reels
                </span>
              </h2>
              <p className="text-xs text-[var(--subtle)] truncate">
                Generate kinetic text video reels with 24kHz Google neural voice in smart tailored length &amp; permanent <span className="text-[var(--green)] font-semibold">AduBible.org</span> watermark
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] font-bold text-xs transition-colors shrink-0 ml-2 shadow-sm cursor-pointer"
            aria-label="Close Studio"
            title="Close Studio (Esc)"
          >
            <X className="w-4 h-4 text-[var(--green)]" />
            <span>Close</span>
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
            <div className="bg-stone-950/60 p-3 sm:p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Scripture Passage
                  </label>
                  {isLookingUpVerse && (
                    <span className="text-[10px] text-amber-400 font-mono animate-pulse flex items-center gap-1">
                      <Search className="w-3 h-3 animate-spin" /> Finding verse...
                    </span>
                  )}
                  {!isLookingUpVerse && lookupStatus && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> {lookupStatus}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-36">
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. Psalm 3:3"
                      className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-semibold focus:border-amber-500 outline-none placeholder:text-stone-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="NKJV"
                    className="w-24 text-xs bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-amber-300 font-semibold focus:border-amber-500 outline-none text-center uppercase"
                  />
                </div>
              </div>

              {/* Mobile Quick Version Selector Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-stone-400 font-medium">Quick Version:</span>
                {['NKJV', 'KJV', 'ASANTE TWI', 'ESV', 'NIV', 'NLT'].map((vCode) => (
                  <button
                    key={vCode}
                    type="button"
                    onClick={() => setVersionName(vCode)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                      versionName.toUpperCase() === vCode
                        ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                        : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    {vCode}
                  </button>
                ))}
              </div>

              <textarea
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm bg-stone-900 border border-stone-800 rounded-lg p-3 text-stone-100 font-serif leading-relaxed focus:border-amber-500/60 outline-none resize-none"
                placeholder="Enter scripture verse text for kinetic video reel..."
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
            <div className="bg-stone-950/60 p-3.5 sm:p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  24kHz Google Studio Voice Narration
                </label>
                {audioLoading ? (
                  <span className="text-[11px] text-amber-400 animate-pulse font-mono">Synthesizing audio...</span>
                ) : audioLoaded ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3" /> Voice Ready
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOOGLE_NEURAL_VOICES.map((v) => {
                  const isSelected = voiceName === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleGenerateVoice(v.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/20'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{v.id}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-stone-400 leading-tight mt-0.5 line-clamp-1">{v.tone}</div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateVoice(v.id);
                        }}
                        disabled={generatingVoiceId === v.id || speakingVoiceId === v.id}
                        className={`mt-2 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                          generatingVoiceId === v.id
                            ? 'bg-amber-500 text-stone-950 font-bold animate-pulse'
                            : speakingVoiceId === v.id
                            ? 'bg-emerald-500 text-stone-950 font-bold'
                            : isSelected
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                        }`}
                        title="Generate studio voice narration for current verse"
                      >
                        <Volume2 className="w-3 h-3" />
                        {generatingVoiceId === v.id
                          ? 'Generating...'
                          : speakingVoiceId === v.id
                          ? 'Playing Voice...'
                          : '⚡ Generate Voice'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Optional Gemini 24kHz API Key Expander */}
              <div className="pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>{geminiKey ? '✦ Custom Gemini 24kHz Key Active' : 'Add Google Gemini Studio Key (Optional)'}</span>
                  </button>
                  {geminiKey && (
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">Ready</span>
                  )}
                </div>

                {showKeyInput && (
                  <div className="mt-2 p-2.5 bg-stone-900/90 border border-stone-800 rounded-xl space-y-2">
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      Powered by Google Gemini 24kHz Audio Modality (<span className="text-amber-300">gemini-3.1-flash-tts-preview</span>). Natural Google voice fallback is active by default. Enter your free API key for custom rate limit quotas.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={geminiKeyInput}
                        onChange={(e) => setGeminiKeyInput(e.target.value)}
                        placeholder="Paste AIzaSy... key"
                        className="flex-1 text-xs bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono outline-none focus:border-amber-500 placeholder:text-stone-600"
                      />
                      <button
                        type="button"
                        onClick={handleSaveGeminiKey}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
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

              <div className="flex flex-wrap items-center justify-between pt-2.5 gap-3 border-t border-stone-800/80 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={voiceBoost}
                    onChange={(e) => setVoiceBoost(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-amber-300">⚡ Studio Voice Boost (+3dB)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={boldTypography}
                    onChange={(e) => setBoldTypography(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-amber-200">✦ Bold High-Contrast Text</span>
                </label>
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

            {/* 5. Video Reel Duration Control (Smart Tailored Length Engine) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  Smart Tailored Reel Duration
                </label>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {durationMode === 0 ? `⚡ Auto: ${Math.round(currentDuration)}s (Full Verse)` : `${durationMode}s Fixed`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDurationMode(0)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    durationMode === 0
                      ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-1">⚡ Auto</span>
                  <span className="text-[9.5px] font-normal opacity-90">{Math.round(currentDuration)}s Tailored</span>
                </button>
                {[10, 15, 30].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMode(dur)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      durationMode === dur
                        ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span>{dur}s</span>
                    <span className="text-[9.5px] font-normal opacity-90">
                      {dur === 10 ? 'Quick' : dur === 15 ? 'Story' : 'Status'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Canvas Stage, Controls & Viral Share Suite (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            {/* Live Canvas Stage */}
            <div className="relative w-full flex items-center justify-center bg-stone-950 p-2 sm:p-3 rounded-2xl border border-stone-800 shadow-inner overflow-hidden">
              <div
                className="relative overflow-hidden rounded-xl shadow-2xl border border-stone-800/80 bg-black flex items-center justify-center transition-all duration-200 max-w-full"
                style={{
                  width:
                    aspectRatio === '3:4'
                      ? 'min(100%, 285px)'
                      : aspectRatio === '9:16'
                      ? 'min(100%, 240px)'
                      : aspectRatio === '1:1'
                      ? 'min(100%, 290px)'
                      : 'min(100%, 340px)',
                  aspectRatio:
                    aspectRatio === '3:4'
                      ? '3 / 4'
                      : aspectRatio === '9:16'
                      ? '9 / 16'
                      : aspectRatio === '1:1'
                      ? '1 / 1'
                      : '16 / 9',
                  maxHeight: '440px',
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
                    LIVE {Math.round(currentDuration)}s
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
                  {isPlaying ? 'Pause' : `Play (${Math.round(currentDuration)}s)`}
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
                  {(() => {
                    const formatMmSs = (sec: number) => {
                      const clamped = Math.max(0, Math.floor(sec));
                      const m = Math.floor(clamped / 60);
                      const s = clamped % 60;
                      return `${m}:${s < 10 ? '0' : ''}${s}`;
                    };
                    return `${formatMmSs(playbackSeconds)} / ${formatMmSs(currentDuration)}`;
                  })()}
                </span>
                <span className="block text-[10px] text-amber-400 font-mono font-semibold tracking-wide flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  🔒 AduBible.org Watermark Locked
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
                {isExporting ? `Rendering Video (${exportProgress}%)...` : `🎬 Export Full Reel (${Math.round(currentDuration)}s MP4)`}
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
                {/* 1. WhatsApp Status - Full Width Hero */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="col-span-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all text-xs sm:text-sm"
                  title="Share Video Reel directly to WhatsApp Status"
                >
                  <span className="text-base">💬</span>
                  <span>Share Full Reel ({Math.round(currentDuration)}s) to WhatsApp</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-[10px] text-emerald-100 uppercase font-extrabold tracking-wider">
                    Instant Reel
                  </span>
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
