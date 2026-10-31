import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VerseData } from '../types/bible';
import {
  GOOGLE_NEURAL_VOICES,
  GoogleNeuralVoiceName,
  getOrPreloadAudioBuffer,
  isAudioBufferPreloaded,
  cleanVerseForSpeech,
  getActiveGeminiApiKeys,
} from '../services/neuralTtsService';
import { isTwiLanguage, isDeadLegacyAudioUrl } from '../services/twiAudioService';
import { transphonemizeTwiForSpeech } from '../services/twiPhonemeEngine';
import { fetchHelloaoAudioTimings } from '../services/bibleEngineService';
import {
  scrollVerseIntoViewIfNeeded,
  isAutoScrollActive,
  setAutoScrollActive,
} from '../services/passageService';

interface AudioBibleBarProps {
  bookName: string;
  bookSlug?: string;
  chapter: number;
  chapterReady?: boolean;
  versionName: string;
  langCode: string;
  verses: VerseData[];
  audioUrl?: string;
  audioTimings?: number[];
  parallelVerses?: VerseData[];
  parallelVersionName?: string;
  parallelLangCode?: string;
  activeVerse: number;
  onVerseChange: (verseNum: number) => void;
  onClose?: () => void;
  onOpenSettings?: () => void;
  onNextChapter?: () => boolean | void;
  autoPlay?: boolean;
  autoPlayNonce?: number;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  autoSyncReader?: boolean;
  onToggleAutoSync?: () => void;
  onSetAutoSync?: (enabled: boolean) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenSlideMode?: () => void;
  announceChapterTitle?: boolean;
  onToggleAnnounceChapterTitle?: () => void;
}

const SAVED_VOICE_KEY = 'elohim_neural_voice_v1';
// Skips the 0.00s–1.60s "Audio Bible" tag so the Studio Narrator speaks only "<Book>, Chapter <N>" / "Psalm <N>"
const STUDIO_CHAPTER_INTRO_START_SEC = 1.62;

