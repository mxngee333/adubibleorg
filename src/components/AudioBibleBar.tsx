import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VerseData } from '../types/bible';
import {
  GOOGLE_NEURAL_VOICES,
  GoogleNeuralVoiceName,
  getOrPreloadAudioBuffer,
  isAudioBufferPreloaded,
  cleanVerseForSpeech,
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
  const [engineType, setEngineType] = useState<'24khz' | 'native' | 'studio'>('24khz');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [bufferedCount, setBufferedCount] = useState<number>(0);

  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const isNativeSpeechRef = useRef(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const studioAudioElRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef<number>(0);

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

  // Update count of preloaded verses in memory
  const updateBufferedCount = useCallback(() => {
    let count = 0;
    for (const v of verses) {
      if (isAudioBufferPreloaded(v.text, langCode, selectedVoice)) {
        count++;
      }
    }
    setBufferedCount(count);
  }, [verses, langCode, selectedVoice]);

  // Background Look-Ahead Pre-fetcher for Next Verse (N+1)
  const prefetchAhead = useCallback(
    async (fromIndex: number, depth = 1) => {
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
  const getBestNativeVoice = useCallback((targetLang: string): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const code = (targetLang || 'en').toLowerCase().trim();

    // Asante / Akuapem Twi special check
    if (code === 'tw' || code === 'ak') {
      const ghVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('gh') ||
          v.name.toLowerCase().includes('ghana') ||
          v.lang.toLowerCase().startsWith('ak') ||
          v.lang.toLowerCase().startsWith('tw')
      );
      if (ghVoice) return ghVoice;
    }

    // Direct language prefix match (e.g. 'fr' for French, 'es' for Spanish)
    const exactMatch = voices.find((v) => v.lang.toLowerCase().startsWith(code));
    if (exactMatch) return exactMatch;

    // Prefer high-clarity natural / neural English voice
    const naturalVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        (v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('neural') ||
          v.name.toLowerCase().includes('online'))
    );
    if (naturalVoice) return naturalVoice;

    const defaultEn = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    return defaultEn || voices[0] || null;
  }, []);

  // Clean stop with instant SpeechSynthesis cancel and 35ms micro-fade on Web Audio
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLoadingVerse(false);
    isPlayingRef.current = false;
    setStatusMessage('');

    // 1. Cancel browser native speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
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
      studioAudioElRef.current.currentTime = 0;
    }
  };

  // Instant fallback to native browser Web Speech API (zero buffering, zero API keys required)
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

    // Clear any previous queued speech
    try {
      window.speechSynthesis.cancel();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const matchedVoice = getBestNativeVoice(voiceLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    activeUtteranceRef.current = utterance;
    isNativeSpeechRef.current = true;
    setEngineType('native');
    setIsLoadingVerse(false);
    setIsPlaying(true);
    isPlayingRef.current = true;
    setStatusMessage('');

    utterance.onend = () => {
      activeUtteranceRef.current = null;
      if (isPlayingRef.current) {
        onEnded();
      }
    };

    utterance.onerror = (e) => {
      console.warn('[AudioBibleBar] SpeechSynthesis utterance ended/interrupted:', e);
      activeUtteranceRef.current = null;
      if (isPlayingRef.current) {
        onEnded();
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
      // Keep-alive tick for Chrome long utterances
      window.speechSynthesis.resume();
    } catch (err) {
      console.warn('[AudioBibleBar] Failed to call window.speechSynthesis.speak:', err);
      if (isPlayingRef.current) {
        onEnded();
      }
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

    // If Studio MP3 Narration is active and not in bilingual mode, play HTML5 audio
    if (useStudioMp3 && audioUrl && studioAudioElRef.current && !bilingualMode) {
      setEngineType('studio');
      studioAudioElRef.current.playbackRate = rate;
      studioAudioElRef.current.play().catch(() => {
        setUseStudioMp3(false);
        playVerseAtIndex(index);
      });
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    // Cancel any running speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // Trigger lookahead prefetch for NEXT verse (N+1)
    prefetchAhead(index, 1);

    const ctx = getOrCreateAudioContext();
    const isAlreadyInMemory = isAudioBufferPreloaded(
      verseObj.text,
      langCode,
      selectedVoice
    );

    if (!isAlreadyInMemory) {
      setIsLoadingVerse(true);
      setStatusMessage('Preparing scripture audio…');
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

      // If Cloud 24kHz buffer is not available (no user Gemini key / network unavailable):
      // IMMEDIATELY NARRATE VIA BROWSER SPEECH SYNTHESIS WITH ZERO BUFFERING DELAY!
      if (!primaryBuffer) {
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

      // 24kHz buffer retrieved successfully: Play via Web Audio API
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

      // While primary verse plays, ensure matching parallel verse is ready in bilingual mode
      if (bilingualMode && parallelVerses && parallelVerses[index]) {
        const pVerse = parallelVerses[index];
        const pLang = parallelLangCode || 'tw';
        getOrPreloadAudioBuffer(ctx, pVerse.text, pLang, selectedVoice).catch(() => {});
      }

      source.onended = async () => {
        if (!isPlayingRef.current) return;

        // Bilingual Mode: Recite parallel verse with the SAME consistent voice
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
          // Direct 0ms gapless cutover to next verse
          playVerseAtIndex(index + 1);
        }
      };

      source.start();
      setIsPlaying(true);
      isPlayingRef.current = true;
    } catch (err: any) {
      console.warn('[AudioBibleBar] 24kHz buffer error, falling back to browser speech:', err);
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
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      retryCountRef.current = 0;
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
    retryCountRef.current = 0;
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
      }, 100);
    }
  };

  return (
    <div
      style={{
        position: 'sticky',
        bottom: '16px',
        zIndex: 45,
        maxWidth: '1508px',
        margin: '0 auto 20px',
        padding: '0 36px',
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
          padding: '14px 20px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          color: 'var(--ink)',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.32)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        {/* Left: Indicator & Track Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
          <span className="brand-icon" aria-hidden="true">
            {isLoadingVerse ? '⏳' : isPlaying ? '🔊' : '♫'}
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>
              Audio Scripture · {bookName} {chapter}:{activeVerse}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--subtle)' }}>
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
                  {versionName}
                  {' · '}
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
                  {bufferedCount > 0 && (
                    <span
                      style={{
                        marginLeft: '8px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'var(--soft)',
                        fontSize: '11px',
                        color: 'var(--green)',
                      }}
                      title="Verses preloaded in memory for 0ms gapless playback"
                    >
                      ⚡ Buffered {bufferedCount}/{verses.length}
                    </span>
                  )}
                  {bilingualMode && parallelVersionName
                    ? ` ⇄ ${parallelVersionName}`
                    : ''}
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
          {/* Consistent Voice Selector */}
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
            title="Consistent Google 24kHz Voice Selection"
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
          >
            ⏮
          </button>

          <button
            type="button"
            className="add-column"
            onClick={handleTogglePlay}
            style={{ minWidth: '100px' }}
          >
            {isLoadingVerse
              ? 'Buffering…'
              : isPlaying
                ? '⏸ Pause'
                : '▶ Listen'}
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={stopPlayback}
            title="Stop"
          >
            ⏹
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={() => handleStep(1)}
            title="Next Verse"
          >
            ⏭
          </button>

          {/* Bilingual Alternate Toggle (English ↔ Twi) */}
          {parallelVerses && parallelVerses.length > 0 && (
            <button
              type="button"
              className={`quiet-button ${bilingualMode ? 'active-pill' : ''}`}
              onClick={() => {
                stopPlayback();
                setBilingualMode(!bilingualMode);
              }}
              title="Alternate reading primary & parallel language verse by verse with consistent voice"
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
              title="Switch between Studio Recorded MP3 and Google 24kHz Neural Voice"
            >
              {useStudioMp3 ? 'Studio MP3' : '24kHz Neural'}
            </button>
          )}

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
              title="Audio & API Key Settings"
              aria-label="Settings"
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
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
