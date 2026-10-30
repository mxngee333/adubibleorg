import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { QUIZ_QUESTIONS, QuizQuestion } from './bibleQuizData';
import { gameAudio } from './gameAudioEngine';
import { addQuizResults, loadPlayerStats, PlayerGameStats, getPlayerRank } from './gameStatsStorage';
import { Volume2, VolumeX, Sparkles, BookOpen, Clock, RotateCcw, Home, Award, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

interface SolomonTempleQuiz3DProps {
  onClose: () => void;
  onOpenPassage?: (slug: string, chapter: number, verse?: number) => void;
}

export const SolomonTempleQuiz3D: React.FC<SolomonTempleQuiz3DProps> = ({ onClose, onOpenPassage }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Game State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.getMuted());

  // Lifelines
  const [used5050, setUsed5050] = useState<boolean>(false);
  const [usedScriptureReveal, setUsedScriptureReveal] = useState<boolean>(false);
  const [usedTimeBonus, setUsedTimeBonus] = useState<boolean>(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [isScriptureHintVisible, setIsScriptureHintVisible] = useState<boolean>(false);

  // Results State
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<PlayerGameStats>(loadPlayerStats());

  // 3D Three.js Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const altarRef = useRef<THREE.Mesh | null>(null);
  const torchLightLeftRef = useRef<THREE.PointLight | null>(null);
  const torchLightRightRef = useRef<THREE.PointLight | null>(null);

  // Initialize Questions Shuffle (10 questions per run)
  const initGame = useCallback(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setTimeLeft(25);
    setIsGameOver(false);
    setUsed5050(false);
    setUsedScriptureReveal(false);
    setUsedTimeBonus(false);
    setDisabledOptions([]);
    setIsScriptureHintVisible(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // THREE.JS 3D SCENE SETUP & RENDER LOOP
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060807);
    scene.fog = new THREE.FogExp2(0x060807, 0.022);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2.2, 7.5);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting: Sacred Altar Glow & Torches
    const ambientLight = new THREE.AmbientLight(0x221d18, 1.2);
    scene.add(ambientLight);

    const heavenlySun = new THREE.DirectionalLight(0xfff4db, 1.8);
    heavenlySun.position.set(5, 12, 6);
    heavenlySun.castShadow = true;
    scene.add(heavenlySun);

    // Left Torch
    const torchLeft = new THREE.PointLight(0xf59e0b, 2.5, 18, 1.2);
    torchLeft.position.set(-4.5, 4.2, 1);
    scene.add(torchLeft);
    torchLightLeftRef.current = torchLeft;

    // Right Torch
    const torchRight = new THREE.PointLight(0xf59e0b, 2.5, 18, 1.2);
    torchRight.position.set(4.5, 4.2, 1);
    scene.add(torchRight);
    torchLightRightRef.current = torchRight;

    // Altar Apex Halo (Golden/Emerald Holy of Holies Glow)
    const altarLight = new THREE.PointLight(0x10b981, 3.2, 15, 1.5);
    altarLight.position.set(0, 1.8, -4);
    scene.add(altarLight);

    // 5. Solomon's Temple Floor (Chequered Marble Grid)
    const floorGeo = new THREE.PlaneGeometry(36, 36, 18, 18);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121714,
      roughness: 0.28,
      metalness: 0.45,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Temple Columns (Boaz & Jachin Gold/Obsidian Pillars)
    const columnGeo = new THREE.CylinderGeometry(0.48, 0.52, 9, 24);
    const capitalGeo = new THREE.BoxGeometry(1.3, 0.45, 1.3);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x1f2622,
      roughness: 0.35,
      metalness: 0.75,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.88,
    });

    const columnPositions = [
      [-4.2, 4, 2],
      [-4.2, 4, -3],
      [4.2, 4, 2],
      [4.2, 4, -3],
    ];

    columnPositions.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(x, y, z);
      col.castShadow = true;
      scene.add(col);

      const cap = new THREE.Mesh(capitalGeo, goldMat);
      cap.position.set(x, y + 4.5, z);
      scene.add(cap);

      const base = new THREE.Mesh(capitalGeo, goldMat);
      base.position.set(x, y - 4.4, z);
      scene.add(base);
    });

    // 7. Central Ark of Covenant / Golden Altar Pedestal
    const altarGeo = new THREE.BoxGeometry(2.4, 1.2, 1.6);
    const altar = new THREE.Mesh(altarGeo, goldMat);
    altar.position.set(0, 0.4, -4);
    altar.castShadow = true;
    scene.add(altar);
    altarRef.current = altar;

    // Glowing Cherubim Wing Ring atop Altar
    const torusGeo = new THREE.TorusGeometry(1.4, 0.08, 16, 64);
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.9,
    });
    const torus = new THREE.Mesh(torusGeo, glowMat);
    torus.position.set(0, 1.6, -4);
    scene.add(torus);

    // 8. Celestial Particle Cloud (200 Rising Divine Sparks)
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1;
      speeds[i] = 0.008 + Math.random() * 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Flickering torches
      if (torchLightLeftRef.current) {
        torchLightLeftRef.current.intensity = 2.4 + Math.sin(elapsed * 7.5) * 0.45;
      }
      if (torchLightRightRef.current) {
        torchLightRightRef.current.intensity = 2.4 + Math.cos(elapsed * 8.2) * 0.45;
      }

      // Rotating altar halo
      torus.rotation.z = elapsed * 0.45;
      torus.rotation.x = Math.sin(elapsed * 0.3) * 0.2;

      // Gentle camera breathe
      camera.position.x = Math.sin(elapsed * 0.35) * 0.25;
      camera.position.y = 2.2 + Math.cos(elapsed * 0.4) * 0.08;
      camera.lookAt(0, 1.2, -4);

      // Float particles upward
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += speeds[i];
          if (arr[i * 3 + 1] > 8.5) {
            arr[i * 3 + 1] = 0;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Timer Tick per Question
  useEffect(() => {
    if (isAnswerRevealed || isGameOver) return;

    if (timeLeft <= 0) {
      handleOptionSelect(-1); // Timeout penalty
      return;
    }

    if (timeLeft <= 5) {
      gameAudio.playTick();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswerRevealed, isGameOver]);

  const currentQ = questions[currentIndex];

  // Lifeline: 50:50
  const handleUse5050 = () => {
    if (used5050 || isAnswerRevealed || !currentQ) return;
    gameAudio.playLifeline();
    setUsed5050(true);

    const wrongIndexes = [0, 1, 2, 3].filter((idx) => idx !== currentQ.correctIndex);
    // Shuffle and pick 2 to disable
    const toDisable = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(toDisable);
  };

  // Lifeline: Scripture Reveal
  const handleUseScriptureReveal = () => {
    if (usedScriptureReveal || isAnswerRevealed || !currentQ) return;
    gameAudio.playLifeline();
    setUsedScriptureReveal(true);
    setIsScriptureHintVisible(true);
  };

  // Lifeline: +15s Time Bonus
  const handleUseTimeBonus = () => {
    if (usedTimeBonus || isAnswerRevealed) return;
    gameAudio.playLifeline();
    setUsedTimeBonus(true);
    setTimeLeft((prev) => prev + 15);
  };

  // Option Selected
  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswerRevealed || !currentQ) return;

    setSelectedOption(optionIdx);
    setIsAnswerRevealed(true);

    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      gameAudio.playCorrect();
      const points = 100 + timeLeft * 10 + streak * 25;
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      gameAudio.playWrong();
      setStreak(0);
    }
  };

  // Proceed to Next Question or Final Results
  const handleNextQuestion = () => {
    gameAudio.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setTimeLeft(25);
      setDisabledOptions([]);
      setIsScriptureHintVisible(false);
    } else {
      // Game Over — Commit stats
      const finalCorrect = selectedOption === currentQ?.correctIndex ? correctCount : correctCount;
      const isPerfect = finalCorrect === questions.length;
      if (isPerfect) gameAudio.playVictory();

      const { newStats, earnedXp: xp } = addQuizResults({
        game: 'solomonQuiz',
        score,
        totalQuestions: questions.length,
        correctAnswers: finalCorrect,
        isPerfect,
      });

      setEarnedXp(xp);
      setPlayerStats(newStats);
      setIsGameOver(true);
    }
  };

  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  const playerRank = getPlayerRank(playerStats.xp);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#060807] text-[#f7f9f5] overflow-hidden select-none">
      {/* 3D WebGL Background Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* TOP HUD BAR */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-b from-[#060807]/90 via-[#060807]/60 to-transparent backdrop-blur-md border-b border-[#2d382c]/40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#182218]/80 hover:bg-[#253625] border border-[#2d382c] text-xs font-semibold text-[#8EA486] hover:text-[#f7f9f5] transition-all cursor-pointer shadow"
          >
            <Home size={15} />
            <span>Main Sanctuary</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#141d14]/70 border border-[#233022] text-xs">
            <span className="text-amber-400 font-bold">🏛️ Solomon&apos;s 3D Temple</span>
            <span className="text-[#8e968d]">&bull;</span>
            <span className="text-[#8EA486] font-medium">Scripture Arena</span>
          </div>
        </div>

        {/* Center: Question Progress & Timer */}
        {!isGameOver && currentQ && (
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <span className="text-[11px] uppercase tracking-wider text-[#8e968d] block font-mono">Question</span>
              <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">
                {currentIndex + 1} <span className="text-[#647466]">/</span> {questions.length}
              </span>
            </div>

            {/* Circular / Pill Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono font-bold text-xs sm:text-sm transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-950/70 border-rose-500/60 text-rose-300 animate-pulse'
                  : 'bg-[#182218]/70 border-[#2d382c] text-amber-300'
              }`}
            >
              <Clock size={14} className={timeLeft <= 5 ? 'text-rose-400' : 'text-amber-400'} />
              <span>{timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Right: Score, Streak & Sound */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] uppercase tracking-wider text-[#8e968d] block font-mono">Wisdom Score</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{score.toLocaleString()} XP</span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-full bg-[#182218]/80 hover:bg-[#253625] border border-[#2d382c] text-[#8EA486] hover:text-amber-400 transition-all cursor-pointer shadow"
            title={isMuted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </header>

      {/* MAIN GAME ARENA BODY */}
      <main className="relative z-10 flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
        {!isGameOver && currentQ ? (
          <>
            {/* Question Parchment Card */}
            <div className="my-auto">
              {/* Category & Difficulty Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202d20]/80 border border-[#354833] text-xs font-semibold text-emerald-300 shadow">
                  <Sparkles size={13} className="text-amber-400" />
                  {currentQ.category}
                </span>

                {streak >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-[11px] font-bold text-amber-300 animate-bounce">
                    🔥 {streak} Streak!
                  </span>
                )}
              </div>

              {/* The Question Text */}
              <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#141a15]/90 via-[#0e1410]/95 to-[#080d09]/95 border border-[#384936]/60 shadow-2xl backdrop-blur-xl">
                <h2 className="text-lg sm:text-2xl font-serif text-[#f4f7f2] leading-snug tracking-tight text-center sm:text-left drop-shadow-md">
                  {currentQ.question}
                </h2>

                {/* Lifeline Scripture Hint Reveal */}
                {isScriptureHintVisible && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-2 animate-fadeIn">
                    <span className="flex items-center gap-2">
                      <BookOpen size={16} className="text-amber-400 shrink-0" />
                      <span>Scripture Reference: <strong>{currentQ.scriptureRef}</strong></span>
                    </span>
                    {onOpenPassage && (
                      <button
                        type="button"
                        onClick={() => {
                          const parts = currentQ.scriptureRef.split(' ');
                          onOpenPassage(parts[0].toLowerCase(), 1);
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold underline cursor-pointer"
                      >
                        Read in Reader &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Four Interactive Choice Pedestals (A, B, C, D) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5">
                {currentQ.options.map((optText, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const isDisabled = disabledOptions.includes(idx);

                  let btnStyle =
                    'bg-[#121913]/85 hover:bg-[#1a251b] border-[#293827] text-[#e2e8df] hover:border-emerald-600/60 shadow-md';

                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-emerald-900/50 animate-pulse';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 ring-1 ring-rose-400';
                    } else {
                      btnStyle = 'bg-[#0a0f0b]/60 border-[#1a221a] text-[#556353] opacity-50';
                    }
                  } else if (isDisabled) {
                    btnStyle = 'bg-[#0a0f0b]/40 border-transparent text-[#3d473b] opacity-30 cursor-not-allowed line-through';
                  }

                  const labels = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerRevealed || isDisabled}
                      onClick={() => handleOptionSelect(idx)}
                      className={`group relative flex items-center gap-3.5 p-4 rounded-xl border text-left font-sans transition-all duration-200 cursor-pointer ${btnStyle}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1f2b1e] border border-[#374934] font-mono font-bold text-xs text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        {labels[idx]}
                      </span>
                      <span className="text-sm sm:text-base font-medium flex-1 leading-snug">{optText}</span>
                      {isAnswerRevealed && isCorrect && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
                      {isAnswerRevealed && isSelected && !isCorrect && <XCircle size={20} className="text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Scholarly Exegesis & Proceed Button Banner */}
              {isAnswerRevealed && (
                <div className="mt-5 p-5 rounded-xl bg-gradient-to-r from-[#111a12] via-[#142016] to-[#111a12] border border-[#2d422e] shadow-xl animate-fadeIn">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedOption === currentQ.correctIndex ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                            ✓ Truth Unlocked (+100 XP)
                          </span>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                            Revelation Note
                          </span>
                        )}
                        <span className="text-[#556353]">&bull;</span>
                        <span className="text-xs font-semibold text-amber-400 font-mono">{currentQ.scriptureRef}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#c8d4c5] leading-relaxed font-serif">
                        {currentQ.explanation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95"
                    >
                      <span>{currentIndex + 1 < questions.length ? 'Next Trial' : 'View Crowns'}</span>
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM LIFELINE DECK */}
            <div className="mt-4 pt-3 border-t border-[#1f2b1e]/60 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6e7d6b] hidden sm:inline">
                  Wisdom Lifelines:
                </span>

                {/* Lifeline 1: 50:50 */}
                <button
                  type="button"
                  disabled={used5050 || isAnswerRevealed}
                  onClick={handleUse5050}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    used5050
                      ? 'bg-[#101410] border-transparent text-[#414a3e] opacity-40 cursor-not-allowed'
                      : 'bg-[#182318] hover:bg-[#223122] border-[#31422f] text-emerald-300 hover:border-emerald-500 shadow'
                  }`}
                  title="50:50 Holy Spirit Wisdom — Remove 2 wrong options"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>50:50</span>
                </button>

                {/* Lifeline 2: Scripture Verse */}
                <button
                  type="button"
                  disabled={usedScriptureReveal || isAnswerRevealed}
                  onClick={handleUseScriptureReveal}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    usedScriptureReveal
                      ? 'bg-[#101410] border-transparent text-[#414a3e] opacity-40 cursor-not-allowed'
                      : 'bg-[#182318] hover:bg-[#223122] border-[#31422f] text-amber-300 hover:border-amber-500 shadow'
                  }`}
                  title="Scripture Lamp — Reveal biblical chapter and verse hint"
                >
                  <BookOpen size={14} className="text-amber-400" />
                  <span>Scripture Lamp</span>
                </button>

                {/* Lifeline 3: Chronos Freeze */}
                <button
                  type="button"
                  disabled={usedTimeBonus || isAnswerRevealed}
                  onClick={handleUseTimeBonus}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    usedTimeBonus
                      ? 'bg-[#101410] border-transparent text-[#414a3e] opacity-40 cursor-not-allowed'
                      : 'bg-[#182318] hover:bg-[#223122] border-[#31422f] text-cyan-300 hover:border-cyan-500 shadow'
                  }`}
                  title="Chronos Freeze — Add 15 extra seconds"
                >
                  <Clock size={14} className="text-cyan-400" />
                  <span>+15s Freeze</span>
                </button>
              </div>

              {/* Player Current Rank Pill */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#121a13]/80 border border-[#273725] text-xs">
                <span>{playerRank.badge}</span>
                <span className="text-[#a4b5a0] font-medium hidden sm:inline">{playerRank.title}</span>
                <span className="text-amber-400 font-bold font-mono">Lvl {Math.floor(playerStats.xp / 1000) + 1}</span>
              </div>
            </div>
          </>
        ) : (
          /* FINAL GAME OVER & REWARD CEREMONY */
          <div className="my-auto p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#141e15] to-[#0a100b] border border-[#2f442f] shadow-2xl text-center max-w-lg mx-auto backdrop-blur-2xl animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-amber-900/30">
              {correctCount === questions.length ? '👑' : correctCount >= 7 ? '🏆' : '📜'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fafcf9] mb-1">
              {correctCount === questions.length
                ? 'Solomon’s Crown Bestowed!'
                : correctCount >= 7
                ? 'Scripture Trial Passed!'
                : 'Sanctuary Journey Complete'}
            </h2>

            <p className="text-xs sm:text-sm text-[#9db09a] mb-6">
              You answered <strong>{correctCount}</strong> out of <strong>{questions.length}</strong> questions correctly with a score of <strong>{score.toLocaleString()}</strong>.
            </p>

            {/* Score & Rewards Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6 font-mono text-center">
              <div className="p-3 rounded-xl bg-[#192419] border border-[#2e402c]">
                <span className="text-[10px] text-[#8e968d] block uppercase">Accuracy</span>
                <span className="text-lg font-bold text-emerald-400">
                  {Math.round((correctCount / (questions.length || 1)) * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#192419] border border-[#2e402c]">
                <span className="text-[10px] text-[#8e968d] block uppercase">XP Earned</span>
                <span className="text-lg font-bold text-amber-400">+{earnedXp}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#192419] border border-[#2e402c]">
                <span className="text-[10px] text-[#8e968d] block uppercase">Day Streak</span>
                <span className="text-lg font-bold text-orange-400">{playerStats.currentStreakDays} 🔥</span>
              </div>
            </div>

            {/* Rank Evolution Progress */}
            <div className="mb-6 p-4 rounded-xl bg-[#101710] border border-[#223121] text-left">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#a4b5a0] flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" />
                  {playerRank.title}
                </span>
                <span className="text-amber-400 font-mono font-bold">{playerStats.xp.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1b261b] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (playerStats.xp % 3000) / 30)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={initGame}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
              >
                <RotateCcw size={16} />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-[#1a251b] hover:bg-[#253526] border border-[#31442e] text-[#b8cbb4] font-semibold text-sm cursor-pointer transition-all"
              >
                Exit to Arcade
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
