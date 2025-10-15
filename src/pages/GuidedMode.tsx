import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuidedExercise } from "@/components/GuidedExercise";
import { CompletionCelebration } from "@/components/CompletionCelebration";
import { getGuestStats, updateGuestStats, addGuestExercise } from "@/lib/storage";
import { saveExercise } from "@/lib/firestore";
import type { DifficultyLevel, Exercise } from "@shared/schema";
import { Calculator } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";

interface GuidedModeProps {
  user?: FirebaseUser | null;
}

export default function GuidedMode({ user }: GuidedModeProps) {
  const [num1, setNum1] = useState<string>("");
  const [num2, setNum2] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastErrors, setLastErrors] = useState(0);
  const [lastHints, setLastHints] = useState(0);

  const handleStart = () => {
    if (num1 && num2) {
      setStarted(true);
      setShowCelebration(false);
    }
  };

  const handleComplete = async (score: number, errors: number, hints: number) => {
    setLastScore(score);
    setLastErrors(errors);
    setLastHints(hints);
    setShowCelebration(true);

    // Determine difficulty based on numbers
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    let difficulty: DifficultyLevel = 1;
    if (n1 >= 100 || n2 >= 100) difficulty = 3;
    else if (n1 >= 10 && n2 >= 10) difficulty = 2;

    const exercise: Exercise = {
      id: Date.now().toString(),
      num1: n1,
      num2: n2,
      difficulty,
      mode: 'guided',
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
      stats.exercisesByDifficulty[difficulty]++;
      updateGuestStats(stats);
      addGuestExercise(exercise);
    }
  };

  const handleNewExercise = () => {
    setStarted(false);
    setShowCelebration(false);
    setNum1("");
    setNum2("");
  };

  const handleReset = () => {
    setStarted(false);
    setShowCelebration(false);
  };

  if (showCelebration) {
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    let difficulty: DifficultyLevel = 1;
    if (n1 >= 100 || n2 >= 100) difficulty = 3;
    else if (n1 >= 10 && n2 >= 10) difficulty = 2;

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

  if (started && num1 && num2) {
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    let difficulty: DifficultyLevel = 1;
    if (n1 >= 100 || n2 >= 100) difficulty = 3;
    else if (n1 >= 10 && n2 >= 10) difficulty = 2;

    return (
      <GuidedExercise
        num1={n1}
        num2={n2}
        difficulty={difficulty}
        onComplete={handleComplete}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          Esercizi Guidati
        </h1>
        <p className="text-lg text-slate-600">
          Inserisci due numeri e ti guiderò passo dopo passo!
        </p>
      </div>

      <Card className="w-full border-2 border-slate-300">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="num1" className="text-lg font-semibold">
                Primo numero (moltiplicando)
              </Label>
              <Input
                id="num1"
                type="number"
                inputMode="numeric"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="Es: 147"
                className="text-2xl h-14 text-center font-mono"
                data-testid="input-num1"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
                <span className="text-2xl text-sky-600 font-bold">×</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num2" className="text-lg font-semibold">
                Secondo numero (moltiplicatore)
              </Label>
              <Input
                id="num2"
                type="number"
                inputMode="numeric"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="Es: 25"
                className="text-2xl h-14 text-center font-mono"
                data-testid="input-num2"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!num1 || !num2}
              size="lg"
              className="w-full mt-4"
              data-testid="button-start-guided"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Inizia Esercizio
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-slate-600 text-center max-w-md">
        Ti guiderò attraverso ogni passaggio della moltiplicazione in colonna,
        aiutandoti a calcolare i riporti e i prodotti parziali!
      </div>
    </div>
  );
}
