import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VerseData } from '../types/bible';
import {
  GOOGLE_NEURAL_VOICES,
  GoogleNeuralVoiceName,
  getOrPreloadAudioBuffer,
  isAudioBufferPreloaded,
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
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [bufferedCount, setBufferedCount] = useState<number>(0);

  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const retryCountRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const studioAudioElRef = useRef<HTMLAudioElement | null>(null);

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
  // Keeps character voice 100% consistent and prevents quota-exhausting storms
  const prefetchAhead = useCallback(
    async (fromIndex: number, depth = 1) => {
      try {
        const ctx = getOrCreateAudioContext();
        for (let i = fromIndex + 1; i <= Math.min(fromIndex + depth, verses.length - 1); i++) {
          const v = verses[i];
          if (v && !isAudioBufferPreloaded(v.text, langCode, selectedVoice)) {
            getOrPreloadAudioBuffer(ctx, v.text, langCode, selectedVoice)
              .then(() => updateBufferedCount())
              .catch(() => {});
          }

          // In bilingual mode, also preload matching parallel verse ahead of time with the SAME voice
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

  // Clean, click-free stop with 35ms micro-fade to eliminate all glitch pops
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLoadingVerse(false);
    isPlayingRef.current = false;
    retryCountRef.current = 0;
    setStatusMessage('');

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
      studioAudioElRef.current.playbackRate = rate;
      studioAudioElRef.current.play().catch(() => {
        setUseStudioMp3(false);
        playVerseAtIndex(index);
      });
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    // Trigger lookahead prefetch for NEXT verse (N+1) only, saving quota while maintaining 0ms gapless cutover
    prefetchAhead(index, 1);

    const ctx = getOrCreateAudioContext();
    const isAlreadyInMemory = isAudioBufferPreloaded(
      verseObj.text,
      langCode,
      selectedVoice
    );

    if (!isAlreadyInMemory) {
      setIsLoadingVerse(true);
      setStatusMessage(
        langCode === 'tw' || langCode === 'ak'
          ? `Buffering Asante Twi (24kHz ${selectedVoice})…`
          : `Buffering 24kHz (${selectedVoice})…`
      );
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

      // Reset retry count on successful audio retrieval
      retryCountRef.current = 0;
      setIsLoadingVerse(false);
      setStatusMessage('');
      updateBufferedCount();

      // Clean audio pipeline via GainNode with anti-pop ramp
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
          } catch {
            if (isPlayingRef.current) {
              playVerseAtIndex(index + 1);
            }
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
      console.warn('[AudioBibleBar] 24kHz synthesis error:', err);
      setIsLoadingVerse(false);

      if (retryCountRef.current < 2 && isPlayingRef.current) {
        retryCountRef.current += 1;
        setStatusMessage(`Retrying 24kHz stream (${retryCountRef.current}/2)…`);
        setTimeout(() => {
          if (isPlayingRef.current) {
            playVerseAtIndex(index);
          }
        }, 1200);
      } else {
        // Stop infinite buffering loop and show clear guidance
        setIsPlaying(false);
        isPlayingRef.current = false;
        retryCountRef.current = 0;

        const errStr = String(err?.message || '').toLowerCase();
        if (errStr.includes('quota') || errStr.includes('429')) {
          setStatusMessage('Daily 24kHz quota limit reached · Tap ⚙️ to add your free Gemini key');
        } else {
          setStatusMessage('Audio paused · Tap Play to retry or ⚙️ to configure API key');
        }
      }
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
                  <span style={{ color: 'var(--green)', fontWeight: 500 }}>
                    Google 24kHz ({selectedVoice})
                  </span>
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
                : '▶ Listen 24kHz'}
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
