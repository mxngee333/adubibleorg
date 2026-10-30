import React, { useState, useEffect } from 'react';
import { SolomonTempleQuiz3D } from './SolomonTempleQuiz3D';
import { EdenWordWeaver3D } from './EdenWordWeaver3D';
import { loadPlayerStats, getPlayerRank, ALL_BADGES, PlayerGameStats } from './gameStatsStorage';
import { gameAudio } from './gameAudioEngine';
import { X, Trophy, Sparkles, Play, Award, Flame, Volume2, VolumeX, Shield, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

interface BibleGamesArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPassage?: (slug: string, chapter: number, verse?: number) => void;
}

type ActiveGameMode = 'arcade' | 'solomonQuiz' | 'edenScramble';
type CategoryFilter = 'all' | '3d' | 'trivia' | 'word';

export const BibleGamesArcadeModal: React.FC<BibleGamesArcadeModalProps> = ({
  isOpen,
  onClose,
  onOpenPassage,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGameMode>('arcade');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [playerStats, setPlayerStats] = useState<PlayerGameStats>(loadPlayerStats());
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.getMuted());

  // Reload stats whenever returning to arcade hub
  useEffect(() => {
    if (activeGame === 'arcade') {
      setPlayerStats(loadPlayerStats());
    }
  }, [activeGame]);

  if (!isOpen) return null;

  // Active 3D Fullscreen Game Screens
  if (activeGame === 'solomonQuiz') {
    return <SolomonTempleQuiz3D onClose={() => setActiveGame('arcade')} onOpenPassage={onOpenPassage} />;
  }

  if (activeGame === 'edenScramble') {
    return <EdenWordWeaver3D onClose={() => setActiveGame('arcade')} />;
  }

  const playerRank = getPlayerRank(playerStats.xp);
  const unlockedBadgesCount = playerStats.badges.length;

  const toggleSound = () => {
    const next = gameAudio.toggleMute();
    setIsMuted(next);
  };

  const handleLaunchGame = (game: ActiveGameMode) => {
    gameAudio.playClick();
    setActiveGame(game);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-hidden">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-5xl flex flex-col rounded-none sm:rounded-2xl bg-gradient-to-b from-[#0e1711] via-[#09110b] to-[#040805] border border-[#233525] shadow-2xl overflow-hidden text-[#f7faf8]">
        {/* TOP MODAL HEADER */}
        <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#1f2f21]/80 bg-[#0e1811]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-md">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-[#fafcf9] tracking-tight">
                  AduBible 3D Scripture Games &amp; Arcade
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                  ⚡ 3D WebGL
                </span>
              </div>
              <p className="text-xs text-[#8ea486]">
                Immersive 3D biblical worlds, interactive exegesis trivia &amp; scripture memory arenas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-lg bg-[#142016] hover:bg-[#1d2d1f] border border-[#283b2a] text-[#8ea486] hover:text-amber-400 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#142016] hover:bg-rose-950/80 border border-[#283b2a] text-[#8ea486] hover:text-rose-300 transition-colors cursor-pointer"
              title="Close Arcade"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7">
          {/* 1. PLAYER EMBEDDED PROFILE BANNER */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#142418] via-[#101e14] to-[#0c180f] border border-[#263c29] shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#1b3120] border-2 border-amber-400/60 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {playerRank.badge}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-[#fafcf9]">{playerRank.title}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                    Lvl {Math.floor(playerStats.xp / 1000) + 1}
                  </span>
                </div>
                <p className="text-xs text-[#8ea486] mt-0.5">
                  Wisdom Points: <strong className="text-amber-400 font-mono">{playerStats.xp.toLocaleString()} XP</strong>
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#1f3022]">
              <div className="text-center font-mono">
                <span className="text-[10px] uppercase text-[#738470] block">Streak</span>
                <span className="text-sm sm:text-base font-bold text-orange-400 flex items-center gap-1 justify-center">
                  <Flame size={15} />
                  {playerStats.currentStreakDays}d
                </span>
              </div>
              <div className="text-center font-mono">
                <span className="text-[10px] uppercase text-[#738470] block">Crowns</span>
                <span className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-1 justify-center">
                  <Trophy size={15} />
                  {playerStats.perfectQuizzes}
                </span>
              </div>
              <div className="text-center font-mono">
                <span className="text-[10px] uppercase text-[#738470] block">Badges</span>
                <span className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-1 justify-center">
                  <Award size={15} />
                  {unlockedBadgesCount} / {ALL_BADGES.length}
                </span>
              </div>
            </div>
          </div>

          {/* 2. CATEGORY FILTER TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                categoryFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#121c14] hover:bg-[#1a281d] border border-[#213324] text-[#8ea486]'
              }`}
            >
              All Experiences (3)
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('3d')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                categoryFilter === '3d'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#121c14] hover:bg-[#1a281d] border border-[#213324] text-[#8ea486]'
              }`}
            >
              🏛️ 3D Arenas
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('trivia')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                categoryFilter === 'trivia'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#121c14] hover:bg-[#1a281d] border border-[#213324] text-[#8ea486]'
              }`}
            >
              🧠 Exegesis Trivia
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('word')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                categoryFilter === 'word'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#121c14] hover:bg-[#1a281d] border border-[#213324] text-[#8ea486]'
              }`}
            >
              🌿 Word &amp; Memory
            </button>
          </div>

          {/* 3. GAME CARDS SHOWCASE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* GAME 1: SOLOMON'S TEMPLE 3D */}
            {(categoryFilter === 'all' || categoryFilter === '3d' || categoryFilter === 'trivia') && (
              <div className="group relative rounded-2xl bg-gradient-to-b from-[#132217] via-[#0d1810] to-[#070e09] border border-[#28412c] p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/70 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} />
                      Featured 3D Arena
                    </span>
                    <span className="text-xs font-mono text-[#789074]">10 Trials &bull; 25s Clock</span>
                  </div>

                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600/30 to-emerald-600/30 border border-amber-500/50 flex items-center justify-center text-2xl shadow shrink-0 group-hover:scale-105 transition-transform">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#fafcf9] group-hover:text-emerald-300 transition-colors">
                        Solomon’s Temple 3D: Scripture Arena
                      </h3>
                      <p className="text-xs text-[#9eb696] leading-relaxed mt-1">
                        Step onto the marbled floor of King Solomon’s sanctuary. Answer verified exegesis questions surrounded by dynamic 3D torchlight, altar halos, and Holy Spirit lifelines.
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    <span className="px-2 py-0.5 rounded bg-[#16271a] border border-[#2a3f2e] text-[11px] text-[#8ea486]">
                      Real-time 3D Three.js
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#16271a] border border-[#2a3f2e] text-[11px] text-[#8ea486]">
                      50:50 &amp; Scripture Lamp
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#16271a] border border-[#2a3f2e] text-[11px] text-[#8ea486]">
                      Strong&apos;s Hebrew/Greek
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#1c2e20] flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-semibold">
                    Best: {playerStats.highScores.solomonQuiz.toLocaleString()} XP
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchGame('solomonQuiz')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Enter 3D Temple</span>
                  </button>
                </div>
              </div>
            )}

            {/* GAME 2: EDEN WORD WEAVER 3D */}
            {(categoryFilter === 'all' || categoryFilter === '3d' || categoryFilter === 'word') && (
              <div className="group relative rounded-2xl bg-gradient-to-b from-[#132217] via-[#0d1810] to-[#070e09] border border-[#28412c] p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/70 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} />
                      3D Memory Quest
                    </span>
                    <span className="text-xs font-mono text-[#789074]">Scripture Scramble</span>
                  </div>

                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-teal-600/30 border border-emerald-500/50 flex items-center justify-center text-2xl shadow shrink-0 group-hover:scale-105 transition-transform">
                      🌿
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#fafcf9] group-hover:text-emerald-300 transition-colors">
                        Eden Word Weaver 3D: Rune Scramble
                      </h3>
                      <p className="text-xs text-[#9eb696] leading-relaxed mt-1">
                        Unscramble sacred prophetic names and covenant titles floating as 3D crystals in the Garden of Eden by the reflective river pool.
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    <span className="px-2 py-0.5 rounded bg-[#16271a] border border-[#2a3f2e] text-[11px] text-[#8ea486]">
                      3D Floating Crystals
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#16271a] border border-[#2a3f2e] text-[11px] text-[#8ea486]">
                      Word Speedrun
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#16271a] border border-[#2a3f2e] text-[11px] text-[#8ea486]">
                      Covenant Exegesis
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#1c2e20] flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    Best: {playerStats.highScores.edenScramble.toLocaleString()} XP
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchGame('edenScramble')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Weave Words</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. TROPHIES & SACRED BADGES CORNER */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b140d] border border-[#1e3020]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#fafcf9] flex items-center gap-2">
                <Trophy size={17} className="text-amber-400" />
                <span>Sacred Milestones &amp; Crowns</span>
              </h2>
              <span className="text-xs font-mono text-[#8ea486]">
                {unlockedBadgesCount} / {ALL_BADGES.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {ALL_BADGES.map((b) => {
                const isUnlocked = playerStats.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-[#142618] to-[#0e1a11] border-amber-400/50 text-[#fafcf9] shadow-md shadow-amber-950/30'
                        : 'bg-[#080d09] border-[#182419] text-[#4b5948] opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{b.icon}</div>
                    <div className="font-serif font-bold text-xs truncate" title={b.name}>
                      {b.name}
                    </div>
                    <div className="text-[10px] text-[#7d9277] mt-0.5 line-clamp-2 leading-tight">
                      {b.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
