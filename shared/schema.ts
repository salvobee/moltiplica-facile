import { z } from "zod";

// Difficulty levels for exercises
export type DifficultyLevel = 1 | 2 | 3;

// Step types in the multiplication process
export type StepType = 
  | 'multiply' // Multiplying a single digit
  | 'carry' // Entering a carry value
  | 'partial' // Partial product digit
  | 'sum'; // Final sum step

// Exercise data structure
export const exerciseSchema = z.object({
  id: z.string(),
  num1: z.number().int().positive(),
  num2: z.number().int().positive(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  mode: z.enum(['guided', 'random']),
  startedAt: z.number(), // timestamp
  completedAt: z.number().optional(),
  score: z.number().int().min(0).optional(),
  errorCount: z.number().int().min(0).default(0),
});

export type Exercise = z.infer<typeof exerciseSchema>;

// User progress and stats
export const userStatsSchema = z.object({
  userId: z.string().optional(), // undefined for guest mode
  totalExercises: z.number().int().min(0).default(0),
  totalScore: z.number().int().min(0).default(0),
  exercisesByDifficulty: z.object({
    1: z.number().int().min(0).default(0),
    2: z.number().int().min(0).default(0),
    3: z.number().int().min(0).default(0),
  }).default({ 1: 0, 2: 0, 3: 0 }),
  lastUpdated: z.number(), // timestamp
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Leaderboard entry
export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  totalScore: z.number().int().min(0),
  totalExercises: z.number().int().min(0),
  averageScore: z.number().min(0),
  rank: z.number().int().positive(),
  classCode: z.string().optional(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// Current multiplication state during solving
export interface MultiplicationState {
  num1: number;
  num2: number;
  num1Digits: number[];
  num2Digits: number[];
  currentMultiplierIndex: number; // which digit of num2 we're working on
  currentMultiplicandIndex: number; // which digit of num1 we're multiplying
  currentCarry: number;
  partialProducts: number[][]; // array of partial product arrays
  currentPartialProduct: number[]; // current partial product being built
  userInputs: (number | null)[]; // user's inputs for current step
  carries: (number | null)[]; // carry values entered by user
  hints: number; // number of hints used
  errors: number; // number of errors made
  isComplete: boolean;
}

// Step validation result
export interface StepValidation {
  isCorrect: boolean;
  expectedValue: number;
  actualValue: number | null;
  stepType: StepType;
  hintLevel?: 1 | 2 | 3; // progressive hint levels
  hintMessage?: string;
  expectedCarry?: number;
  expectedDigit?: number;
}

// Firebase user data structure
export const firebaseUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  provider: z.enum(['google', 'apple']),
  createdAt: z.number(),
  classCode: z.string().optional(),
});

export type FirebaseUser = z.infer<typeof firebaseUserSchema>;

// Local storage keys
export const STORAGE_KEYS = {
  GUEST_STATS: 'moltiplicazioni_guest_stats',
  GUEST_EXERCISES: 'moltiplicazioni_guest_exercises',
  CURRENT_EXERCISE: 'moltiplicazioni_current_exercise',
  USER_PREFERENCES: 'moltiplicazioni_preferences',
} as const;
