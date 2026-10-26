import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
} from 'lucide-react';
import { VerseData } from '../types/bible';

interface AudioBibleBarProps {
  bookName: string;
  chapter: number;
  versionName: string;
  langCode: string;
  verses: VerseData[];
  parallelVerses?: VerseData[];
  parallelVersionName?: string;
  parallelLangCode?: string;
  activeVerse: number;
  onVerseChange: (verseNum: number) => void;
}

export const AudioBibleBar: React.FC<AudioBibleBarProps> = ({
  bookName,
  chapter,
  versionName,
  langCode,
  verses,
  parallelVerses,
  parallelVersionName,
  parallelLangCode,
  activeVerse,
  onVerseChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [bilingualMode, setBilingualMode] = useState(false);
  const isPlayingRef = useRef(false);
  const currentVerseIdxRef = useRef(0);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
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
    if (isPlayingRef.current) {
      speakVerseAtIndex(nextIdx);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-stone-900/95 px-4 py-2.5 text-stone-100 shadow-lg">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <div className="text-xs font-bold text-amber-200">
            Audio Scripture Reader • {bookName} {chapter}:{activeVerse}
          </div>
          <div className="text-[11px] text-stone-400">
            {versionName}
            {bilingualMode && parallelVersionName
              ? ` + Parallel (${parallelVersionName})`
              : ''}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleStep(-1)}
          className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-800 hover:text-white transition"
          title="Previous Verse"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={handleTogglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition shadow"
          title={isPlaying ? 'Pause' : 'Play Chapter Audio'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <button
          onClick={handleStop}
          className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-800 hover:text-white transition"
          title="Stop"
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleStep(1)}
          className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-800 hover:text-white transition"
          title="Next Verse"
        >
          <SkipForward className="h-4 w-4" />
        </button>

        {parallelVerses && parallelVerses.length > 0 && (
          <button
            onClick={() => setBilingualMode(!bilingualMode)}
            className={`ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              bilingualMode
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
            title="Alternate reading primary & parallel language verse by verse"
          >
            <Repeat className="h-3 w-3" />
            <span className="hidden sm:inline">Bilingual Alternate</span>
          </button>
        )}

        <select
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="ml-1 rounded-lg border border-stone-700 bg-stone-950 px-2 py-1 text-[11px] font-mono text-amber-300"
          aria-label="Playback speed"
        >
          <option value={0.85}>0.85x</option>
          <option value={1}>1.0x</option>
          <option value={1.15}>1.15x</option>
          <option value={1.3}>1.3x</option>
        </select>
      </div>
    </div>
  );
};
