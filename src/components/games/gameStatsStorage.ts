/**
 * AduBible Player Progress, Crown & XP Storage Engine
 * Persists player stats, level ranks, streaks, and unlocked badges in localStorage.
 */

export interface PlayerGameStats {
  xp: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  quizzesCompleted: number;
  perfectQuizzes: number;
  currentStreakDays: number;
  lastPlayedDate: string; // YYYY-MM-DD
  highScores: {
    solomonQuiz: number;
    edenScramble: number;
    chronoCanon: number;
  };
  badges: string[]; // List of badge IDs
}

export interface PlayerRank {
  title: string;
  minXp: number;
  badge: string;
  color: string;
}

export const PLAYER_RANKS: PlayerRank[] = [
  { title: 'Scripture Seeker', minXp: 0, badge: '🌱', color: '#8EA486' },
  { title: 'Faithful Student', minXp: 500, badge: '📜', color: '#10b981' },
  { title: 'Temple Scholar', minXp: 1500, badge: '🏛️', color: '#3b82f6' },
  { title: 'Exegetical Scribe', minXp: 3500, badge: '✍️', color: '#8b5cf6' },
  { title: 'Prophet of Wisdom', minXp: 7000, badge: '🔥', color: '#f59e0b' },
  { title: 'Sovereign Apostle of Scripture', minXp: 12000, badge: '👑', color: '#fcd34d' },
];

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ALL_BADGES: BadgeDefinition[] = [
  {
    id: 'first_quiz',
    name: 'First Light',
    description: 'Complete your first Scripture quiz in the 3D Temple.',
    icon: '✨',
  },
  {
    id: 'perfect_solomon',
    name: "Solomon's Crown",
    description: 'Achieve 100% accuracy in a 10-question Scripture Arena round.',
    icon: '👑',
  },
  {
    id: 'scripture_50',
    name: 'Wisdom Keeper',
    description: 'Answer 50 biblical questions correctly.',
    icon: '💎',
  },
  {
    id: 'speed_demon',
    name: 'Flash of Mount Sinai',
    description: 'Answer 5 questions correctly with more than 15s remaining each.',
    icon: '⚡',
  },
  {
    id: 'streak_3',
    name: 'Three-Fold Cord',
    description: 'Play Scripture games 3 consecutive days in a row.',
    icon: '🔥',
  },
  {
    id: 'eden_master',
    name: 'Eden Restored',
    description: 'Unscramble all biblical keywords in Eden Word Weaver.',
    icon: '🌿',
  },
];

const STORAGE_KEY = 'adubible_player_stats';

const DEFAULT_STATS: PlayerGameStats = {
  xp: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  quizzesCompleted: 0,
  perfectQuizzes: 0,
  currentStreakDays: 1,
  lastPlayedDate: new Date().toISOString().slice(0, 10),
  highScores: {
    solomonQuiz: 0,
    edenScramble: 0,
    chronoCanon: 0,
  },
  badges: [],
};

export function loadPlayerStats(): PlayerGameStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed, highScores: { ...DEFAULT_STATS.highScores, ...(parsed.highScores || {}) } };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerGameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota
  }
}

export function getPlayerRank(xp: number): PlayerRank {
  for (let i = PLAYER_RANKS.length - 1; i >= 0; i--) {
    if (xp >= PLAYER_RANKS[i].minXp) {
      return PLAYER_RANKS[i];
    }
  }
  return PLAYER_RANKS[0];
}

export function addQuizResults(params: {
  game: 'solomonQuiz' | 'edenScramble' | 'chronoCanon';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  isPerfect: boolean;
}): { newStats: PlayerGameStats; earnedXp: number; newBadges: BadgeDefinition[] } {
  const stats = loadPlayerStats();
  const today = new Date().toISOString().slice(0, 10);

  // Calculate Streak
  let streak = stats.currentStreakDays;
  if (stats.lastPlayedDate !== today) {
    const lastDate = new Date(stats.lastPlayedDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  // Calculate XP: 50 XP per correct + 200 XP completion bonus + 300 XP perfect bonus
  const earnedXp = params.correctAnswers * 50 + 200 + (params.isPerfect ? 300 : 0);

  const updated: PlayerGameStats = {
    ...stats,
    xp: stats.xp + earnedXp,
    totalQuestionsAnswered: stats.totalQuestionsAnswered + params.totalQuestions,
    totalCorrect: stats.totalCorrect + params.correctAnswers,
    quizzesCompleted: stats.quizzesCompleted + 1,
    perfectQuizzes: stats.perfectQuizzes + (params.isPerfect ? 1 : 0),
    currentStreakDays: streak,
    lastPlayedDate: today,
    highScores: {
      ...stats.highScores,
      [params.game]: Math.max(stats.highScores[params.game] || 0, params.score),
    },
  };

  // Evaluate Badges
  const newBadges: BadgeDefinition[] = [];
  const existingBadgeSet = new Set(stats.badges);

  const award = (id: string) => {
    if (!existingBadgeSet.has(id)) {
      existingBadgeSet.add(id);
      const b = ALL_BADGES.find((item) => item.id === id);
      if (b) newBadges.push(b);
    }
  };

  if (updated.quizzesCompleted >= 1) award('first_quiz');
  if (params.isPerfect) award('perfect_solomon');
  if (updated.totalCorrect >= 50) award('scripture_50');
  if (updated.currentStreakDays >= 3) award('streak_3');

  updated.badges = Array.from(existingBadgeSet);
  savePlayerStats(updated);

  return { newStats: updated, earnedXp, newBadges };
}
