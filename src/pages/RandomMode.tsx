import { useState } from "react";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GuidedExercise } from "@/components/GuidedExercise";
import { CompletionCelebration } from "@/components/CompletionCelebration";
import { DivisionExercise } from "@/components/DivisionExercise";
import { generateRandomExercise } from "@/lib/multiplicationLogic";
import type { DifficultyLevel, Exercise, OperationType } from "@shared/schema";
import type { User as FirebaseUser } from "firebase/auth";
import { Button } from "@/components/ui/button";

interface RandomModeProps {
  user?: FirebaseUser | null;
}

export default function RandomMode({ user }: RandomModeProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [operation, setOperation] = useState<OperationType>('multiplication');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [started, setStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastErrors, setLastErrors] = useState(0);
  const [lastHints, setLastHints] = useState(0);

  const handleOperationSelect = (value: OperationType) => {
    setOperation(value);
    setDifficulty(null);
    setStarted(false);
    setShowCelebration(false);
  };

  const handleDifficultySelect = (level: DifficultyLevel) => {
    setDifficulty(level);
    const exercise = generateRandomExercise(operation, level);
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
      operation,
      mode: 'random',
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
        stats.exercisesByOperation[operation] =
          (stats.exercisesByOperation[operation] ?? 0) + 1;
        stats.exercisesByDifficulty[operation][difficulty] =
          (stats.exercisesByDifficulty[operation][difficulty] ?? 0) + 1;
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
        operation={operation}
        errors={lastErrors}
        hints={lastHints}
        onNewExercise={handleNewExercise}
      />
    );
  }

  if (started && difficulty) {
    if (operation === 'division') {
      return (
        <DivisionExercise
          dividend={num1}
          divisor={num2}
          difficulty={difficulty}
          onComplete={handleComplete}
          onReset={handleReset}
        />
      );
    }

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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          Esercizi a Caso
        </h1>
        <p className="text-lg text-slate-600">
          Allenati con moltiplicazioni e divisioni scegliendo operazione e livello di difficoltà!
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {(
          [
            {
              value: 'multiplication' as OperationType,
              label: 'Moltiplicazioni',
              symbol: '×',
              description: 'Prodotti in colonna',
            },
            {
              value: 'division' as OperationType,
              label: 'Divisioni',
              symbol: '÷',
              description: 'Divisioni con quoziente e resto',
            },
          ] satisfies {
            value: OperationType;
            label: string;
            symbol: string;
            description: string;
          }[]
        ).map((option) => (
          <Button
            key={option.value}
            variant={operation === option.value ? 'default' : 'outline'}
            onClick={() => handleOperationSelect(option.value)}
            className="gap-3 px-4 py-6 h-auto"
            data-testid={`button-operation-${option.value}`}
          >
            <span className="text-3xl font-bold text-sky-600">{option.symbol}</span>
            <span className="flex flex-col items-start">
              <span className="text-base font-semibold text-slate-800">{option.label}</span>
              <span className="text-xs text-slate-500">{option.description}</span>
            </span>
          </Button>
        ))}
      </div>

      <DifficultySelector onSelect={handleDifficultySelect} operation={operation} />

      <div className="text-sm text-slate-600 text-center max-w-md mt-4">
        Completa esercizi casuali di {operation === 'division' ? 'divisione' : 'moltiplicazione'} per guadagnare punti e salire nella classifica!
      </div>
    </div>
  );
}
