import { STORAGE_KEYS, type UserStats, type Exercise } from "@shared/schema";

export function getGuestStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.GUEST_STATS);
  if (!stored) {
    const defaultStats: UserStats = {
      totalExercises: 0,
      totalScore: 0,
      exercisesByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0 },
      lastUpdated: Date.now(),
    };
    return defaultStats;
  }
  const parsed = JSON.parse(stored) as UserStats;
  return {
    ...parsed,
    exercisesByDifficulty: {
      1: parsed.exercisesByDifficulty?.[1] ?? 0,
      2: parsed.exercisesByDifficulty?.[2] ?? 0,
      3: parsed.exercisesByDifficulty?.[3] ?? 0,
      4: parsed.exercisesByDifficulty?.[4] ?? 0,
    },
  };
}

export function updateGuestStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.GUEST_STATS, JSON.stringify({
    ...stats,
    lastUpdated: Date.now(),
  }));
}

export function getGuestExercises(): Exercise[] {
  const stored = localStorage.getItem(STORAGE_KEYS.GUEST_EXERCISES);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function addGuestExercise(exercise: Exercise): void {
  const exercises = getGuestExercises();
  exercises.push(exercise);
  // Keep only last 50 exercises
  const trimmed = exercises.slice(-50);
  localStorage.setItem(STORAGE_KEYS.GUEST_EXERCISES, JSON.stringify(trimmed));
}

export function clearGuestData(): void {
  localStorage.removeItem(STORAGE_KEYS.GUEST_STATS);
  localStorage.removeItem(STORAGE_KEYS.GUEST_EXERCISES);
}

export function getCurrentExercise(): Exercise | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_EXERCISE);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function saveCurrentExercise(exercise: Exercise | null): void {
  if (exercise) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_EXERCISE, JSON.stringify(exercise));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EXERCISE);
  }
}
