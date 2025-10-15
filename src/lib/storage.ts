import { STORAGE_KEYS, type UserStats, type Exercise } from "@shared/schema";

export function getGuestStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.GUEST_STATS);
  if (!stored) {
    const defaultStats: UserStats = {
      totalExercises: 0,
      totalScore: 0,
      exercisesByOperation: { multiplication: 0, division: 0 },
      exercisesByDifficulty: {
        multiplication: { 1: 0, 2: 0, 3: 0, 4: 0 },
        division: { 1: 0, 2: 0, 3: 0, 4: 0 },
      },
      lastUpdated: Date.now(),
    };
    return defaultStats;
  }

  const parsed = JSON.parse(stored) as Partial<UserStats> & {
    exercisesByDifficulty?: any;
    exercisesByOperation?: Partial<Record<'multiplication' | 'division', number>>;
  };

  const legacyDifficulty = parsed.exercisesByDifficulty as
    | UserStats['exercisesByDifficulty']
    | Partial<Record<1 | 2 | 3 | 4, number>>
    | undefined;

  const normalizedDifficulty: UserStats['exercisesByDifficulty'] =
    legacyDifficulty && 'multiplication' in legacyDifficulty
      ? {
          multiplication: {
            1: legacyDifficulty.multiplication?.[1] ?? 0,
            2: legacyDifficulty.multiplication?.[2] ?? 0,
            3: legacyDifficulty.multiplication?.[3] ?? 0,
            4: legacyDifficulty.multiplication?.[4] ?? 0,
          },
          division: {
            1: legacyDifficulty.division?.[1] ?? 0,
            2: legacyDifficulty.division?.[2] ?? 0,
            3: legacyDifficulty.division?.[3] ?? 0,
            4: legacyDifficulty.division?.[4] ?? 0,
          },
        }
      : {
          multiplication: {
            1: (legacyDifficulty as Partial<Record<1 | 2 | 3 | 4, number>>)?.[1] ?? 0,
            2: (legacyDifficulty as Partial<Record<1 | 2 | 3 | 4, number>>)?.[2] ?? 0,
            3: (legacyDifficulty as Partial<Record<1 | 2 | 3 | 4, number>>)?.[3] ?? 0,
            4: (legacyDifficulty as Partial<Record<1 | 2 | 3 | 4, number>>)?.[4] ?? 0,
          },
          division: { 1: 0, 2: 0, 3: 0, 4: 0 },
        };

  const legacyDifficultyValues = legacyDifficulty && !('multiplication' in (legacyDifficulty as any))
    ? Object.values(legacyDifficulty as Partial<Record<1 | 2 | 3 | 4, number>>).reduce(
        (sum, value) => sum + (value ?? 0),
        0
      )
    : 0;

  const normalizedOperation: UserStats['exercisesByOperation'] = {
    multiplication:
      parsed.exercisesByOperation?.multiplication ??
      (legacyDifficultyValues > 0
        ? legacyDifficultyValues
        : parsed.totalExercises ?? 0),
    division: parsed.exercisesByOperation?.division ?? 0,
  };

  return {
    userId: parsed.userId,
    totalExercises: parsed.totalExercises ?? normalizedOperation.multiplication + normalizedOperation.division,
    totalScore: parsed.totalScore ?? 0,
    exercisesByOperation: normalizedOperation,
    exercisesByDifficulty: normalizedDifficulty,
    lastUpdated: parsed.lastUpdated ?? Date.now(),
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
  const parsed = JSON.parse(stored) as Exercise[];
  return parsed.map((exercise) => ({
    ...exercise,
    operation: exercise.operation ?? 'multiplication',
  }));
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