export const AudioBibleBar: React.FC<AudioBibleBarProps> = ({
  bookName,
  bookSlug,
  chapter,
  chapterReady,
  versionName,
  langCode,
  verses,
  audioUrl,
  audioTimings,
  parallelVerses,
  parallelVersionName,
  parallelLangCode,
  activeVerse,
  onVerseChange,
  onClose,
  onOpenSettings,
  onNextChapter,
  autoPlay = true,
  autoPlayNonce = 0,
  onPlaybackStateChange,
  autoSyncReader = true,
  onToggleAutoSync,
  onSetAutoSync,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenSlideMode,
  announceChapterTitle = true,
  onToggleAnnounceChapterTitle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [continuousPlayback, setContinuousPlayback] = useState<boolean>(true);
  const announceChapterTitleRef = useRef<boolean>(announceChapterTitle !== false);
  const studioIntroPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    announceChapterTitleRef.current = announceChapterTitle !== false;
  }, [announceChapterTitle]);
  const [isAutoSync, setIsAutoSync] = useState<boolean>(() => {
    return typeof autoSyncReader === 'boolean' ? autoSyncReader : isAutoScrollActive();
  });

  // Synchronize when parent prop updates
  useEffect(() => {
    if (typeof autoSyncReader === 'boolean') {
      setIsAutoSync(autoSyncReader);
    }
  }, [autoSyncReader]);

  // Real-time synchronization with global Auto-Scroll state (0ms latency across tabs and UI surfaces)
  useEffect(() => {
    const handleToggle = (e: any) => {
      if (typeof e.detail?.enabled === 'boolean') {
        setIsAutoSync(e.detail.enabled);
      }
    };
    window.addEventListener('adubible_autoscroll_toggle', handleToggle);
    return () => window.removeEventListener('adubible_autoscroll_toggle', handleToggle);
  }, []);
  const isTransitioningChapterRef = useRef<boolean>(false);
  const currentChapterKey = `${bookSlug || bookName}:${chapter}`;
  const lastReadChapterKeyRef = useRef<string>(currentChapterKey);
  const autoPlayNextChapterRef = useRef<boolean>(false);
  const hasInitialAutoPlayedRef = useRef<boolean>(false);
  const lastHandledNonceRef = useRef<number>(autoPlayNonce || 0);
  const [selectedVoice, setSelectedVoice] = useState<GoogleNeuralVoiceName>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SAVED_VOICE_KEY);
      if (saved && GOOGLE_NEURAL_VOICES.some((v) => v.id === saved)) {
        return saved as GoogleNeuralVoiceName;
      }
    }
    return 'Charon';
  });
  const validAudioUrl =
    audioUrl && !isDeadLegacyAudioUrl(audioUrl) && !isTwiLanguage(langCode)
      ? audioUrl
      : undefined;

  const [rate, setRate] = useState(1.0);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [useStudioMp3, setUseStudioMp3] = useState<boolean>(Boolean(validAudioUrl));
  const useStudioMp3Ref = useRef<boolean>(Boolean(validAudioUrl));
  const studioFailedRef = useRef<boolean>(false);
  const [engineType, setEngineType] = useState<'24khz' | 'native' | 'studio'>(() => {
    if (typeof window !== 'undefined' && getActiveGeminiApiKeys().length > 0) {
      return '24khz';
    }
    return validAudioUrl ? 'studio' : 'native';
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [bufferedCount, setBufferedCount] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const isNativeSpeechRef = useRef(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const studioAudioElRef = useRef<HTMLAudioElement | null>(null);
  const studioTimingsRef = useRef<number[] | null>(
    audioTimings && audioTimings.length > 0 ? audioTimings : null
  );
  const pendingStudioSeekRef = useRef<number | null>(null);
  const cancelDispatchTimerRef = useRef<any>(null);
  const onVerseChangeRef = useRef(onVerseChange);
  useEffect(() => {
    onVerseChangeRef.current = onVerseChange;
  }, [onVerseChange]);

  const notifyVerseChange = useCallback((verseNum: number) => {
    if (onVerseChangeRef.current) {
      onVerseChangeRef.current(verseNum);
    }
  }, []);

  // Initialize and track available Web Speech voices across browser lifecycle
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Chrome 15-second speech silence bug heartbeat guard
  useEffect(() => {
    if (!isPlaying) return;
    const heartbeat = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);
    return () => clearInterval(heartbeat);
  }, [isPlaying]);

  useEffect(() => {
    const hasValid = Boolean(validAudioUrl);
    studioFailedRef.current = false;
    useStudioMp3Ref.current = hasValid;
    setUseStudioMp3(hasValid);

    if (audioTimings && audioTimings.length > 0) {
      studioTimingsRef.current = audioTimings;
    } else if (validAudioUrl) {
      studioTimingsRef.current = null;
      let cancelled = false;
      fetchHelloaoAudioTimings(validAudioUrl)
        .then((timings) => {
          if (!cancelled && timings && timings.length > 0) {
            studioTimingsRef.current = timings;
            const audioEl = studioAudioElRef.current;
            if (audioEl && isPlayingRef.current && useStudioMp3Ref.current) {
              const targetIdx = Math.max(0, Math.min(currentVerseIdxRef.current, timings.length - 1));
              const isPlayingChapterIntro =
                targetIdx === 0 &&
                studioIntroPlayingRef.current &&
                announceChapterTitleRef.current;
              const targetSec = isPlayingChapterIntro
                ? STUDIO_CHAPTER_INTRO_START_SEC
                : timings[targetIdx];
              if (
                typeof targetSec === 'number' &&
                !isPlayingChapterIntro &&
                (audioEl.currentTime < timings[0] - 0.1 ||
                  pendingStudioSeekRef.current !== null ||
                  (targetIdx === 0 && audioEl.currentTime < targetSec - 0.1))
              ) {
                try {
                  audioEl.currentTime = targetSec;
                } catch {}
              }
              audioEl.muted = false;
              pendingStudioSeekRef.current = null;
            }
          } else if (!cancelled && studioAudioElRef.current) {
            studioAudioElRef.current.muted = false;
          }
        })
        .catch(() => {
          if (!cancelled && studioAudioElRef.current) {
            studioAudioElRef.current.muted = false;
          }
        });
      return () => {
        cancelled = true;
      };
    } else {
      studioTimingsRef.current = null;
    }
  }, [validAudioUrl, audioTimings]);

  // Continuous Auto-Advance & Chapter Change Listener
  useEffect(() => {
    const isReady =
      chapterReady !== undefined ? chapterReady : Boolean(verses && verses.length > 0);

    if (!isReady || !verses || verses.length === 0) {
      return;
    }

    const chapterChanged = lastReadChapterKeyRef.current !== currentChapterKey;

    if (
      isTransitioningChapterRef.current ||
      autoPlayNextChapterRef.current ||
      (isPlayingRef.current && chapterChanged)
    ) {
      isTransitioningChapterRef.current = false;
      autoPlayNextChapterRef.current = false;
      lastReadChapterKeyRef.current = currentChapterKey;
      setIsPlaying(true);
      isPlayingRef.current = true;
      currentVerseIdxRef.current = 0;
      setIsLoadingVerse(false);
      setStatusMessage('');

      if (verses[0]) {
        notifyVerseChange(verses[0].verse);
      }

      // Unconditionally wake up and flush SpeechSynthesis queue in Chromium
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }

      const timer = setTimeout(() => {
        playVerseAtIndex(0);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      lastReadChapterKeyRef.current = currentChapterKey;
    }
  }, [currentChapterKey, chapterReady, verses]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  // End timestamp of the Studio Narrator's "<Book>, Chapter <N>" / "Psalm <N>" announcement
  // (located inside the 2.15s silence window before any Psalm superscription begins at ~4.88s)
  const getStudioChapterTitleEndSec = useCallback(
    (firstVerseStart?: number): number => {
      if (bookSlug === 'psalms') {
        return chapter >= 100 ? 3.95 : 3.35;
      }
      const baseEnd = chapter >= 100 ? 4.85 : 4.55;
      if (typeof firstVerseStart === 'number' && firstVerseStart > 0) {
        return Math.min(baseEnd, Math.max(3.5, firstVerseStart - 0.25));
      }
      return baseEnd;
    },
    [bookSlug, chapter]
  );

  // Localized Book & Chapter announcement for Natural Voice and 24kHz Neural TTS engines
  const buildSpokenChapterIntro = useCallback(
    (targetBookName: string, targetChapter: number, targetLang: string): string => {
      const code = (targetLang || 'en').toLowerCase().trim();
      if (isTwiLanguage(code)) {
        return `${targetBookName}, Ti ${targetChapter}. `;
      }
      if (code.startsWith('fr')) {
        return `${targetBookName}, Chapitre ${targetChapter}. `;
      }
      if (code.startsWith('es') || code.startsWith('pt')) {
        return `${targetBookName}, Capítulo ${targetChapter}. `;
      }
      if (code.startsWith('de')) {
        return `${targetBookName}, Kapitel ${targetChapter}. `;
      }
      if (bookSlug === 'psalms' || /^psalms?$/i.test(targetBookName.trim())) {
        return `Psalm ${targetChapter}. `;
      }
      return `${targetBookName}, Chapter ${targetChapter}. `;
    },
    [bookSlug]
  );

  // Dynamic intro + superscription preamble calculator (offline fallback when audioTimings.json is unavailable)
  const getDynamicIntroPreambleSec = useCallback((): number => {
    let preamble = 3.8; // Base narrator chapter title announcement ("Psalm 3" / "Chapter 1")
    const v0Heading = verses?.[0]?.heading || '';
    if (v0Heading) {
      // Extract Hebrew superscription part (e.g. after '—' in 'Deliver Me, O LORD! — A Psalm of David, when he fled from his son Absalom.')
      const parts = v0Heading.split(/[—–]/);
      const supCandidate = parts.length > 1 ? parts.slice(1).join(' ').trim() : (bookSlug === 'psalms' ? v0Heading.trim() : '');
      if (
        supCandidate &&
        /\b(psalm|david|asaph|korah|choirmaster|musician|director|song|miktam|michtam|maskil|maschil|shiggaion|prayer|moses|solomon|fled|absalom|nathan|saul)\b/i.test(
          supCandidate
        )
      ) {
        const supWords = supCandidate.split(/\s+/).filter(Boolean).length;
        preamble += supWords * 0.45;
      }
    }
    return preamble;
  }, [verses, bookSlug]);

  // Exact millisecond target timestamp resolver for any verse index in Studio MP3 mode
  const computeStudioVerseTargetTime = useCallback(
    (index: number, duration?: number): number => {
      const timings = studioTimingsRef.current;
      if (timings && timings.length > 0) {
        const clampedIdx = Math.max(0, Math.min(index, timings.length - 1));
        if (typeof timings[clampedIdx] === 'number') {
          return timings[clampedIdx];
        }
      }

      const introPreambleSec = getDynamicIntroPreambleSec();
      if (index <= 0) {
        return introPreambleSec;
      }

      if (duration && !isNaN(duration) && duration > introPreambleSec && verses.length > 0) {
        const effectiveDuration = Math.max(1, duration - introPreambleSec);
        const verseWeights = verses.map((v) =>
          Math.max(1, (v.text || '').trim().split(/\s+/).length)
        );
        const totalWeight = verseWeights.reduce((a, b) => a + b, 0);
        if (totalWeight > 0) {
          let cum = 0;
          for (let i = 0; i < index; i++) cum += verseWeights[i];
          return introPreambleSec + (cum / totalWeight) * effectiveDuration;
        }
      }

      return introPreambleSec;
    },
    [verses, getDynamicIntroPreambleSec]
  );

  // Frame-accurate time-update listener for Studio MP3 chapter audio synchronization & header bypass
  const handleStudioTimeUpdate = useCallback(() => {
    const audioEl = studioAudioElRef.current;
    if (!audioEl || !verses || verses.length === 0) return;

    const isPlayingChapterIntro =
      currentVerseIdxRef.current === 0 &&
      studioIntroPlayingRef.current &&
      announceChapterTitleRef.current;

    // 1. Apply any pending initial seek as soon as media metadata is ready
    if (pendingStudioSeekRef.current !== null && audioEl.readyState >= 1) {
      const targetTime = isPlayingChapterIntro
        ? STUDIO_CHAPTER_INTRO_START_SEC
        : computeStudioVerseTargetTime(currentVerseIdxRef.current, audioEl.duration);
      if (Math.abs(audioEl.currentTime - targetTime) > 0.25) {
        try {
          audioEl.currentTime = targetTime;
        } catch {}
      }
      if (studioTimingsRef.current || audioEl.currentTime >= targetTime - 0.2) {
        audioEl.muted = false;
        pendingStudioSeekRef.current = null;
      }
    }

    const currentTime = audioEl.currentTime;
    const timings = studioTimingsRef.current;

    // 1b. Chapter Title Announcement Window (1.62s -> chapterTitleEndSec):
    // Narrator speaks "<Book>, Chapter <N>" / "Psalm <N>", then immediately jumps to Verse 1,
    // skipping 100% of any Psalm superscription or header!
    if (isPlayingChapterIntro) {
      if (currentTime < STUDIO_CHAPTER_INTRO_START_SEC - 0.15 && audioEl.readyState >= 1) {
        try {
          audioEl.currentTime = STUDIO_CHAPTER_INTRO_START_SEC;
          audioEl.muted = false;
        } catch {}
        return;
      }

      const firstVerseStart =
        timings && timings.length > 0 ? (timings[0] ?? 0) : getDynamicIntroPreambleSec();
      const chapterTitleEndSec = getStudioChapterTitleEndSec(firstVerseStart);

      if (currentTime < chapterTitleEndSec) {
        if (audioEl.muted) {
          audioEl.muted = false;
        }
        return;
      }

      // Chapter announcement finished -> jump over any superscription straight to Verse 1
      studioIntroPlayingRef.current = false;
      if (firstVerseStart > currentTime + 0.2 && audioEl.readyState >= 1) {
        try {
          audioEl.currentTime = Math.max(chapterTitleEndSec, firstVerseStart - 0.15);
          audioEl.muted = false;
        } catch {}
        return;
      }
    }

    // 2. Primary Path: Exact Millisecond Studio Timings Array (0ms Header Skip + 0ms Slide Sync)
    if (timings && timings.length > 0) {
      const firstVerseStart = timings[0] ?? 0;

      // Hard Header & Superscription Bypass: Never allow audio to play before Verse 1 start timestamp
      if (currentTime < firstVerseStart - 0.15 && audioEl.readyState >= 1) {
        const targetIdx = Math.max(0, Math.min(currentVerseIdxRef.current, timings.length - 1));
        const jumpTo = timings[targetIdx] ?? firstVerseStart;
        try {
          audioEl.currentTime = jumpTo;
          audioEl.muted = false;
        } catch {}
        return;
      }

      if (audioEl.muted) {
        audioEl.muted = false;
      }

      // Advance slide ~80ms ahead of spoken phoneme so visual card lands right as the first word is spoken
      const lookaheadTime = currentTime + 0.08;
      let activeIdx = 0;
      for (let i = timings.length - 1; i >= 0; i--) {
        if (lookaheadTime >= timings[i]) {
          activeIdx = i;
          break;
        }
      }
      activeIdx = Math.min(activeIdx, verses.length - 1);

      if (activeIdx !== currentVerseIdxRef.current) {
        currentVerseIdxRef.current = activeIdx;
        if (verses[activeIdx]) {
          notifyVerseChange(verses[activeIdx].verse);
        }
      }
      return;
    }

    // 3. Offline Fallback Path: Dynamic Preamble + Proportional Word Weights
    const duration = audioEl.duration;
    if (!duration || isNaN(duration) || duration <= 0) return;

    const introPreambleSec = getDynamicIntroPreambleSec();
    if (currentTime < introPreambleSec - 0.15 && audioEl.readyState >= 1) {
      try {
        audioEl.currentTime = introPreambleSec;
        audioEl.muted = false;
      } catch {}
      return;
    }

    if (audioEl.muted) {
      audioEl.muted = false;
    }

    const effectiveTime = Math.max(0, currentTime - introPreambleSec);
    const effectiveDuration = Math.max(1, duration - introPreambleSec);

    const verseWeights = verses.map((v) =>
      Math.max(1, (v.text || '').trim().split(/\s+/).length)
    );
    const totalWeight = verseWeights.reduce((a, b) => a + b, 0);
    if (totalWeight <= 0) return;

    let accumulated = 0;
    let activeIdx = 0;
    for (let i = 0; i < verses.length; i++) {
      const startSec = (accumulated / totalWeight) * effectiveDuration;
      accumulated += verseWeights[i];
      const endSec = (accumulated / totalWeight) * effectiveDuration;

      if (effectiveTime >= startSec && effectiveTime < endSec) {
        activeIdx = i;
        break;
      }
      if (i === verses.length - 1 && effectiveTime >= startSec) {
        activeIdx = i;
      }
    }

    if (activeIdx !== currentVerseIdxRef.current) {
      currentVerseIdxRef.current = activeIdx;
      if (verses[activeIdx]) {
        notifyVerseChange(verses[activeIdx].verse);
      }
    }
  }, [
    verses,
    notifyVerseChange,
    computeStudioVerseTargetTime,
    getDynamicIntroPreambleSec,
    getStudioChapterTitleEndSec,
  ]);

  // High-frequency 90ms polling ticker during Studio MP3 playback for sub-100ms slide transitions
  useEffect(() => {
    if (!isPlaying || engineType !== 'studio') return;
    const syncTimer = setInterval(() => {
      handleStudioTimeUpdate();
    }, 90);
    return () => clearInterval(syncTimer);
  }, [isPlaying, engineType, handleStudioTimeUpdate]);

  const getOrCreateAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Update count of 24kHz preloaded verses in memory
  const updateBufferedCount = useCallback(() => {
    let count = 0;
    for (const v of verses) {
      if (isAudioBufferPreloaded(v.text, langCode, selectedVoice)) {
        count++;
      }
    }
    setBufferedCount(count);
  }, [verses, langCode, selectedVoice]);

  // Look-ahead background pre-fetcher for Next Verse (N+1) in 24kHz mode
  const prefetchAhead = useCallback(
    async (fromIndex: number, depth = 1) => {
      if (getActiveGeminiApiKeys().length === 0) return;
      try {
        const ctx = getOrCreateAudioContext();
        for (let i = fromIndex + 1; i <= Math.min(fromIndex + depth, verses.length - 1); i++) {
          const v = verses[i];
          if (v && !isAudioBufferPreloaded(v.text, langCode, selectedVoice)) {
            getOrPreloadAudioBuffer(ctx, v.text, langCode, selectedVoice)
              .then((buf) => {
                if (buf) updateBufferedCount();
              })
              .catch(() => {});
          }

          if (bilingualMode && parallelVerses && parallelVerses[i]) {
            const pV = parallelVerses[i];
            const pLang = parallelLangCode || 'tw';
            if (!isAudioBufferPreloaded(pV.text, pLang, selectedVoice)) {
              getOrPreloadAudioBuffer(ctx, pV.text, pLang, selectedVoice).catch(() => {});
            }
          }
        }
      } catch {
        // Non-blocking
      }
    },
    [
      verses,
      langCode,
      selectedVoice,
      bilingualMode,
      parallelVerses,
      parallelLangCode,
      getOrCreateAudioContext,
      updateBufferedCount,
    ]
  );

  // Select the highest fidelity native browser voice for the requested language
  const getBestNativeVoice = useCallback(
    (targetLang: string): SpeechSynthesisVoice | null => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
      const voicesList =
        availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      if (!voicesList || voicesList.length === 0) return null;

      const code = (targetLang || 'en').toLowerCase().trim();

      // Asante / Akuapem Twi special check
      if (code === 'tw' || code === 'ak') {
        const ghVoice = voicesList.find(
          (v) =>
            v.lang.toLowerCase().includes('gh') ||
            v.name.toLowerCase().includes('ghana') ||
            v.lang.toLowerCase().startsWith('ak') ||
            v.lang.toLowerCase().startsWith('tw')
        );
        if (ghVoice) return ghVoice;
      }

      // Direct language prefix match (e.g. 'fr' for French, 'es' for Spanish)
      const exactMatch = voicesList.find((v) => v.lang.toLowerCase().startsWith(code));
      if (exactMatch) return exactMatch;

      // Prefer high-clarity natural / neural English voice
      const naturalVoice = voicesList.find(
        (v) =>
          v.lang.toLowerCase().startsWith('en') &&
          (v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('neural') ||
            v.name.toLowerCase().includes('online') ||
            v.name.toLowerCase().includes('google'))
      );
      if (naturalVoice) return naturalVoice;

      const defaultEn = voicesList.find((v) => v.lang.toLowerCase().startsWith('en'));
      return defaultEn || voicesList[0] || null;
    },
    [availableVoices]
  );

  // Clean stop with instant SpeechSynthesis cancel and 35ms micro-fade on Web Audio
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLoadingVerse(false);
    isPlayingRef.current = false;
    setStatusMessage('');

    if (cancelDispatchTimerRef.current) {
      clearTimeout(cancelDispatchTimerRef.current);
      cancelDispatchTimerRef.current = null;
    }

    // 1. Cancel browser native speech synthesis and clear GC anchor
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      (window as any).__activeScriptureUtterance = null;
    }
    isNativeSpeechRef.current = false;
    activeUtteranceRef.current = null;

    // 2. Fade and disconnect Web Audio nodes
    if (activeGainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const gain = activeGainNodeRef.current;
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      } catch {}
    }

    setTimeout(() => {
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
          activeSourceRef.current.disconnect();
        } catch {}
        activeSourceRef.current = null;
      }
      activeGainNodeRef.current = null;
    }, 40);

    if (studioAudioElRef.current) {
      studioAudioElRef.current.pause();
    }
  };

  // Resilient Native Browser Web Speech engine with Chromium cancel-collision guard & GC anchor
  const speakNativeVerse = (
    textToSpeak: string,
    voiceLang: string,
    onEnded: () => void
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsLoadingVerse(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      setStatusMessage('Speech synthesis unavailable in this browser');
      return;
    }

    const isTwi = isTwiLanguage(voiceLang) || isTwiLanguage(langCode);
    const textForSpeech = isTwi
      ? transphonemizeTwiForSpeech(textToSpeak)
      : textToSpeak;
    const clean = cleanVerseForSpeech(textForSpeech);
    if (!clean) {
      onEnded();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    // Steady, reverent pacing for Akan phonological clarity
    utterance.rate = isTwi ? Math.min(rate, 0.95) : rate;
    utterance.pitch = 1.0;

    const code = (voiceLang || 'en').toLowerCase().trim();
    const matchedVoice = getBestNativeVoice(voiceLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else if (isTwi) {
      // Browsers lack native ak-GH voices; standard voices pronounce transphonemized Akan phonemes cleanly via en-US
      utterance.lang = 'en-US';
    } else if (code.length === 2) {
      utterance.lang = `${code}-${code.toUpperCase()}`;
    } else {
      utterance.lang = code;
    }

    // Critical: Anchor utterance globally to prevent Chromium / WebKit GC bug mid-sentence
    (window as any).__activeScriptureUtterance = utterance;
    activeUtteranceRef.current = utterance;
    isNativeSpeechRef.current = true;
    setEngineType('native');
    setIsLoadingVerse(false);
    setIsPlaying(true);
    isPlayingRef.current = true;
    setStatusMessage('');

    let didStart = false;

    utterance.onstart = () => {
      didStart = true;
      setIsLoadingVerse(false);
      setStatusMessage('');
    };

    utterance.onend = () => {
      (window as any).__activeScriptureUtterance = null;
      activeUtteranceRef.current = null;
      if (isPlayingRef.current) {
        onEnded();
      }
    };

    utterance.onerror = (e) => {
      (window as any).__activeScriptureUtterance = null;
      activeUtteranceRef.current = null;
      // Filter out cancel/interrupted events triggered by pause, stop, or skip
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('[AudioBibleBar] SpeechSynthesis error:', e.error);
      // Guard against iOS WebKit gesture expiration ('not-allowed') or synthesis failure
      // so it NEVER enters a runaway verse/chapter advance loop
      if (
        !didStart ||
        e.error === 'not-allowed' ||
        e.error === 'audio-busy' ||
        e.error === 'synthesis-unavailable' ||
        e.error === 'synthesis-failed'
      ) {
        stopPlayback();
        setStatusMessage('Tap ▶ Listen to start voice');
        return;
      }
      if (isPlayingRef.current) {
        onEnded();
      }
    };

    const dispatchSpeak = () => {
      if (!isPlayingRef.current) return;
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.resume();
          } catch {}
        }
        window.speechSynthesis.speak(utterance);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.resume();
          } catch {}
        }
      } catch (err) {
        console.warn('[AudioBibleBar] Failed to call window.speechSynthesis.speak:', err);
        stopPlayback();
      }
    };

    // Eliminate Chromium cancel-speak asynchronous race condition collision
    if (window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      if (cancelDispatchTimerRef.current) clearTimeout(cancelDispatchTimerRef.current);
      cancelDispatchTimerRef.current = setTimeout(dispatchSpeak, 35);
    } else {
      dispatchSpeak();
    }
  };

  const playVerseAtIndex = async (index: number, bypassStudio = false) => {
    if (index < 0 || index >= verses.length) {
      if (index >= verses.length && continuousPlayback && onNextChapter) {
        setIsLoadingVerse(true);
        setStatusMessage(`Loading ${bookName} Chapter ${chapter + 1}...`);
        isTransitioningChapterRef.current = true;
        autoPlayNextChapterRef.current = true;
        isPlayingRef.current = true;
        setIsPlaying(true);

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
          } catch {}
          (window as any).__activeScriptureUtterance = null;
        }
        if (activeSourceRef.current) {
          try {
            activeSourceRef.current.stop();
          } catch {}
          activeSourceRef.current = null;
        }
        if (studioAudioElRef.current) {
          try {
            studioAudioElRef.current.pause();
          } catch {}
        }

        const hasNext = onNextChapter();
        if (!hasNext) {
          isTransitioningChapterRef.current = false;
          autoPlayNextChapterRef.current = false;
          stopPlayback();
          setStatusMessage('Scripture reading complete.');
          setTimeout(() => setStatusMessage(''), 3000);
        }
        return;
      }
      stopPlayback();
      return;
    }

    const verseObj = verses[index];
    currentVerseIdxRef.current = index;
    notifyVerseChange(verseObj.verse);

    // 1. Studio MP3 Narration branch (Protected by synchronous refs + bypassStudio guard + exact millisecond header bypass)
    if (
      !bypassStudio &&
      !studioFailedRef.current &&
      useStudioMp3Ref.current &&
      validAudioUrl &&
      studioAudioElRef.current &&
      !bilingualMode
    ) {
      setEngineType('studio');
      setIsLoadingVerse(false);
      const audioEl = studioAudioElRef.current;
      audioEl.playbackRate = rate;

      const shouldAnnounceChapter = index === 0 && announceChapterTitleRef.current;
      studioIntroPlayingRef.current = shouldAnnounceChapter;
      const targetTime = shouldAnnounceChapter
        ? STUDIO_CHAPTER_INTRO_START_SEC
        : computeStudioVerseTargetTime(index, audioEl.duration);
      pendingStudioSeekRef.current = targetTime;

      if (audioEl.readyState >= 1) {
        if (Math.abs(audioEl.currentTime - targetTime) > 0.25) {
          try {
            audioEl.currentTime = targetTime;
          } catch {}
        }
        if (studioTimingsRef.current || audioEl.currentTime >= targetTime - 0.2) {
          audioEl.muted = false;
          pendingStudioSeekRef.current = null;
        }
      } else {
        // Mute until metadata loads & seek completes so 0.0s chapter title / Psalm superscription is NEVER heard
        audioEl.muted = true;
        try {
          audioEl.currentTime = targetTime;
        } catch {}
      }

      audioEl.play().catch(() => {
        audioEl.muted = false;
        studioFailedRef.current = true;
        useStudioMp3Ref.current = false;
        setUseStudioMp3(false);
        setTimeout(() => {
          if (isPlayingRef.current) {
            playVerseAtIndex(index, true);
          }
        }, 15);
      });
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    const hasGeminiKey = getActiveGeminiApiKeys().length > 0;
    const cleanedPrimaryText = cleanVerseForSpeech(verseObj.text);
    const spokenPrimaryText =
      index === 0 && announceChapterTitleRef.current
        ? `${buildSpokenChapterIntro(bookName, chapter, langCode)}${cleanedPrimaryText}`
        : cleanedPrimaryText;

    // 2. Fast Path: Natural Voice Narration (Zero network buffering, 0ms latency, zero gesture expiration)
    if (!hasGeminiKey) {
      setEngineType('native');
      setIsLoadingVerse(false);
      speakNativeVerse(spokenPrimaryText, langCode, () => {
        if (!isPlayingRef.current) return;
        if (bilingualMode && parallelVerses && parallelVerses[index]) {
          const pVerse = parallelVerses[index];
          const targetLang = parallelLangCode || 'tw';
          const cleanedParallel = cleanVerseForSpeech(pVerse.text);
          const spokenParallel =
            index === 0 && announceChapterTitleRef.current
              ? `${buildSpokenChapterIntro(bookName, chapter, targetLang)}${cleanedParallel}`
              : cleanedParallel;
          speakNativeVerse(spokenParallel, targetLang, () => {
            if (isPlayingRef.current) {
              playVerseAtIndex(index + 1);
            }
          });
        } else {
          playVerseAtIndex(index + 1);
        }
      });
      return;
    }

    // 3. User HAS a Gemini API Key: 24kHz Google Neural Audio branch
    prefetchAhead(index, 1);

    const ctx = getOrCreateAudioContext();
    const isAlreadyInMemory = isAudioBufferPreloaded(
      spokenPrimaryText,
      langCode,
      selectedVoice
    );

    if (!isAlreadyInMemory) {
      setIsLoadingVerse(true);
      setStatusMessage('Buffering 24kHz audio…');
    }

    try {
      const primaryBuffer = await getOrPreloadAudioBuffer(
        ctx,
        spokenPrimaryText,
        langCode,
        selectedVoice
      );

      if (!isPlayingRef.current) {
        setIsLoadingVerse(false);
        return;
      }

      if (!primaryBuffer) {
        // Fallback gracefully to Natural Voice if 24kHz fails or quota is exhausted
        speakNativeVerse(spokenPrimaryText, langCode, () => {
          if (!isPlayingRef.current) return;
          if (bilingualMode && parallelVerses && parallelVerses[index]) {
            const pVerse = parallelVerses[index];
            const targetLang = parallelLangCode || 'tw';
            const cleanedParallel = cleanVerseForSpeech(pVerse.text);
            const spokenParallel =
              index === 0 && announceChapterTitleRef.current
                ? `${buildSpokenChapterIntro(bookName, chapter, targetLang)}${cleanedParallel}`
                : cleanedParallel;
            speakNativeVerse(spokenParallel, targetLang, () => {
              if (isPlayingRef.current) {
                playVerseAtIndex(index + 1);
              }
            });
          } else {
            playVerseAtIndex(index + 1);
          }
        });
        return;
      }

      // Play 24kHz Web Audio Buffer
      setEngineType('24khz');
      setIsLoadingVerse(false);
      setStatusMessage('');
      updateBufferedCount();

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.025);

      source.buffer = primaryBuffer;
      source.playbackRate.value = rate;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      activeSourceRef.current = source;
      activeGainNodeRef.current = gainNode;

      source.onended = async () => {
        if (!isPlayingRef.current) return;

        if (bilingualMode && parallelVerses && parallelVerses[index]) {
          const pVerse = parallelVerses[index];
          const targetLang = parallelLangCode || 'tw';

          try {
            const secBuffer = await getOrPreloadAudioBuffer(
              ctx,
              pVerse.text,
              targetLang,
              selectedVoice
            );

            if (!isPlayingRef.current) return;

            if (secBuffer) {
              const secSource = ctx.createBufferSource();
              const secGainNode = ctx.createGain();
              secGainNode.gain.setValueAtTime(0.001, ctx.currentTime);
              secGainNode.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.025);

              secSource.buffer = secBuffer;
              secSource.playbackRate.value = rate;
              secSource.connect(secGainNode);
              secGainNode.connect(ctx.destination);

              activeSourceRef.current = secSource;
              activeGainNodeRef.current = secGainNode;

              secSource.onended = () => {
                if (isPlayingRef.current) {
                  playVerseAtIndex(index + 1);
                }
              };
              secSource.start();
            } else {
              speakNativeVerse(pVerse.text, targetLang, () => {
                if (isPlayingRef.current) {
                  playVerseAtIndex(index + 1);
                }
              });
            }
          } catch {
            speakNativeVerse(pVerse.text, targetLang, () => {
              if (isPlayingRef.current) {
                playVerseAtIndex(index + 1);
              }
            });
          }
        } else {
          playVerseAtIndex(index + 1);
        }
      };

      source.start();
      setIsPlaying(true);
      isPlayingRef.current = true;
    } catch (err: any) {
      console.warn('[AudioBibleBar] 24kHz buffer error, falling back to Natural Voice:', err);
      speakNativeVerse(verseObj.text, langCode, () => {
        if (!isPlayingRef.current) return;
        playVerseAtIndex(index + 1);
      });
    }
  };

  // Notify parent component of playback state changes
  useEffect(() => {
    onPlaybackStateChange?.(isPlaying);
  }, [isPlaying, onPlaybackStateChange]);

  const startPlayback = useCallback(
    (customStartIdx?: number) => {
      if (!verses || verses.length === 0) return;
      // Direct user gesture unlock for Web Audio and Speech Synthesis
      getOrCreateAudioContext();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }

      const targetIdx =
        typeof customStartIdx === 'number'
          ? customStartIdx
          : Math.max(
              0,
              verses.findIndex((v) => v.verse === activeVerse)
            );
      const safeIdx = targetIdx >= 0 && targetIdx < verses.length ? targetIdx : 0;
      setIsPlaying(true);
      isPlayingRef.current = true;
      playVerseAtIndex(safeIdx);
    },
    [verses, activeVerse, getOrCreateAudioContext]
  );

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Immediate Auto-Play on mount when opened via Audio button
  useEffect(() => {
    if (autoPlay && !hasInitialAutoPlayedRef.current && verses && verses.length > 0) {
      hasInitialAutoPlayedRef.current = true;
      startPlayback();
    }
  }, [autoPlay, verses, startPlayback]);

  // Handle re-trigger via autoPlayNonce (e.g. user clicks Audio while bar was paused)
  useEffect(() => {
    if (autoPlayNonce && autoPlayNonce !== lastHandledNonceRef.current) {
      lastHandledNonceRef.current = autoPlayNonce;
      if (!isPlayingRef.current && verses && verses.length > 0) {
        startPlayback();
      }
    }
  }, [autoPlayNonce, verses, startPlayback]);

  // Seamlessly jump playback when activeVerse changes externally (e.g. user taps verse in reader)
  useEffect(() => {
    if (isTransitioningChapterRef.current) return;
    if (!isPlayingRef.current || !activeVerse || !verses || verses.length === 0) return;
    const currentVerseNum = verses[currentVerseIdxRef.current]?.verse;
    if (currentVerseNum !== undefined && currentVerseNum !== activeVerse) {
      const targetIdx = verses.findIndex((v) => v.verse === activeVerse);
      if (targetIdx >= 0) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
          } catch {}
        }
        if (activeSourceRef.current) {
          try {
            activeSourceRef.current.stop();
          } catch {}
          activeSourceRef.current = null;
        }
        currentVerseIdxRef.current = targetIdx;
        const timer = setTimeout(() => {
          if (isPlayingRef.current) {
            playVerseAtIndex(targetIdx);
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [activeVerse, verses]);

  const handleStep = (delta: number) => {
    if (delta > 0 && currentVerseIdxRef.current >= verses.length - 1 && onNextChapter) {
      setIsLoadingVerse(true);
      setStatusMessage(`Advancing to ${bookName} Chapter ${chapter + 1}...`);
      isTransitioningChapterRef.current = true;
      autoPlayNextChapterRef.current = true;
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();
        } catch {}
      }
      const hasNext = onNextChapter();
      if (!hasNext) {
        isTransitioningChapterRef.current = false;
        autoPlayNextChapterRef.current = false;
        stopPlayback();
      }
      return;
    }
    stopPlayback();
    const nextIdx = Math.min(
      verses.length - 1,
      Math.max(0, currentVerseIdxRef.current + delta)
    );
    currentVerseIdxRef.current = nextIdx;
    if (verses[nextIdx]) {
      notifyVerseChange(verses[nextIdx].verse);
    }
    setIsPlaying(true);
    isPlayingRef.current = true;
    playVerseAtIndex(nextIdx);
  };

  const handleVoiceChange = (newVoice: GoogleNeuralVoiceName) => {
    setSelectedVoice(newVoice);
    try {
      localStorage.setItem(SAVED_VOICE_KEY, newVoice);
    } catch {}

    if (isPlaying) {
      stopPlayback();
      setTimeout(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        playVerseAtIndex(currentVerseIdxRef.current);
      }, 80);
    }
  };

  const renderStudioAudioElement = () =>
    validAudioUrl ? (
      <audio
        ref={studioAudioElRef}
        src={validAudioUrl}
        preload="auto"
        onLoadedMetadata={handleStudioTimeUpdate}
        onCanPlay={handleStudioTimeUpdate}
        onPlay={handleStudioTimeUpdate}
        onTimeUpdate={handleStudioTimeUpdate}
        onError={() => {
          if (studioAudioElRef.current) {
            studioAudioElRef.current.muted = false;
          }
          studioFailedRef.current = true;
          useStudioMp3Ref.current = false;
          setUseStudioMp3(false);
        }}
        onEnded={() => {
          if (continuousPlayback && onNextChapter) {
            setIsLoadingVerse(true);
            setStatusMessage(`Advancing to ${bookName} Chapter ${chapter + 1}...`);
            isTransitioningChapterRef.current = true;
            autoPlayNextChapterRef.current = true;
            isPlayingRef.current = true;
            setIsPlaying(true);
            const hasNext = onNextChapter();
            if (!hasNext) {
              isTransitioningChapterRef.current = false;
              autoPlayNextChapterRef.current = false;
              stopPlayback();
            }
          } else {
            stopPlayback();
          }
        }}
      />
    ) : null;

  const isReady =
    chapterReady !== undefined ? chapterReady : Boolean(verses && verses.length > 0);

  if (!isReady || !verses || verses.length === 0) {
    return (
      <div className="audio-bar-wrapper">
        {renderStudioAudioElement()}
        <div className="audio-bar-container" style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {statusMessage || `Loading ${bookName} Chapter ${chapter}...`}
              </span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="audio-bar-icon-btn"
                style={{ minWidth: '28px', height: '28px', fontSize: '11px' }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Minimized Mode: Ultra-compact 44px pill for reading with zero obstruction
  if (isMinimized) {
    return (
      <div className="audio-bar-wrapper">
        {renderStudioAudioElement()}
        <div className="audio-bar-minimized">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>
              {isLoadingVerse ? '⏳' : isPlaying ? '🔊' : '♫'}
            </span>
            <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                {bookName} {chapter}:{activeVerse}
              </span>
              <span style={{ fontSize: '11px', color: '#f59e0b', marginLeft: '6px', fontWeight: 600 }}>
                {versionName}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <button
              type="button"
              className="audio-bar-icon-btn"
              onClick={() => handleStep(-1)}
              title="Previous Verse"
              style={{ minWidth: '32px', height: '32px', padding: '0 6px' }}
            >
              ⏮
            </button>
            <button
              type="button"
              className={`audio-bar-play-btn ${isLoadingVerse ? 'is-buffering' : isPlaying ? 'is-playing' : 'is-paused'}`}
              onClick={handleTogglePlay}
              style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
            >
              {isLoadingVerse ? '⏳' : isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              className="audio-bar-icon-btn"
              onClick={() => handleStep(1)}
              title="Next Verse"
              style={{ minWidth: '32px', height: '32px', padding: '0 6px' }}
            >
              ⏭
            </button>
            <button
              type="button"
              className="audio-bar-icon-btn"
              onClick={() => setIsMinimized(false)}
              title="Expand Audio Controls"
              aria-label="Expand Audio Controls"
              style={{ minWidth: '32px', height: '32px', padding: '0 6px' }}
            >
              ▴
            </button>
            {onClose && (
              <button
                type="button"
                className="audio-bar-icon-btn"
                onClick={() => {
                  stopPlayback();
                  onClose();
                }}
                title="Close Audio Bar"
                aria-label="Close"
                style={{ minWidth: '32px', height: '32px', padding: '0 6px' }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-bar-wrapper">
      {renderStudioAudioElement()}

      <div className="audio-bar-container">
        {/* 1. SCRIPTURE METADATA SECTION */}
        <div className="audio-bar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <span
              className="brand-icon"
              aria-hidden="true"
              style={{
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                flexShrink: 0,
                background: isPlaying ? 'rgba(16, 185, 129, 0.15)' : 'var(--soft)',
              }}
            >
              {isLoadingVerse ? '⏳' : isPlaying ? '🔊' : '♫'}
            </span>

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--ink)' }}>{bookName} {chapter}:{activeVerse}</span>
                <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: 'var(--soft)', color: '#f59e0b', fontWeight: 600 }}>
                  {versionName}
                </span>
                {engineType === 'studio' ? (
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.16)', color: '#10b981', fontWeight: 600 }}>
                    Studio MP3
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--soft)', color: 'var(--subtle)' }}>
                    {engineType === 'native' ? 'Natural Voice' : `24kHz ${selectedVoice}`}
                  </span>
                )}
              </div>

              {statusMessage ? (
                <div style={{ fontSize: '11px', color: '#e5a54b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {statusMessage}
                </div>
              ) : (
                bufferedCount > 0 ? (
                  <div style={{ fontSize: '10.5px', color: 'var(--subtle)', whiteSpace: 'nowrap' }}>
                    ⚡ {bufferedCount}/{verses.length} ready
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Mobile-only header action buttons */}
          <div className="audio-bar-mobile-actions">
            <button
              type="button"
              className={`audio-bar-icon-btn ${showOptions ? 'active' : ''}`}
              onClick={() => setShowOptions((prev) => !prev)}
              title={showOptions ? 'Hide Voice & Speed Options' : 'Show Voice & Speed Options'}
              aria-label="Audio Options"
              style={{ minWidth: '32px', height: '32px' }}
            >
              ⚙️
            </button>
            <button
              type="button"
              className="audio-bar-icon-btn"
              onClick={() => setIsMinimized(true)}
              title="Minimize Player (Reduce screen space)"
              aria-label="Minimize"
              style={{ minWidth: '32px', height: '32px' }}
            >
              ▾
            </button>
            {onClose && (
              <button
                type="button"
                className="audio-bar-icon-btn"
                onClick={() => {
                  stopPlayback();
                  onClose();
                }}
                title="Close Audio Bar"
                aria-label="Close"
                style={{ minWidth: '32px', height: '32px' }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 2. PRIMARY PLAYBACK CONTROLS (Center on desktop, Row 2 on mobile) */}
        <div className="audio-bar-center">
          <button
            type="button"
            className="audio-bar-icon-btn"
            onClick={() => handleStep(-1)}
            title="Previous Verse"
            style={{ minWidth: '34px', height: '34px', fontSize: '13px' }}
          >
            ⏮
          </button>

          <button
            type="button"
            className={`audio-bar-play-btn ${isLoadingVerse ? 'is-buffering' : isPlaying ? 'is-playing' : 'is-paused'}`}
            onClick={handleTogglePlay}
            style={{ minWidth: '105px', height: '34px' }}
          >
            {isLoadingVerse
              ? '⏳ Buffering…'
              : isPlaying
                ? '⏸ Pause'
                : '▶ Listen'}
          </button>

          <button
            type="button"
            className="audio-bar-icon-btn"
            onClick={stopPlayback}
            title="Stop Playback"
            style={{ minWidth: '34px', height: '34px', fontSize: '13px' }}
          >
            ⏹
          </button>

          <button
            type="button"
            className="audio-bar-icon-btn"
            onClick={() => handleStep(1)}
            title="Next Verse"
            style={{ minWidth: '34px', height: '34px', fontSize: '13px' }}
          >
            ⏭
          </button>
        </div>

        {/* 3. DESKTOP CONTROLS & TOGGLES (Single horizontal row on desktop, hidden on mobile) */}
        <div className="audio-bar-right">
          {/* Narrator Voice Selector */}
          <select
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value as GoogleNeuralVoiceName)}
            className="audio-bar-select audio-bar-voice-select"
            title="Select Scripture Narrator Voice"
          >
            {GOOGLE_NEURAL_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Speed Selector */}
          <select
            value={rate}
            onChange={(e) => {
              const nextRate = Number(e.target.value);
              setRate(nextRate);
              if (activeSourceRef.current) activeSourceRef.current.playbackRate.value = nextRate;
              if (studioAudioElRef.current) studioAudioElRef.current.playbackRate = nextRate;
              if (isNativeSpeechRef.current && isPlayingRef.current) {
                playVerseAtIndex(currentVerseIdxRef.current);
              }
            }}
            className="audio-bar-select audio-bar-speed-select"
            aria-label="Playback speed"
            title="Playback Speed"
          >
            <option value={0.85}>0.85x</option>
            <option value={1.0}>1.0x Normal</option>
            <option value={1.15}>1.15x</option>
            <option value={1.3}>1.3x</option>
          </select>

          {/* Continuous Chapter Auto-Play Toggle */}
          <button
            type="button"
            className={`audio-bar-toggle-pill ${continuousPlayback ? 'active' : ''}`}
            onClick={() => setContinuousPlayback((prev) => !prev)}
            title={continuousPlayback ? 'Auto-Next is ON (advances to next chapter)' : 'Auto-Next is OFF'}
          >
            <span>🔁</span>
            <span className="pill-label">{continuousPlayback ? 'Auto-Next ON' : 'Auto-Next OFF'}</span>
          </button>

          {/* Auto-Scroll Reader Sync Toggle */}
          <button
            type="button"
            className={`audio-bar-toggle-pill ${isAutoSync ? 'active' : ''}`}
            onClick={() => {
              const nextSync = !isAutoSync;
              // 1. Instantaneous 0ms local state update for zero-latency UI reaction
              setIsAutoSync(nextSync);
              // 2. Master synchronous kill-switch update & browser scroll-halt
              setAutoScrollActive(nextSync);
              // 3. Propagate to parent App
              if (onSetAutoSync) {
                onSetAutoSync(nextSync);
              } else if (onToggleAutoSync) {
                onToggleAutoSync();
              }

              // If turning Auto-Scroll ON, immediately smoothly elevate active verse into center projection zone!
              // If turning OFF, setAutoScrollActive(false) already instantly halted any in-flight scroll!
              if (nextSync && typeof window !== 'undefined') {
                const vNum = verses[currentVerseIdxRef.current]?.verse || activeVerse;
                const el =
                  document.getElementById(`verse-${vNum}`) ||
                  document.querySelector(`[data-verse="${vNum}"]`);
                if (el) {
                  scrollVerseIntoViewIfNeeded(el as HTMLElement, true);
                }
              }
            }}
            title={
              isAutoSync
                ? 'Auto-Scroll is ON (follows spoken verse — click to turn OFF)'
                : 'Auto-Scroll is OFF (free manual scrolling — click to turn ON)'
            }
          >
            <span>📜</span>
            <span className="pill-label">{isAutoSync ? 'Auto-Scroll ON' : 'Auto-Scroll OFF'}</span>
          </button>

          {/* Fullscreen Presentation Mode Toggle for Sanctuary / Projection */}
          {onToggleFullscreen && (
            <button
              type="button"
              className={`audio-bar-toggle-pill ${isFullscreen ? 'active' : ''}`}
              onClick={onToggleFullscreen}
              title={
                isFullscreen
                  ? 'Exit Fullscreen Presentation (Esc or F11)'
                  : 'Enter Fullscreen Presentation Mode for Church Screen Projection'
              }
            >
              <span>{isFullscreen ? '🗗' : '⛶'}</span>
              <span className="pill-label">{isFullscreen ? 'Windowed' : 'Fullscreen'}</span>
            </button>
          )}

          {/* Slide Mode Presentation Button */}
          {onOpenSlideMode && (
            <button
              type="button"
              className="audio-bar-toggle-pill"
              onClick={onOpenSlideMode}
              title="Enter Scripture Slide Mode for Sanctuary / Screen Projection (S)"
            >
              <span>📽️</span>
              <span className="pill-label">Slide Mode</span>
            </button>
          )}

          {/* Studio MP3 toggle */}
          {validAudioUrl && !bilingualMode && (
            <button
              type="button"
              className={`audio-bar-toggle-pill ${useStudioMp3 ? 'active' : ''}`}
              onClick={() => {
                stopPlayback();
                const next = !useStudioMp3;
                useStudioMp3Ref.current = next;
                setUseStudioMp3(next);
              }}
              title="Switch between Studio Recorded MP3 and Verse-by-Verse Narration"
            >
              <span>🎙️</span>
              <span className="pill-label">
                {useStudioMp3
                  ? isTwiLanguage(langCode)
                    ? 'Studio Twi Audio'
                    : 'Studio MP3'
                  : isTwiLanguage(langCode)
                    ? 'Akan Phonemic TTS'
                    : 'Verse Audio'}
              </span>
            </button>
          )}

          {/* Announce Book & Chapter Toggle */}
          {onToggleAnnounceChapterTitle && (
            <button
              type="button"
              className={`audio-bar-toggle-pill ${announceChapterTitle !== false ? 'active' : ''}`}
              onClick={onToggleAnnounceChapterTitle}
              title={
                announceChapterTitle !== false
                  ? 'Announce Book & Chapter on new chapter is ON (click to turn OFF)'
                  : 'Announce Book & Chapter on new chapter is OFF (click to turn ON)'
              }
            >
              <span>📢</span>
              <span className="pill-label">
                {announceChapterTitle !== false ? 'Chapter Intro ON' : 'Chapter Intro OFF'}
              </span>
            </button>
          )}

          {/* Bilingual Toggle */}
          {parallelVerses && parallelVerses.length > 0 && (
            <button
              type="button"
              className={`audio-bar-toggle-pill ${bilingualMode ? 'active' : ''}`}
              onClick={() => {
                stopPlayback();
                setBilingualMode(!bilingualMode);
              }}
              title="Alternate reciting primary & parallel language verse by verse"
            >
              <span>⇄</span>
              <span className="pill-label">Bilingual</span>
            </button>
          )}

          {/* App Settings button */}
          {onOpenSettings && (
            <button
              type="button"
              className="audio-bar-icon-btn"
              onClick={onOpenSettings}
              title="Audio & Voice Settings"
              aria-label="Settings"
              style={{ minWidth: '32px', height: '32px' }}
            >
              ⚙️
            </button>
          )}

          {/* Desktop Minimize & Close */}
          <button
            type="button"
            className="audio-bar-icon-btn"
            onClick={() => setIsMinimized(true)}
            title="Minimize Player (Reduce screen space)"
            aria-label="Minimize"
            style={{ minWidth: '32px', height: '32px' }}
          >
            ▾
          </button>
          {onClose && (
            <button
              type="button"
              className="audio-bar-icon-btn"
              onClick={() => {
                stopPlayback();
                onClose();
              }}
              title="Close Audio Bar"
              aria-label="Close"
              style={{ minWidth: '32px', height: '32px' }}
            >
              ×
            </button>
          )}
        </div>

        {/* 4. MOBILE EXPANDABLE DRAWER (Only rendered on mobile when showOptions is toggled on) */}
        {showOptions && (
          <div className="audio-bar-drawer">
            {/* Voice Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value as GoogleNeuralVoiceName)}
              className="audio-bar-select"
              title="Select Scripture Narrator Voice"
            >
              {GOOGLE_NEURAL_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            {/* Speed Selector */}
            <select
              value={rate}
              onChange={(e) => {
                const nextRate = Number(e.target.value);
                setRate(nextRate);
                if (activeSourceRef.current) activeSourceRef.current.playbackRate.value = nextRate;
                if (studioAudioElRef.current) studioAudioElRef.current.playbackRate = nextRate;
                if (isNativeSpeechRef.current && isPlayingRef.current) {
                  playVerseAtIndex(currentVerseIdxRef.current);
                }
              }}
              className="audio-bar-select"
              aria-label="Playback speed"
              title="Playback Speed"
            >
              <option value={0.85}>0.85x</option>
              <option value={1.0}>1.0x Normal</option>
              <option value={1.15}>1.15x</option>
              <option value={1.3}>1.3x</option>
            </select>

            {/* Continuous Chapter Auto-Play Toggle */}
            <button
              type="button"
              className={`audio-bar-toggle-pill ${continuousPlayback ? 'active' : ''}`}
              onClick={() => setContinuousPlayback((prev) => !prev)}
              title={continuousPlayback ? 'Auto-Next is ON (advances to next chapter)' : 'Auto-Next is OFF'}
            >
              <span>🔁</span>
              <span>{continuousPlayback ? 'Auto-Next ON' : 'Auto-Next OFF'}</span>
            </button>

            {/* Auto-Scroll Reader Sync Toggle */}
            <button
              type="button"
              className={`audio-bar-toggle-pill ${isAutoSync ? 'active' : ''}`}
              onClick={() => {
              const nextSync = !isAutoSync;
              // 1. Instantaneous 0ms local state update for zero-latency UI reaction
              setIsAutoSync(nextSync);
              // 2. Master synchronous kill-switch update & browser scroll-halt
              setAutoScrollActive(nextSync);
              // 3. Propagate to parent App
              if (onSetAutoSync) {
                onSetAutoSync(nextSync);
              } else if (onToggleAutoSync) {
                onToggleAutoSync();
              }

              // If turning Auto-Scroll ON, immediately smoothly elevate active verse into center projection zone!
              // If turning OFF, setAutoScrollActive(false) already instantly halted any in-flight scroll!
              if (nextSync && typeof window !== 'undefined') {
                const vNum = verses[currentVerseIdxRef.current]?.verse || activeVerse;
                const el =
                  document.getElementById(`verse-${vNum}`) ||
                  document.querySelector(`[data-verse="${vNum}"]`);
                if (el) {
                  scrollVerseIntoViewIfNeeded(el as HTMLElement, true);
                }
              }
            }}
              title={
                isAutoSync
                  ? 'Auto-Scroll is ON (follows spoken verse — click to turn OFF)'
                  : 'Auto-Scroll is OFF (free manual scrolling — click to turn ON)'
              }
            >
              <span>📜</span>
              <span>{isAutoSync ? 'Auto-Scroll ON' : 'Auto-Scroll OFF'}</span>
            </button>

            {/* Fullscreen Presentation Mode Toggle */}
            {onToggleFullscreen && (
              <button
                type="button"
                className={`audio-bar-toggle-pill ${isFullscreen ? 'active' : ''}`}
                onClick={onToggleFullscreen}
                title={
                  isFullscreen
                    ? 'Exit Fullscreen Presentation (Esc or F11)'
                    : 'Enter Fullscreen Presentation Mode for Church Screen Projection'
                }
              >
                <span>{isFullscreen ? '🗗' : '⛶'}</span>
                <span>{isFullscreen ? 'Windowed' : 'Fullscreen'}</span>
              </button>
            )}

            {/* Slide Mode Presentation Button */}
            {onOpenSlideMode && (
              <button
                type="button"
                className="audio-bar-toggle-pill"
                onClick={onOpenSlideMode}
                title="Enter Scripture Slide Mode for Sanctuary / Screen Projection (S)"
              >
                <span>📽️</span>
                <span>Slide Mode</span>
              </button>
            )}

            {/* Studio MP3 toggle */}
            {validAudioUrl && !bilingualMode && (
              <button
                type="button"
                className={`audio-bar-toggle-pill ${useStudioMp3 ? 'active' : ''}`}
                onClick={() => {
                  stopPlayback();
                  const next = !useStudioMp3;
                  useStudioMp3Ref.current = next;
                  setUseStudioMp3(next);
                }}
                title="Switch between Studio Recorded MP3 and Verse-by-Verse Narration"
              >
                <span>🎙️</span>
                <span>
                  {useStudioMp3
                    ? isTwiLanguage(langCode)
                      ? 'Studio Twi Audio'
                      : 'Studio MP3'
                    : isTwiLanguage(langCode)
                      ? 'Akan Phonemic TTS'
                      : 'Verse Audio'}
                </span>
              </button>
            )}

            {/* Announce Book & Chapter Toggle */}
            {onToggleAnnounceChapterTitle && (
              <button
                type="button"
                className={`audio-bar-toggle-pill ${announceChapterTitle !== false ? 'active' : ''}`}
                onClick={onToggleAnnounceChapterTitle}
                title={
                  announceChapterTitle !== false
                    ? 'Announce Book & Chapter on new chapter is ON (click to turn OFF)'
                    : 'Announce Book & Chapter on new chapter is OFF (click to turn ON)'
                }
              >
                <span>📢</span>
                <span>
                  {announceChapterTitle !== false ? 'Chapter Intro ON' : 'Chapter Intro OFF'}
                </span>
              </button>
            )}

          {/* Bilingual Toggle */}
            {parallelVerses && parallelVerses.length > 0 && (
              <button
                type="button"
                className={`audio-bar-toggle-pill ${bilingualMode ? 'active' : ''}`}
                onClick={() => {
                  stopPlayback();
                  setBilingualMode(!bilingualMode);
                }}
                title="Alternate reciting primary & parallel language verse by verse"
              >
                <span>⇄</span>
                <span>Bilingual</span>
              </button>
            )}

            {/* App Settings button */}
            {onOpenSettings && (
              <button
                type="button"
                className="audio-bar-icon-btn"
                onClick={onOpenSettings}
                title="Audio & Voice Settings"
                aria-label="Settings"
                style={{ minWidth: '32px', height: '32px' }}
              >
                ⚙️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
