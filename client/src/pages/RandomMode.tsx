import { useState } from "react";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GuidedExercise } from "@/components/GuidedExercise";
import { CompletionCelebration } from "@/components/CompletionCelebration";
import { generateRandomExercise } from "@/lib/multiplicationLogic";
import { getGuestStats, updateGuestStats, addGuestExercise } from "@/lib/storage";
import { saveExercise } from "@/lib/firestore";
import type { DifficultyLevel, Exercise } from "@shared/schema";
import type { User as FirebaseUser } from "firebase/auth";

interface RandomModeProps {
  user?: FirebaseUser | null;
}

export default function RandomMode({ user }: RandomModeProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [started, setStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastErrors, setLastErrors] = useState(0);
  const [lastHints, setLastHints] = useState(0);

  const handleDifficultySelect = (level: DifficultyLevel) => {
    setDifficulty(level);
    const exercise = generateRandomExercise(level);
    setNum1(exercise.num1);
    setNum2(exercise.num2);
    setStarted(true);
    setShowCelebration(false);
  };

  const handleComplete = async (score: number, errors: number, hints: number) => {
    setLastScore(score);
    setLastErrors(errors);
    setLastHints(hints);
    setShowCelebration(true);

    const exercise: Exercise = {
      id: Date.now().toString(),
      num1,
      num2,
      difficulty: difficulty!,
      mode: 'random',
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
      score,
      errorCount: errors,
    };

    if (user) {
      // Save to Firestore for authenticated users
      await saveExercise(user.uid, exercise);
    } else {
      // Save locally for guest users
      const stats = getGuestStats();
      stats.totalExercises++;
      stats.totalScore += score;
      if (difficulty) {
        stats.exercisesByDifficulty[difficulty]++;
      }
      updateGuestStats(stats);
      addGuestExercise(exercise);
    }
  };

  const handleNewExercise = () => {
    setStarted(false);
    setShowCelebration(false);
    setDifficulty(null);
  };

  const handleReset = () => {
    setStarted(false);
    setShowCelebration(false);
    setDifficulty(null);
  };

  if (showCelebration && difficulty) {
    return (
      <CompletionCelebration
        score={lastScore}
        difficulty={difficulty}
        errors={lastErrors}
        hints={lastHints}
        onNewExercise={handleNewExercise}
      />
    );
  }

  if (started && difficulty) {
    return (
      <GuidedExercise
        num1={num1}
        num2={num2}
        difficulty={difficulty}
        onComplete={handleComplete}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Esercizi a Caso
        </h1>
        <p className="text-lg text-muted-foreground">
          Scegli il livello di difficoltà e sfida te stesso!
        </p>
      </div>

      <DifficultySelector onSelect={handleDifficultySelect} />

      <div className="text-sm text-muted-foreground text-center max-w-md mt-4">
        Completa esercizi casuali per guadagnare punti e salire nella classifica!
      </div>
    </div>
  );
}
