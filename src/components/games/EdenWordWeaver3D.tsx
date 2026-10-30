import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gameAudio } from './gameAudioEngine';
import { addQuizResults, loadPlayerStats, PlayerGameStats, getPlayerRank } from './gameStatsStorage';
import { Volume2, VolumeX, RotateCcw, Home, Sparkles, CheckCircle2, Award, Clock } from 'lucide-react';

interface EdenWordWeaver3DProps {
  onClose: () => void;
}

interface WordChallenge {
  word: string;
  hint: string;
  scriptureRef: string;
  meaning: string;
}

const EDEN_WORDS: WordChallenge[] = [
  {
    word: 'EMMANUEL',
    hint: 'Prophetic title meaning "God with us"',
    scriptureRef: 'Matthew 1:23; Isaiah 7:14',
    meaning: 'The eternal divine presence manifested in Jesus Christ born of the virgin.',
  },
  {
    word: 'MELCHIZEDEK',
    hint: 'King of Salem and Priest of the Most High God',
    scriptureRef: 'Genesis 14:18; Hebrews 7:1',
    meaning: 'The eternal priesthood type of Christ having neither beginning of days nor end of life.',
  },
  {
    word: 'BETHLEHEM',
    hint: 'City of David meaning "House of Bread"',
    scriptureRef: 'Micah 5:2; Luke 2:4',
    meaning: 'The birthplace of the Messiah, out of which came the Bread of Life.',
  },
  {
    word: 'PENTECOST',
    hint: 'The day the Holy Spirit fell as tongues of fire',
    scriptureRef: 'Acts 2:1–4',
    meaning: 'The empowerment of the Church with signs, wonders, and diverse tongues.',
  },
  {
    word: 'EPHESIANS',
    hint: 'Apostle Paul’s epistle of spiritual blessings in heavenly places',
    scriptureRef: 'Ephesians 1:3',
    meaning: 'The mystery of Christ and the Church seated together in glory.',
  },
  {
    word: 'MARANATHA',
    hint: 'Aramaic biblical exclamation meaning "Our Lord, Come!"',
    scriptureRef: '1 Corinthians 16:22',
    meaning: 'The fervent apostolic prayer for the glorious return of Jesus Christ.',
  },
];

