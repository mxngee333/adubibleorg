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
import { isTwiLanguage } from '../services/twiAudioService';
import { transphonemizeTwiForSpeech } from '../services/twiPhonemeEngine';
import { scrollVerseIntoViewIfNeeded } from '../services/passageService';

interface AudioBibleBarProps {
  bookName: string;
  bookSlug?: string;
  chapter: number;
  chapterReady?: boolean;
  versionName: string;
  langCode: string;
  verses: VerseData[];
  audioUrl?: string;
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
}

const SAVED_VOICE_KEY = 'elohim_neural_voice_v1';

export const AudioBibleBar: React.FC<AudioBibleBarProps> = ({
  bookName,
  bookSlug,
  chapter,
  chapterReady,
  versionName,
  langCode,
  verses,
  audioUrl,
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
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [continuousPlayback, setContinuousPlayback] = useState<boolean>(true);
  const [internalAutoSync, setInternalAutoSync] = useState<boolean>(true);
  const isAutoSync = autoSyncReader !== undefined ? autoSyncReader : internalAutoSync;
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
  const [rate, setRate] = useState(1.0);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [useStudioMp3, setUseStudioMp3] = useState<boolean>(Boolean(audioUrl));
  const [engineType, setEngineType] = useState<'24khz' | 'native' | 'studio'>(() => {
    if (typeof window !== 'undefined' && getActiveGeminiApiKeys().length > 0) {
      return '24khz';
    }
    return audioUrl ? 'studio' : 'native';
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [bufferedCount, setBufferedCount] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOptions, setShowOptions] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const isNativeSpeechRef = useRef(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const studioAudioElRef = useRef<HTMLAudioElement | null>(null);
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
    setUseStudioMp3(Boolean(audioUrl));
  }, [audioUrl]);

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

  // Proportional time-update listener for Studio MP3 chapter audio synchronization
  const handleStudioTimeUpdate = useCallback(() => {
    if (!studioAudioElRef.current || !verses || verses.length === 0) return;
    const currentTime = studioAudioElRef.current.currentTime;
    const duration = studioAudioElRef.current.duration;
    if (!duration || isNaN(duration) || duration <= 0) return;

    // Account for 3.5s narrator chapter title announcement so verse 1 never rushes ahead
    const introPreambleSec = 3.5;
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
  }, [verses, notifyVerseChange]);

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

    utterance.onstart = () => {
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
        if (isPlayingRef.current) {
          onEnded();
        }
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

  const playVerseAtIndex = async (index: number) => {
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

    // 1. Studio MP3 Narration branch
    if (useStudioMp3 && audioUrl && studioAudioElRef.current && !bilingualMode) {
      setEngineType('studio');
      setIsLoadingVerse(false);
      const audioEl = studioAudioElRef.current;
      audioEl.playbackRate = rate;

      // Proportional seek to verse position
      if (audioEl.duration && !isNaN(audioEl.duration) && audioEl.duration > 0 && index >= 0 && verses.length > 0) {
        const verseWeights = verses.map((v) => Math.max(1, (v.text || '').trim().split(/\s+/).length));
        const totalWeight = verseWeights.reduce((a, b) => a + b, 0);
        if (totalWeight > 0) {
          let cum = 0;
          for (let i = 0; i < index; i++) cum += verseWeights[i];
          const targetTime = (cum / totalWeight) * audioEl.duration;
          if (Math.abs(audioEl.currentTime - targetTime) > 1.5) {
            audioEl.currentTime = targetTime;
          }
        }
      }

      audioEl.play().catch(() => {
        setUseStudioMp3(false);
        playVerseAtIndex(index);
      });
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    const hasGeminiKey = getActiveGeminiApiKeys().length > 0;

    // 2. Fast Path: Natural Voice Narration (Zero network buffering, 0ms latency, zero gesture expiration)
    if (!hasGeminiKey) {
      setEngineType('native');
      setIsLoadingVerse(false);
      speakNativeVerse(verseObj.text, langCode, () => {
        if (!isPlayingRef.current) return;
        if (bilingualMode && parallelVerses && parallelVerses[index]) {
          const pVerse = parallelVerses[index];
          const targetLang = parallelLangCode || 'tw';
          speakNativeVerse(pVerse.text, targetLang, () => {
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
      verseObj.text,
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
        verseObj.text,
        langCode,
        selectedVoice
      );

      if (!isPlayingRef.current) {
        setIsLoadingVerse(false);
        return;
      }

      if (!primaryBuffer) {
        // Fallback gracefully to Natural Voice if 24kHz fails or quota is exhausted
        speakNativeVerse(verseObj.text, langCode, () => {
          if (!isPlayingRef.current) return;
          if (bilingualMode && parallelVerses && parallelVerses[index]) {
            const pVerse = parallelVerses[index];
            const targetLang = parallelLangCode || 'tw';
            speakNativeVerse(pVerse.text, targetLang, () => {
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

  const isReady =
    chapterReady !== undefined ? chapterReady : Boolean(verses && verses.length > 0);

  if (!isReady || !verses || verses.length === 0) {
    return (
      <div className="audio-bar-wrapper">
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
      {audioUrl && (
        <audio
          ref={studioAudioElRef}
          src={audioUrl}
          onTimeUpdate={handleStudioTimeUpdate}
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
      )}

      <div className="audio-bar-container">
        {/* 1. TOP HEADER & METADATA ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
            <span
              className="brand-icon"
              aria-hidden="true"
              style={{
                fontSize: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                flexShrink: 0,
                background: isPlaying ? 'rgba(16, 185, 129, 0.15)' : 'var(--soft)',
              }}
            >
              {isLoadingVerse ? '⏳' : isPlaying ? '🔊' : '♫'}
            </span>

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
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
                <div style={{ fontSize: '11px', color: '#e5a54b', marginTop: '1px' }}>
                  {statusMessage}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--subtle)', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {bufferedCount > 0 && <span>⚡ {bufferedCount}/{verses.length} ready</span>}
                  {bilingualMode && parallelVersionName && (
                    <span style={{ color: '#f59e0b' }}>⇄ {parallelVersionName}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Header right: Options, Minimize, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
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

        {/* 2. PRIMARY PLAYBACK CONTROLS (Single sleek row on both mobile & desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
          <button
            type="button"
            className="audio-bar-icon-btn"
            onClick={() => handleStep(-1)}
            title="Previous Verse"
            style={{ minWidth: '38px', height: '36px', fontSize: '14px' }}
          >
            ⏮
          </button>

          <button
            type="button"
            className={`audio-bar-play-btn ${isLoadingVerse ? 'is-buffering' : isPlaying ? 'is-playing' : 'is-paused'}`}
            onClick={handleTogglePlay}
            style={{ minWidth: '110px', height: '36px' }}
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
            style={{ minWidth: '38px', height: '36px', fontSize: '14px' }}
          >
            ⏹
          </button>

          <button
            type="button"
            className="audio-bar-icon-btn"
            onClick={() => handleStep(1)}
            title="Next Verse"
            style={{ minWidth: '38px', height: '36px', fontSize: '14px' }}
          >
            ⏭
          </button>
        </div>

        {/* 3. EXPANDABLE SECONDARY OPTIONS DRAWER (Voice, Speed, Auto-Next, Studio MP3, Bilingual) */}
        {showOptions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '8px',
              marginTop: '4px',
              borderTop: '1px solid var(--line)',
            }}
          >
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
                if (typeof window !== 'undefined') {
                  (window as any).__adubible_auto_scroll_enabled = nextSync;
                }
                if (onSetAutoSync) {
                  onSetAutoSync(nextSync);
                } else if (onToggleAutoSync) {
                  onToggleAutoSync();
                } else {
                  setInternalAutoSync(nextSync);
                }

                // If turning Auto-Scroll ON, gently align to the spoken verse; if turning OFF, DO NOT SCROLL AT ALL!
                if (nextSync && typeof window !== 'undefined') {
                  const vNum = verses[currentVerseIdxRef.current]?.verse || activeVerse;
                  const el =
                    document.getElementById(`verse-${vNum}`) ||
                    document.querySelector(`[data-verse="${vNum}"]`);
                  if (el) {
                    scrollVerseIntoViewIfNeeded(el as HTMLElement);
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

            {/* Studio MP3 toggle */}
            {audioUrl && !bilingualMode && (
              <button
                type="button"
                className={`audio-bar-toggle-pill ${useStudioMp3 ? 'active' : ''}`}
                onClick={() => {
                  stopPlayback();
                  setUseStudioMp3(!useStudioMp3);
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
                <span>Bilingual ({versionName} + {parallelVersionName})</span>
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
