import type { Timestamp } from "firebase/firestore";
import type { UserStats, Exercise, LeaderboardEntry } from "@shared/schema";
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

  await setDoc(userRef, {
    ...stats,
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
  const rawDifficulty = data.exercisesByDifficulty ?? {};

  const normalizedDifficulty: UserStats['exercisesByDifficulty'] = rawDifficulty.multiplication
    ? {
        multiplication: {
          1: rawDifficulty.multiplication?.[1] ?? 0,
          2: rawDifficulty.multiplication?.[2] ?? 0,
          3: rawDifficulty.multiplication?.[3] ?? 0,
          4: rawDifficulty.multiplication?.[4] ?? 0,
        },
        division: {
          1: rawDifficulty.division?.[1] ?? 0,
          2: rawDifficulty.division?.[2] ?? 0,
          3: rawDifficulty.division?.[3] ?? 0,
          4: rawDifficulty.division?.[4] ?? 0,
        },
      }
    : {
        multiplication: {
          1: rawDifficulty[1] ?? 0,
          2: rawDifficulty[2] ?? 0,
          3: rawDifficulty[3] ?? 0,
          4: rawDifficulty[4] ?? 0,
        },
        division: { 1: 0, 2: 0, 3: 0, 4: 0 },
      };

  const rawOperation = data.exercisesByOperation ?? {};
  const multiplicationTotal =
    rawOperation.multiplication ??
    Object.values(normalizedDifficulty.multiplication).reduce((sum, value) => sum + (value ?? 0), 0);
  const divisionTotal =
    rawOperation.division ??
    Object.values(normalizedDifficulty.division).reduce((sum, value) => sum + (value ?? 0), 0);

  return {
    userId,
    totalExercises: data.totalExercises ?? multiplicationTotal + divisionTotal,
    totalScore: data.totalScore || 0,
    exercisesByOperation: {
      multiplication: multiplicationTotal,
      division: divisionTotal,
    },
    exercisesByDifficulty: normalizedDifficulty,
    lastUpdated: (data.lastUpdated as Timestamp)?.toMillis() || Date.now(),
  };
}

// Save exercise
export async function saveExercise(userId: string, exercise: Exercise): Promise<void> {
  const [db, firestore] = await Promise.all([
    getFirestoreClient(),
    loadFirestoreModule(),
  ]);
  const { doc, setDoc, serverTimestamp, getDoc, updateDoc, increment } = firestore;
  const exerciseRef = doc(db, EXERCISES_COLLECTION, exercise.id);

  await setDoc(exerciseRef, {
    ...exercise,
    userId,
    createdAt: serverTimestamp(),
  });

  // Update user stats atomically
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create initial stats
    await setDoc(userRef, {
      userId,
      totalExercises: 1,
      totalScore: exercise.score || 0,
      exercisesByOperation: {
        multiplication: exercise.operation === 'multiplication' ? 1 : 0,
        division: exercise.operation === 'division' ? 1 : 0,
      },
      exercisesByDifficulty: {
        multiplication: {
          1: exercise.operation === 'multiplication' && exercise.difficulty === 1 ? 1 : 0,
          2: exercise.operation === 'multiplication' && exercise.difficulty === 2 ? 1 : 0,
          3: exercise.operation === 'multiplication' && exercise.difficulty === 3 ? 1 : 0,
          4: exercise.operation === 'multiplication' && exercise.difficulty === 4 ? 1 : 0,
        },
        division: {
          1: exercise.operation === 'division' && exercise.difficulty === 1 ? 1 : 0,
          2: exercise.operation === 'division' && exercise.difficulty === 2 ? 1 : 0,
          3: exercise.operation === 'division' && exercise.difficulty === 3 ? 1 : 0,
          4: exercise.operation === 'division' && exercise.difficulty === 4 ? 1 : 0,
        },
      },
      lastUpdated: serverTimestamp(),
    });
  } else {
    // Update stats
    const currentStats = userSnap.data();
    const rawDifficulty = currentStats.exercisesByDifficulty ?? {};
    const normalizedDifficulty: UserStats['exercisesByDifficulty'] = rawDifficulty.multiplication
      ? {
          multiplication: {
            1: rawDifficulty.multiplication?.[1] ?? 0,
            2: rawDifficulty.multiplication?.[2] ?? 0,
            3: rawDifficulty.multiplication?.[3] ?? 0,
            4: rawDifficulty.multiplication?.[4] ?? 0,
          },
          division: {
            1: rawDifficulty.division?.[1] ?? 0,
            2: rawDifficulty.division?.[2] ?? 0,
            3: rawDifficulty.division?.[3] ?? 0,
            4: rawDifficulty.division?.[4] ?? 0,
          },
        }
      : {
          multiplication: {
            1: rawDifficulty[1] ?? 0,
            2: rawDifficulty[2] ?? 0,
            3: rawDifficulty[3] ?? 0,
            4: rawDifficulty[4] ?? 0,
          },
          division: { 1: 0, 2: 0, 3: 0, 4: 0 },
        };

    const rawOperations = currentStats.exercisesByOperation ?? {
      multiplication: Object.values(normalizedDifficulty.multiplication).reduce(
        (sum, value) => sum + (value ?? 0),
        0
      ),
      division: Object.values(normalizedDifficulty.division).reduce(
        (sum, value) => sum + (value ?? 0),
        0
      ),
    };

    const operationKey = exercise.operation ?? 'multiplication';

    const updatedOperations = {
      multiplication: rawOperations.multiplication + (operationKey === 'multiplication' ? 1 : 0),
      division: rawOperations.division + (operationKey === 'division' ? 1 : 0),
    };

    const updatedDifficulty = {
      ...normalizedDifficulty,
      [operationKey]: {
        ...normalizedDifficulty[operationKey],
        [exercise.difficulty]: (normalizedDifficulty[operationKey][exercise.difficulty] ?? 0) + 1,
      },
    };

    await updateDoc(userRef, {
      totalExercises: increment(1),
      totalScore: increment(exercise.score || 0),
      exercisesByOperation: updatedOperations,
      exercisesByDifficulty: updatedDifficulty,
      lastUpdated: serverTimestamp(),
    });
  }
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
        multiplication:
          cloudStats.exercisesByOperation.multiplication +
          (localStats.exercisesByOperation?.multiplication ?? 0),
        division:
          cloudStats.exercisesByOperation.division +
          (localStats.exercisesByOperation?.division ?? 0),
      },
      exercisesByDifficulty: {
        multiplication: {
          1: cloudStats.exercisesByDifficulty.multiplication[1] +
            (localStats.exercisesByDifficulty.multiplication?.[1] ?? 0),
          2: cloudStats.exercisesByDifficulty.multiplication[2] +
            (localStats.exercisesByDifficulty.multiplication?.[2] ?? 0),
          3: cloudStats.exercisesByDifficulty.multiplication[3] +
            (localStats.exercisesByDifficulty.multiplication?.[3] ?? 0),
          4: cloudStats.exercisesByDifficulty.multiplication[4] +
            (localStats.exercisesByDifficulty.multiplication?.[4] ?? 0),
        },
        division: {
          1: cloudStats.exercisesByDifficulty.division[1] +
            (localStats.exercisesByDifficulty.division?.[1] ?? 0),
          2: cloudStats.exercisesByDifficulty.division[2] +
            (localStats.exercisesByDifficulty.division?.[2] ?? 0),
          3: cloudStats.exercisesByDifficulty.division[3] +
            (localStats.exercisesByDifficulty.division?.[3] ?? 0),
          4: cloudStats.exercisesByDifficulty.division[4] +
            (localStats.exercisesByDifficulty.division?.[4] ?? 0),
        },
      },
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
