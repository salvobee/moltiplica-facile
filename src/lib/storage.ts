import {
  STORAGE_KEYS,
  type UserStats,
  type Exercise,
  userStatsSchema,
  exerciseSchema,
  createDefaultUserStats,
} from "@shared/schema";

function normalizeStats(stats: unknown): UserStats {
  try {
    return userStatsSchema.parse(stats);
  } catch (error) {
    console.warn("Unable to parse stored stats, resetting to defaults", error);
    return createDefaultUserStats();
  }
}

function normalizeExercise(data: unknown): Exercise | null {
  try {
    return exerciseSchema.parse(data);
  } catch (error) {
    console.warn("Unable to parse stored exercise, skipping", error);
    return null;
  }
}

export function getGuestStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.GUEST_STATS);
  if (!stored) {
    return createDefaultUserStats();
  }
  const parsed = JSON.parse(stored);
  return normalizeStats(parsed);
}

export function updateGuestStats(stats: UserStats): void {
  const normalized = normalizeStats(stats);
  const statsToStore: UserStats = {
    ...normalized,
    exercisesByOperation: {
      multiplication: {
        ...normalized.exercisesByOperation.multiplication,
      },
      division: {
        ...normalized.exercisesByOperation.division,
      },
    },
    exercisesByDifficulty: { ...normalized.exercisesByDifficulty },
    lastUpdated: Date.now(),
  };

  localStorage.setItem(STORAGE_KEYS.GUEST_STATS, JSON.stringify(statsToStore));
}

export function getGuestExercises(): Exercise[] {
  const stored = localStorage.getItem(STORAGE_KEYS.GUEST_EXERCISES);
  if (!stored) return [];
  const parsed = JSON.parse(stored) as unknown[];
  return parsed
    .map((item) => normalizeExercise(item))
    .filter((exercise): exercise is Exercise => exercise !== null);
}

export function addGuestExercise(exercise: Exercise): void {
  const exercises = getGuestExercises();
  const normalizedExercise = normalizeExercise(exercise) ?? exercise;
  exercises.push({
    ...normalizedExercise,
    operation: normalizedExercise.operation ?? 'multiplication',
  });
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
  return normalizeExercise(JSON.parse(stored));
}

export function saveCurrentExercise(exercise: Exercise | null): void {
  if (exercise) {
    const normalized = normalizeExercise(exercise) ?? exercise;
    localStorage.setItem(STORAGE_KEYS.CURRENT_EXERCISE, JSON.stringify(normalized));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EXERCISE);
  }
}
