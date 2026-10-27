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

interface AudioBibleBarProps {
  bookName: string;
  chapter: number;
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
}

const SAVED_VOICE_KEY = 'elohim_neural_voice_v1';

export const AudioBibleBar: React.FC<AudioBibleBarProps> = ({
  bookName,
  chapter,
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
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
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

  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const isNativeSpeechRef = useRef(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const studioAudioElRef = useRef<HTMLAudioElement | null>(null);
  const cancelDispatchTimerRef = useRef<any>(null);

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

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

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

    const clean = cleanVerseForSpeech(textToSpeak);
    if (!clean) {
      onEnded();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const code = (voiceLang || 'en').toLowerCase().trim();
    if (code === 'tw' || code === 'ak') {
      utterance.lang = 'ak-GH';
    } else if (code.length === 2) {
      utterance.lang = `${code}-${code.toUpperCase()}`;
    } else {
      utterance.lang = code;
    }

    const matchedVoice = getBestNativeVoice(voiceLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
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
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
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
      stopPlayback();
      return;
    }

    const verseObj = verses[index];
    currentVerseIdxRef.current = index;
    onVerseChange(verseObj.verse);

    // 1. Studio MP3 Narration branch
    if (useStudioMp3 && audioUrl && studioAudioElRef.current && !bilingualMode) {
      setEngineType('studio');
      setIsLoadingVerse(false);
      studioAudioElRef.current.playbackRate = rate;
      studioAudioElRef.current.play().catch(() => {
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

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      // Direct user gesture unlock for Web Audio and Speech Synthesis
      getOrCreateAudioContext();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }

      const startIndex = Math.max(
        0,
        verses.findIndex((v) => v.verse === activeVerse)
      );
      setIsPlaying(true);
      isPlayingRef.current = true;
      playVerseAtIndex(startIndex >= 0 ? startIndex : 0);
    }
  };

  const handleStep = (delta: number) => {
    stopPlayback();
    const nextIdx = Math.min(
      verses.length - 1,
      Math.max(0, currentVerseIdxRef.current + delta)
    );
    currentVerseIdxRef.current = nextIdx;
    if (verses[nextIdx]) {
      onVerseChange(verses[nextIdx].verse);
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

  if (!verses || verses.length === 0) return null;

  return (
    <div
      style={{
        position: 'sticky',
        bottom: '16px',
        zIndex: 45,
        maxWidth: '1508px',
        margin: '0 auto 20px',
        padding: '0 20px',
      }}
    >
      {audioUrl && (
        <audio
          ref={studioAudioElRef}
          src={audioUrl}
          onEnded={() => stopPlayback()}
        />
      )}

      <div
        style={{
          padding: '12px 18px',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          color: 'var(--ink)',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.36)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left: Indicator & Track Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
          <span
            className="brand-icon"
            aria-hidden="true"
            style={{
              fontSize: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isPlaying ? 'rgba(16, 185, 129, 0.15)' : 'var(--soft)',
            }}
          >
            {isLoadingVerse ? '⏳' : isPlaying ? '🔊' : '♫'}
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>
              Audio Scripture · {bookName} {chapter}:{activeVerse}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--subtle)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '2px',
              }}
            >
              {statusMessage ? (
                <span
                  style={{
                    color: statusMessage.includes('quota') ? '#e5a54b' : 'var(--ink)',
                    cursor: onOpenSettings ? 'pointer' : 'default',
                    textDecoration: onOpenSettings ? 'underline' : 'none',
                  }}
                  onClick={() => onOpenSettings && onOpenSettings()}
                  title={onOpenSettings ? 'Click to open Settings' : undefined}
                >
                  {statusMessage}
                </span>
              ) : (
                <>
                  <span>{versionName}</span>
                  <span>·</span>
                  {engineType === 'native' ? (
                    <span style={{ color: 'var(--green)', fontWeight: 500 }}>
                      Natural Voice Narration
                    </span>
                  ) : engineType === 'studio' ? (
                    <span style={{ color: 'var(--green)', fontWeight: 500 }}>
                      Studio Audio MP3
                    </span>
                  ) : (
                    <span style={{ color: 'var(--green)', fontWeight: 500 }}>
                      Google 24kHz ({selectedVoice})
                    </span>
                  )}

                  {/* Buffering status badge */}
                  {engineType === 'native' ? (
                    <span
                      style={{
                        padding: '1px 7px',
                        borderRadius: '4px',
                        background: 'var(--soft)',
                        fontSize: '11px',
                        color: 'var(--green)',
                        fontWeight: 500,
                      }}
                      title="All chapter verses ready in device voice synthesizer for instant gapless playback"
                    >
                      ⚡ Ready · All {verses.length} Verses
                    </span>
                  ) : bufferedCount > 0 ? (
                    <span
                      style={{
                        padding: '1px 7px',
                        borderRadius: '4px',
                        background: 'var(--soft)',
                        fontSize: '11px',
                        color: 'var(--green)',
                        fontWeight: 500,
                      }}
                      title="Verses preloaded in memory for 0ms gapless playback"
                    >
                      ⚡ Preloaded {bufferedCount}/{verses.length}
                    </span>
                  ) : null}

                  {bilingualMode && parallelVersionName ? (
                    <span style={{ color: 'var(--accent, #e5a54b)', fontWeight: 500 }}>
                      ⇄ {parallelVersionName}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Voice Selector & Playback Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Voice Selector */}
          <select
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value as GoogleNeuralVoiceName)}
            style={{
              height: '36px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            title="Select Scripture Narrator Voice"
          >
            {GOOGLE_NEURAL_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="quiet-button"
            onClick={() => handleStep(-1)}
            title="Previous Verse"
            style={{ minWidth: '36px', height: '36px', padding: '0 8px' }}
          >
            ⏮
          </button>

          <button
            type="button"
            className="add-column"
            onClick={handleTogglePlay}
            style={{
              minWidth: '105px',
              height: '36px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {isLoadingVerse
              ? '⏳ Buffering…'
              : isPlaying
                ? '⏸ Pause'
                : '▶ Listen'}
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={stopPlayback}
            title="Stop Playback"
            style={{ minWidth: '36px', height: '36px', padding: '0 8px' }}
          >
            ⏹
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={() => handleStep(1)}
            title="Next Verse"
            style={{ minWidth: '36px', height: '36px', padding: '0 8px' }}
          >
            ⏭
          </button>

          {/* Bilingual Alternate Toggle (e.g. English ⇄ Twi) */}
          {parallelVerses && parallelVerses.length > 0 && (
            <button
              type="button"
              className={`quiet-button ${bilingualMode ? 'active-pill' : ''}`}
              onClick={() => {
                stopPlayback();
                setBilingualMode(!bilingualMode);
              }}
              title="Alternate reciting primary & parallel language verse by verse"
              style={{
                height: '36px',
                fontSize: '12px',
                fontWeight: bilingualMode ? 600 : 400,
                color: bilingualMode ? 'var(--green)' : 'var(--ink)',
                border: bilingualMode ? '1px solid var(--green)' : '1px solid var(--line)',
              }}
            >
              ⇄ Bilingual ({versionName} + {parallelVersionName})
            </button>
          )}

          {/* Studio MP3 toggle when pre-recorded narration is available */}
          {audioUrl && !bilingualMode && (
            <button
              type="button"
              className={`quiet-button ${useStudioMp3 ? 'active-pill' : ''}`}
              onClick={() => {
                stopPlayback();
                setUseStudioMp3(!useStudioMp3);
              }}
              title="Switch between Studio Recorded MP3 and Verse-by-Verse Narration"
              style={{ height: '36px', fontSize: '12px' }}
            >
              {useStudioMp3 ? 'Studio MP3' : 'Verse Audio'}
            </button>
          )}

          {/* Playback speed selector */}
          <select
            value={rate}
            onChange={(e) => {
              const nextRate = Number(e.target.value);
              setRate(nextRate);
              if (activeSourceRef.current) {
                activeSourceRef.current.playbackRate.value = nextRate;
              }
              if (studioAudioElRef.current) {
                studioAudioElRef.current.playbackRate = nextRate;
              }
              if (isNativeSpeechRef.current && isPlayingRef.current) {
                playVerseAtIndex(currentVerseIdxRef.current);
              }
            }}
            style={{
              height: '36px',
              padding: '0 8px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '12px',
            }}
            aria-label="Playback speed"
          >
            <option value={0.85}>0.85x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.15}>1.15x</option>
            <option value={1.3}>1.3x</option>
          </select>

          {onOpenSettings && (
            <button
              type="button"
              className="quiet-button"
              onClick={onOpenSettings}
              title="Audio & Voice Settings"
              aria-label="Settings"
              style={{ height: '36px', padding: '0 10px' }}
            >
              ⚙️
            </button>
          )}

          {onClose && (
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                stopPlayback();
                onClose();
              }}
              aria-label="Close Audio Reader"
              title="Close Audio Bar"
              style={{ height: '36px', width: '36px' }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
