import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp,
  type Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserStats, Exercise, LeaderboardEntry } from "@shared/schema";

// User stats collection
const USERS_COLLECTION = "users";
const EXERCISES_COLLECTION = "exercises";

// Save or update user stats
export async function saveUserStats(userId: string, stats: UserStats): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  await setDoc(userRef, {
    ...stats,
    userId,
    lastUpdated: serverTimestamp(),
  }, { merge: true });
}

// Get user stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const data = userSnap.data();
  return {
    userId,
    totalExercises: data.totalExercises || 0,
    totalScore: data.totalScore || 0,
    exercisesByDifficulty: data.exercisesByDifficulty || { 1: 0, 2: 0, 3: 0 },
    lastUpdated: (data.lastUpdated as Timestamp)?.toMillis() || Date.now(),
  };
}

// Save exercise
export async function saveExercise(userId: string, exercise: Exercise): Promise<void> {
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
      exercisesByDifficulty: {
        1: exercise.difficulty === 1 ? 1 : 0,
        2: exercise.difficulty === 2 ? 1 : 0,
        3: exercise.difficulty === 3 ? 1 : 0,
      },
      lastUpdated: serverTimestamp(),
    });
  } else {
    // Update stats
    const currentStats = userSnap.data();
    const currentDifficultyCounts = currentStats.exercisesByDifficulty || { 1: 0, 2: 0, 3: 0 };
    const newDifficultyCount = {
        ...currentDifficultyCounts,
        [exercise.difficulty]: (currentDifficultyCounts[exercise.difficulty] || 0) + 1,
    };
    
    await updateDoc(userRef, {
      totalExercises: increment(1),
      totalScore: increment(exercise.score || 0),
      exercisesByDifficulty: newDifficultyCount,
      lastUpdated: serverTimestamp(),
    });
  }
}

// Get user exercises
export async function getUserExercises(userId: string, limitCount: number = 50): Promise<Exercise[]> {
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
      exercisesByDifficulty: {
        1: cloudStats.exercisesByDifficulty[1] + localStats.exercisesByDifficulty[1],
        2: cloudStats.exercisesByDifficulty[2] + localStats.exercisesByDifficulty[2],
        3: cloudStats.exercisesByDifficulty[3] + localStats.exercisesByDifficulty[3],
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
  const userRef = doc(db, USERS_COLLECTION, userId);

  await setDoc(userRef, {
    displayName,
    photoURL,
    // classCode,
    lastUpdated: serverTimestamp(),
  }, { merge: true });
}
