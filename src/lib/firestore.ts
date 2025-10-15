import type { Timestamp } from "firebase/firestore";
import {
  userStatsSchema,
  exerciseSchema,
  sumDifficultyCounts,
  type UserStats,
  type Exercise,
  type LeaderboardEntry,
} from "@shared/schema";
import { getFirestoreClient } from "./firebase";

type FirestoreModule = typeof import("firebase/firestore");

let firestoreModulePromise: Promise<FirestoreModule> | null = null;

async function loadFirestoreModule(): Promise<FirestoreModule> {
  if (!firestoreModulePromise) {
    firestoreModulePromise = import("firebase/firestore");
  }
  return firestoreModulePromise;
}

// User stats collection
const USERS_COLLECTION = "users";
const EXERCISES_COLLECTION = "exercises";

// Save or update user stats
export async function saveUserStats(userId: string, stats: UserStats): Promise<void> {
  const [db, { doc, setDoc, serverTimestamp }] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const userRef = doc(db, USERS_COLLECTION, userId);

  const normalizedStats = userStatsSchema.parse({
    ...stats,
    userId,
  });

  const { lastUpdated: _ignored, ...rest } = normalizedStats;

  await setDoc(userRef, {
    ...rest,
    userId,
    lastUpdated: serverTimestamp(),
  }, { merge: true });
}

// Get user stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const [db, { doc, getDoc }] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const data = userSnap.data();
  const lastUpdatedValue = (data.lastUpdated as Timestamp | number | undefined);
  const normalized = userStatsSchema.parse({
    ...data,
    userId,
    lastUpdated:
      typeof lastUpdatedValue === 'number'
        ? lastUpdatedValue
        : lastUpdatedValue?.toMillis() ?? Date.now(),
  });

  return normalized;
}

// Save exercise
export async function saveExercise(userId: string, exercise: Exercise): Promise<void> {
  const [db, firestore] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const { doc, setDoc, serverTimestamp, increment } = firestore;
  const exerciseRef = doc(db, EXERCISES_COLLECTION, exercise.id);

  const normalizedExercise = exerciseSchema.parse(exercise);

  await setDoc(exerciseRef, {
    ...normalizedExercise,
    userId,
    createdAt: serverTimestamp(),
  });

  // Update user stats atomically
  const userRef = doc(db, USERS_COLLECTION, userId);
  const operationKey = normalizedExercise.operation;
  const difficultyKey = normalizedExercise.difficulty;
  const scoreIncrement = normalizedExercise.score ?? 0;

  await setDoc(userRef, {
    userId,
    totalExercises: increment(1),
    totalScore: increment(scoreIncrement),
    [`exercisesByOperation.${operationKey}.${difficultyKey}`]: increment(1),
    [`exercisesByDifficulty.${difficultyKey}`]: increment(1),
    lastUpdated: serverTimestamp(),
  }, { merge: true });
}

// Get user exercises
export async function getUserExercises(userId: string, limitCount: number = 50): Promise<Exercise[]> {
  const [db, firestore] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const { collection, query, where, orderBy, limit, getDocs } = firestore;
  const q = query(
    collection(db, EXERCISES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const exercises: Exercise[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    exercises.push({
      id: doc.id,
      num1: data.num1,
      num2: data.num2,
      difficulty: data.difficulty,
      mode: data.mode,
      operation: data.operation ?? 'multiplication',
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      score: data.score,
      errorCount: data.errorCount,
    });
  });
  
  return exercises;
}

// Get leaderboard (top users by score)
export async function getLeaderboard(limitCount: number = 20, classCode?: string): Promise<LeaderboardEntry[]> {
  const [db, firestore] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const { collection, query, where, orderBy, limit, getDocs } = firestore;
  let q = query(
    collection(db, USERS_COLLECTION),
    orderBy("totalScore", "desc"),
    limit(limitCount)
  );
  
  if (classCode) {
    q = query(
      collection(db, USERS_COLLECTION),
      where("classCode", "==", classCode),
      orderBy("totalScore", "desc"),
      limit(limitCount)
    );
  }
  
  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];
  let rank = 1;
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const averageScore = data.totalExercises > 0 
      ? Math.round(data.totalScore / data.totalExercises) 
      : 0;
    
    leaderboard.push({
      userId: doc.id,
      displayName: data.displayName || "Utente Anonimo",
      photoURL: data.photoURL,
      totalScore: data.totalScore || 0,
      totalExercises: data.totalExercises || 0,
      averageScore,
      rank: rank++,
      classCode: data.classCode,
    });
  });
  
  return leaderboard;
}

// Sync local data to cloud when user signs in
export async function syncLocalDataToCloud(userId: string, localStats: UserStats, localExercises: Exercise[]): Promise<void> {
  // Get existing cloud stats
  const cloudStats = await getUserStats(userId);
  
  if (!cloudStats) {
    // No cloud data, save local data
    await saveUserStats(userId, localStats);
    
    // Save exercises
    for (const exercise of localExercises) {
      await saveExercise(userId, exercise);
    }
  } else {
    // Merge stats
    const mergedStats: UserStats = {
      userId,
      totalExercises: cloudStats.totalExercises + localStats.totalExercises,
      totalScore: cloudStats.totalScore + localStats.totalScore,
      exercisesByOperation: {
        multiplication: sumDifficultyCounts(
          cloudStats.exercisesByOperation.multiplication,
          localStats.exercisesByOperation.multiplication
        ),
        division: sumDifficultyCounts(
          cloudStats.exercisesByOperation.division,
          localStats.exercisesByOperation.division
        ),
      },
      exercisesByDifficulty: sumDifficultyCounts(
        cloudStats.exercisesByOperation.multiplication,
        cloudStats.exercisesByOperation.division,
        localStats.exercisesByOperation.multiplication,
        localStats.exercisesByOperation.division
      ),
      lastUpdated: Date.now(),
    };

    await saveUserStats(userId, mergedStats);

    // Save new exercises
    for (const exercise of localExercises) {
      await saveExercise(userId, exercise);
    }
  }
}

// Update user profile info
export async function updateUserProfile(
  userId: string,
  displayName: string,
  photoURL?: string,
  classCode?: string
): Promise<void> {
  const [db, { doc, setDoc, serverTimestamp }] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const userRef = doc(db, USERS_COLLECTION, userId);

  await setDoc(userRef, {
    displayName,
    photoURL,
    // classCode,
    lastUpdated: serverTimestamp(),
  }, { merge: true });
}
