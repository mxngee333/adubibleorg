import React, { useState, useEffect, useRef } from 'react';
import { VerseData } from '../types/bible';
import {
  GOOGLE_NEURAL_VOICES,
  GoogleNeuralVoiceName,
  decodePcm24kToAudioBuffer,
  synthesizeNeuralAudio,
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
}

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
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<GoogleNeuralVoiceName>('Charon');
  const [rate, setRate] = useState(1.0);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [useStudioMp3, setUseStudioMp3] = useState<boolean>(Boolean(audioUrl));
  const [statusMessage, setStatusMessage] = useState<string>('');

  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const studioAudioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setUseStudioMp3(Boolean(audioUrl));
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const getOrCreateAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLoadingVerse(false);
    isPlayingRef.current = false;
    setStatusMessage('');

    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {}
      activeSourceRef.current = null;
    }

    if (studioAudioElRef.current) {
      studioAudioElRef.current.pause();
      studioAudioElRef.current.currentTime = 0;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

    setIsLoadingVerse(true);
    setStatusMessage(
      langCode === 'tw' || langCode === 'ak'
        ? `Synthesizing Asante Twi (24kHz Neural Voice)…`
        : `Loading 24kHz Google Voice (${selectedVoice})…`
    );

    try {
      const ctx = getOrCreateAudioContext();
      const base64Primary = await synthesizeNeuralAudio(
        verseObj.text,
        langCode,
        selectedVoice
      );

      if (!isPlayingRef.current) {
        setIsLoadingVerse(false);
        return;
      }

      setIsLoadingVerse(false);
      setStatusMessage('');

      const primaryBuffer = decodePcm24kToAudioBuffer(ctx, base64Primary);
      const source = ctx.createBufferSource();
      source.buffer = primaryBuffer;
      source.playbackRate.value = rate;
      source.connect(ctx.destination);
      activeSourceRef.current = source;

      source.onended = async () => {
        if (!isPlayingRef.current) return;

        // Bilingual Mode: Immediately speak parallel language verse (e.g. English -> Twi)
        if (bilingualMode && parallelVerses && parallelVerses[index]) {
          const pVerse = parallelVerses[index];
          const targetLang = parallelLangCode || 'tw';
          setIsLoadingVerse(true);
          setStatusMessage(
            targetLang === 'tw' || targetLang === 'ak'
              ? `Synthesizing Twi parallel (24kHz)…`
              : `Synthesizing parallel verse (24kHz)…`
          );

          try {
            const base64Secondary = await synthesizeNeuralAudio(
              pVerse.text,
              targetLang,
              selectedVoice === 'Charon' ? 'Kore' : 'Charon'
            );

            if (!isPlayingRef.current) {
              setIsLoadingVerse(false);
              return;
            }

            setIsLoadingVerse(false);
            setStatusMessage('');

            const secBuffer = decodePcm24kToAudioBuffer(ctx, base64Secondary);
            const secSource = ctx.createBufferSource();
            secSource.buffer = secBuffer;
            secSource.playbackRate.value = rate;
            secSource.connect(ctx.destination);
            activeSourceRef.current = secSource;

            secSource.onended = () => {
              if (isPlayingRef.current) {
                playVerseAtIndex(index + 1);
              }
            };
            secSource.start();
          } catch {
            setIsLoadingVerse(false);
            if (isPlayingRef.current) {
              playVerseAtIndex(index + 1);
            }
          }
        } else {
          playVerseAtIndex(index + 1);
        }
      };

      source.start();
      setIsPlaying(true);
      isPlayingRef.current = true;
    } catch (err) {
      console.warn('[AudioBibleBar] 24kHz Neural fallback to browser speech:', err);
      setIsLoadingVerse(false);
      setStatusMessage('');

      // Browser TTS Emergency Fallback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(verseObj.text);
        utter.rate = rate;
        utter.lang = langCode === 'tw' ? 'ak-GH' : langCode;
        utter.onend = () => {
          if (isPlayingRef.current) playVerseAtIndex(index + 1);
        };
        window.speechSynthesis.speak(utter);
        setIsPlaying(true);
        isPlayingRef.current = true;
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
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
              {statusMessage || (
                <>
                  {versionName}
                  {' · '}
                  <span style={{ color: 'var(--green)', fontWeight: 500 }}>
                    Google 24kHz ({selectedVoice})
                  </span>
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
          {/* Voice Picker (Charon, Kore, Puck, Aoede, Fenrir) */}
          <select
            value={selectedVoice}
            onChange={(e) => {
              const newVoice = e.target.value as GoogleNeuralVoiceName;
              setSelectedVoice(newVoice);
              if (isPlaying) {
                stopPlayback();
                setTimeout(() => {
                  setIsPlaying(true);
                  isPlayingRef.current = true;
                  playVerseAtIndex(currentVerseIdxRef.current);
                }, 100);
              }
            }}
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
            title="Select Google 24kHz Neural Voice"
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
            style={{ minWidth: '96px' }}
          >
            {isLoadingVerse
              ? 'Loading…'
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
              title="Alternate reading primary & parallel language verse by verse"
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
