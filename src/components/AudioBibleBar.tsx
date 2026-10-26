import React, { useState, useEffect, useRef } from 'react';
import { VerseData } from '../types/bible';

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
  const [rate, setRate] = useState(1.0);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [useStudioMp3, setUseStudioMp3] = useState<boolean>(Boolean(audioUrl));
  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setUseStudioMp3(Boolean(audioUrl));
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
    };
  }, []);

  const speakVerseAtIndex = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (index < 0 || index >= verses.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    window.speechSynthesis.cancel();
    const verseObj = verses[index];
    currentVerseIdxRef.current = index;
    onVerseChange(verseObj.verse);

    const utterPrimary = new SpeechSynthesisUtterance(
      `Verse ${verseObj.verse}. ${verseObj.text}`
    );
    utterPrimary.rate = rate;
    utterPrimary.lang = langCode === 'tw' ? 'ak-GH' : langCode;

    utterPrimary.onend = () => {
      if (!isPlayingRef.current) return;
      if (bilingualMode && parallelVerses && parallelVerses[index]) {
        const pVerse = parallelVerses[index];
        const utterSecondary = new SpeechSynthesisUtterance(pVerse.text);
        utterSecondary.rate = rate;
        utterSecondary.lang =
          parallelLangCode === 'tw' ? 'ak-GH' : parallelLangCode || 'en-US';
        utterSecondary.onend = () => {
          if (isPlayingRef.current) {
            speakVerseAtIndex(index + 1);
          }
        };
        window.speechSynthesis.speak(utterSecondary);
      } else {
        speakVerseAtIndex(index + 1);
      }
    };

    window.speechSynthesis.speak(utterPrimary);
  };

  const handleTogglePlay = () => {
    if (useStudioMp3 && audioUrl && audioElRef.current && !bilingualMode) {
      if (isPlaying) {
        audioElRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        audioElRef.current.playbackRate = rate;
        audioElRef.current.play().catch(() => {
          // Fallback to TTS if stream blocked
          setUseStudioMp3(false);
        });
        setIsPlaying(true);
        isPlayingRef.current = true;
      }
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      const startIndex = Math.max(
        0,
        verses.findIndex((v) => v.verse === activeVerse)
      );
      setIsPlaying(true);
      isPlayingRef.current = true;
      speakVerseAtIndex(startIndex >= 0 ? startIndex : 0);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleStep = (delta: number) => {
    const nextIdx = Math.min(
      verses.length - 1,
      Math.max(0, currentVerseIdxRef.current + delta)
    );
    currentVerseIdxRef.current = nextIdx;
    if (verses[nextIdx]) {
      onVerseChange(verses[nextIdx].verse);
    }
    if (isPlayingRef.current && (!useStudioMp3 || bilingualMode)) {
      speakVerseAtIndex(nextIdx);
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
          ref={audioElRef}
          src={audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            isPlayingRef.current = false;
          }}
        />
      )}

      <div
        style={{
          padding: '12px 18px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          color: 'var(--ink)',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="brand-icon" aria-hidden="true">
            ♫
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>
              Audio Scripture Reader · {bookName} {chapter}:{activeVerse}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--subtle)' }}>
              {versionName}
              {useStudioMp3 && audioUrl && !bilingualMode
                ? ' · Studio Narration'
                : ' · Voice Reader'}
              {bilingualMode && parallelVersionName
                ? ` + Parallel (${parallelVersionName})`
                : ''}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
          }}
        >
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
            style={{ minWidth: '88px' }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Listen'}
          </button>

          <button
            type="button"
            className="quiet-button"
            onClick={handleStop}
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

          {parallelVerses && parallelVerses.length > 0 && (
            <button
              type="button"
              className={`quiet-button ${bilingualMode ? 'active-pill' : ''}`}
              onClick={() => {
                handleStop();
                setBilingualMode(!bilingualMode);
              }}
              title="Alternate reading primary & parallel language verse by verse"
            >
              ⇄ Bilingual ({versionName} + {parallelVersionName})
            </button>
          )}

          <select
            value={rate}
            onChange={(e) => {
              const nextRate = Number(e.target.value);
              setRate(nextRate);
              if (audioElRef.current) {
                audioElRef.current.playbackRate = nextRate;
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
            }}
            aria-label="Playback speed"
          >
            <option value={0.85}>0.85x</option>
            <option value={1}>1.0x</option>
            <option value={1.15}>1.15x</option>
            <option value={1.3}>1.3x</option>
          </select>

          {onClose && (
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                handleStop();
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
