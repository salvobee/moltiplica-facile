import { useState } from "react";
import { DifficultySelector } from "@/components/DifficultySelector";
import { DivisionExercise } from "@/components/DivisionExercise";
import { CompletionCelebration } from "@/components/CompletionCelebration";
import { generateRandomDivisionExercise } from "@/lib/divisionLogic";
import type { DifficultyLevel, Exercise } from "@shared/schema";
import type { User as FirebaseUser } from "firebase/auth";

interface DivisionRandomModeProps {
  user?: FirebaseUser | null;
}

export default function DivisionRandomMode({ user }: DivisionRandomModeProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [dividend, setDividend] = useState(0);
  const [divisor, setDivisor] = useState(1);
  const [started, setStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastErrors, setLastErrors] = useState(0);
  const [lastHints, setLastHints] = useState(0);

  const handleDifficultySelect = (level: DifficultyLevel) => {
    setDifficulty(level);
    const exercise = generateRandomDivisionExercise(level);
    setDividend(exercise.dividend);
    setDivisor(exercise.divisor);
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
      num1: dividend,
      num2: divisor,
      difficulty: difficulty!,
      mode: 'random',
      operation: 'division',
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
      score,
      errorCount: errors,
    };

    if (user) {
      const { saveExercise } = await import("@/lib/firestore");
      await saveExercise(user.uid, exercise);
    } else {
      const { getGuestStats, updateGuestStats, addGuestExercise } = await import("@/lib/storage");
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
      <DivisionExercise
        dividend={dividend}
        divisor={divisor}
        difficulty={difficulty}
        onComplete={handleComplete}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          Divisioni Casuali
        </h1>
        <p className="text-lg text-slate-600">
          Scegli il livello di difficoltà e affronta nuove divisioni in colonna!
        </p>
      </div>

      <DifficultySelector onSelect={handleDifficultySelect} />

      <div className="text-sm text-slate-600 text-center max-w-md mt-4">
        Risolvi divisioni casuali per allenarti con quozienti e resti sempre diversi!
      </div>
    </div>
  );
}