export const EdenWordWeaver3D: React.FC<EdenWordWeaver3DProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ char: string; originalIdx: number; used: boolean }[]>([]);
  const [score, setScore] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [isWordComplete, setIsWordComplete] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.getMuted());
  const [playerStats, setPlayerStats] = useState<PlayerGameStats>(loadPlayerStats());
  const [earnedXp, setEarnedXp] = useState<number>(0);

  // THREE.js Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const runeGroupRef = useRef<THREE.Group | null>(null);

  const currentChallenge = EDEN_WORDS[currentIndex];

  // Initialize Word Letters
  const loadWord = useCallback((idx: number) => {
    const challenge = EDEN_WORDS[idx];
    if (!challenge) return;

    const chars = challenge.word.split('');
    const shuffled = chars
      .map((char, originalIdx) => ({ char, originalIdx, rand: Math.random() }))
      .sort((a, b) => a.rand - b.rand)
      .map(({ char, originalIdx }) => ({ char, originalIdx, used: false }));

    setAvailableLetters(shuffled);
    setPlacedLetters(new Array(chars.length).fill(''));
    setIsWordComplete(false);
  }, []);

  useEffect(() => {
    loadWord(0);
  }, [loadWord]);

  // THREE.JS 3D EDEN ENVIRONMENT
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040d0a);
    scene.fog = new THREE.FogExp2(0x040d0a, 0.03);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Sacred Eden Foliage Ambient & Sunlight
    const ambient = new THREE.AmbientLight(0x0f2b20, 1.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xecfccb, 1.6);
    sun.position.set(4, 10, 5);
    scene.add(sun);

    const riverLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    riverLight.position.set(0, -0.5, -2);
    scene.add(riverLight);

    // Reflective Eden River Pool
    const riverGeo = new THREE.PlaneGeometry(30, 30, 20, 20);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.15,
      metalness: 0.85,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.y = -1;
    scene.add(river);

    // Floating 3D Emerald Crystals Group
    const runeGroup = new THREE.Group();
    scene.add(runeGroup);
    runeGroupRef.current = runeGroup;

    const crystalGeo = new THREE.OctahedronGeometry(0.5, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9,
    });

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(Math.cos(angle) * 3.6, 0.8 + Math.sin(i * 1.5) * 0.4, Math.sin(angle) * 2.8 - 2);
      runeGroup.add(crystal);
    }

    // 150 Golden Spores / Manna Particles
    const mannaCount = 180;
    const mannaGeo = new THREE.BufferGeometry();
    const mannaPos = new Float32Array(mannaCount * 3);
    for (let i = 0; i < mannaCount * 3; i += 3) {
      mannaPos[i] = (Math.random() - 0.5) * 14;
      mannaPos[i + 1] = Math.random() * 6;
      mannaPos[i + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    mannaGeo.setAttribute('position', new THREE.BufferAttribute(mannaPos, 3));
    const mannaMat = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.07,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const manna = new THREE.Points(mannaGeo, mannaMat);
    scene.add(manna);

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      runeGroup.rotation.y = elapsed * 0.25;
      camera.position.x = Math.sin(elapsed * 0.3) * 0.2;

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

  // Timer Tick
  useEffect(() => {
    if (isGameOver) return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const handlePlaceLetter = (itemIndex: number) => {
    const item = availableLetters[itemIndex];
    if (!item || item.used || isWordComplete) return;

    gameAudio.playClick();

    // Find first empty slot
    const firstEmpty = placedLetters.findIndex((c) => c === '');
    if (firstEmpty === -1) return;

    const newPlaced = [...placedLetters];
    newPlaced[firstEmpty] = item.char;
    setPlacedLetters(newPlaced);

    const newAvailable = [...availableLetters];
    newAvailable[itemIndex].used = true;
    setAvailableLetters(newAvailable);

    // Check if fully placed
    if (!newPlaced.includes('')) {
      const spelled = newPlaced.join('');
      if (spelled === currentChallenge.word) {
        // Correct Word!
        gameAudio.playCorrect();
        setIsWordComplete(true);
        const pts = 250 + timeLeft * 5;
        setScore((s) => s + pts);
        setSolvedCount((c) => c + 1);
      } else {
        gameAudio.playWrong();
      }
    }
  };

  const handleRemovePlaced = (slotIdx: number) => {
    const char = placedLetters[slotIdx];
    if (!char || isWordComplete) return;

    gameAudio.playClick();

    const newPlaced = [...placedLetters];
    newPlaced[slotIdx] = '';
    setPlacedLetters(newPlaced);

    // Re-enable first matching used available letter
    const availIdx = availableLetters.findIndex((item) => item.char === char && item.used);
    if (availIdx !== -1) {
      const newAvail = [...availableLetters];
      newAvail[availIdx].used = false;
      setAvailableLetters(newAvail);
    }
  };

  const handleNextWord = () => {
    gameAudio.playClick();
    if (currentIndex + 1 < EDEN_WORDS.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      loadWord(nextIdx);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const { newStats, earnedXp: xp } = addQuizResults({
      game: 'edenScramble',
      score,
      totalQuestions: EDEN_WORDS.length,
      correctAnswers: solvedCount,
      isPerfect: solvedCount === EDEN_WORDS.length,
    });
    setEarnedXp(xp);
    setPlayerStats(newStats);
    setIsGameOver(true);
    if (solvedCount > 0) gameAudio.playVictory();
  };

  const playerRank = getPlayerRank(playerStats.xp);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#040d0a] text-[#f7f9f5] overflow-hidden select-none">
      {/* 3D WebGL Background Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* HEADER HUD */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-b from-[#040d0a]/90 to-transparent border-b border-[#1b3d2e]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c241b]/80 hover:bg-[#163a2c] border border-[#23533e] text-xs font-semibold text-emerald-300 cursor-pointer shadow"
          >
            <Home size={15} />
            <span>Sanctuary</span>
          </button>
          <span className="hidden sm:inline text-xs font-bold text-emerald-400 font-mono">
            🌿 Eden Word Weaver 3D
          </span>
        </div>

        {/* Center: Timer & Progress */}
        <div className="flex items-center gap-4">
          <div className="text-center font-mono">
            <span className="text-[11px] text-[#6ee7b7] block uppercase">Word</span>
            <span className="text-sm font-bold text-emerald-300">
              {currentIndex + 1} / {EDEN_WORDS.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c241b]/80 border border-[#23533e] font-mono text-xs sm:text-sm text-emerald-300 font-bold">
            <Clock size={14} className="text-amber-400" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Right: Score & Mute */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-amber-300 hidden sm:inline">
            {score.toLocaleString()} XP
          </span>
          <button
            type="button"
            onClick={() => setIsMuted(gameAudio.toggleMute())}
            className="p-2 rounded-full bg-[#0c241b]/80 border border-[#23533e] text-emerald-300 hover:text-amber-300 cursor-pointer shadow"
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </header>

      {/* GAME ARENA */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
        {!isGameOver ? (
          <div className="my-auto text-center">
            {/* Clue Parchment Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0b241b]/95 to-[#061711]/95 border border-[#1f503c] shadow-2xl backdrop-blur-xl mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/40 text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-2">
                <Sparkles size={12} className="text-amber-400" />
                Scripture Clue
              </span>
              <h2 className="text-lg sm:text-xl font-serif text-[#ecfdf5] mb-1">
                &ldquo;{currentChallenge.hint}&rdquo;
              </h2>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                {currentChallenge.scriptureRef}
              </span>
            </div>

            {/* Target Placed Slots (Golden Pedestals) */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8">
              {placedLetters.map((char, slotIdx) => (
                <button
                  key={slotIdx}
                  type="button"
                  onClick={() => handleRemovePlaced(slotIdx)}
                  className={`w-11 h-13 sm:w-13 sm:h-16 rounded-xl border flex items-center justify-center text-lg sm:text-2xl font-serif font-bold transition-all shadow-lg ${
                    char
                      ? 'bg-gradient-to-b from-[#1b4332] to-[#0e271d] border-emerald-400 text-emerald-200 shadow-emerald-950/60 scale-105 cursor-pointer'
                      : 'bg-[#091b14]/70 border-dashed border-[#23533e] text-transparent'
                  }`}
                  title={char ? 'Click to remove letter' : 'Slot'}
                >
                  {char || '·'}
                </button>
              ))}
            </div>

            {/* Floating Letter Stones to Pick */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
              {availableLetters.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={item.used || isWordComplete}
                  onClick={() => handlePlaceLetter(idx)}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border flex items-center justify-center text-base sm:text-xl font-serif font-bold transition-all cursor-pointer ${
                    item.used
                      ? 'bg-[#06140e]/40 border-transparent text-[#234234] opacity-30 cursor-not-allowed'
                      : 'bg-gradient-to-b from-[#103527] to-[#0a2319] hover:from-[#184e3a] hover:to-[#0f3426] border-[#29684e] hover:border-emerald-400 text-[#ecfdf5] shadow-md hover:scale-110 active:scale-95'
                  }`}
                >
                  {item.char}
                </button>
              ))}
            </div>

            {/* Word Solved Card */}
            {isWordComplete && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#0d2e22] via-[#103a2b] to-[#0d2e22] border border-emerald-500 shadow-xl animate-scaleUp">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <CheckCircle2 size={18} />
                  <span>Covenant Revealed! (+250 XP)</span>
                </div>
                <p className="text-xs sm:text-sm text-[#d1fae5] font-serif mb-4">
                  {currentChallenge.meaning}
                </p>
                <button
                  type="button"
                  onClick={handleNextWord}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 cursor-pointer transition-transform hover:scale-105"
                >
                  {currentIndex + 1 < EDEN_WORDS.length ? 'Next Word Stone &rarr;' : 'Complete Eden Walk'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* GAME OVER */
          <div className="my-auto p-8 rounded-2xl bg-[#091f16] border border-[#23533e] text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow">
              🌿
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#fafcf9] mb-2">Eden Walk Complete</h2>
            <p className="text-xs sm:text-sm text-[#a7f3d0] mb-6">
              You unscrambled <strong>{solvedCount}</strong> out of <strong>{EDEN_WORDS.length}</strong> words. Wisdom Score: <strong>{score.toLocaleString()} XP</strong>.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  loadWord(0);
                  setScore(0);
                  setSolvedCount(0);
                  setTimeLeft(60);
                  setIsGameOver(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer shadow"
              >
                <RotateCcw size={15} />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#13382a] hover:bg-[#1a4a38] text-[#a7f3d0] font-semibold text-sm cursor-pointer"
              >
                Back to Arcade
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
