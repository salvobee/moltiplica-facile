import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DivisionExercise } from "@/components/DivisionExercise";
import { CompletionCelebration } from "@/components/CompletionCelebration";
import type { DifficultyLevel, Exercise } from "@shared/schema";
import { DivideSquare } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";

interface DivisionGuidedModeProps {
  user?: FirebaseUser | null;
}

export default function DivisionGuidedMode({ user }: DivisionGuidedModeProps) {
  const [dividend, setDividend] = useState<string>("");
  const [divisor, setDivisor] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastErrors, setLastErrors] = useState(0);
  const [lastHints, setLastHints] = useState(0);

  const determineDifficulty = (d: number, v: number): DifficultyLevel => {
    const digitsDividend = Math.max(String(Math.abs(d)).length, 1);
    const digitsDivisor = Math.max(String(Math.abs(v)).length, 1);

    if (digitsDividend >= 5 || digitsDivisor >= 3) return 4;
    if (digitsDividend >= 4 || digitsDivisor >= 2) return 3;
    if (digitsDividend >= 3) return 2;
    return 1;
  };

  const handleStart = () => {
    if (dividend && divisor) {
      setStarted(true);
      setShowCelebration(false);
    }
  };

  const handleComplete = async (score: number, errors: number, hints: number) => {
    setLastScore(score);
    setLastErrors(errors);
    setLastHints(hints);
    setShowCelebration(true);

    const dividendValue = parseInt(dividend);
    const divisorValue = Math.max(1, parseInt(divisor));
    const difficulty = determineDifficulty(dividendValue, divisorValue);

    const exercise: Exercise = {
      id: Date.now().toString(),
      num1: dividendValue,
      num2: divisorValue,
      difficulty,
      mode: 'guided',
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
      stats.exercisesByDifficulty[difficulty]++;
      updateGuestStats(stats);
      addGuestExercise(exercise);
    }
  };

  const handleNewExercise = () => {
    setStarted(false);
    setShowCelebration(false);
    setDividend("");
    setDivisor("");
  };

  const handleReset = () => {
    setStarted(false);
    setShowCelebration(false);
  };

  if (showCelebration) {
    const dividendValue = parseInt(dividend);
    const divisorValue = Math.max(1, parseInt(divisor));
    const difficulty = determineDifficulty(dividendValue, divisorValue);

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

  if (started && dividend && divisor) {
    const dividendValue = parseInt(dividend);
    const divisorValue = Math.max(1, parseInt(divisor));
    const difficulty = determineDifficulty(dividendValue, divisorValue);

    return (
      <DivisionExercise
        dividend={dividendValue}
        divisor={divisorValue}
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
          Divisioni Guidate
        </h1>
        <p className="text-lg text-slate-600">
          Inserisci dividendo e divisore e risolviamo la divisione passo dopo passo!
        </p>
      </div>

      <Card className="w-full border-2 border-slate-300">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="dividend" className="text-lg font-semibold">
                Dividendo
              </Label>
              <Input
                id="dividend"
                type="number"
                inputMode="numeric"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                placeholder="Es: 784"
                className="text-2xl h-14 text-center font-mono"
                data-testid="input-dividend"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
                <DivideSquare className="w-5 h-5 text-sky-600" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="divisor" className="text-lg font-semibold">
                Divisore
              </Label>
              <Input
                id="divisor"
                type="number"
                inputMode="numeric"
                min={1}
                value={divisor}
                onChange={(e) => setDivisor(e.target.value)}
                placeholder="Es: 24"
                className="text-2xl h-14 text-center font-mono"
                data-testid="input-divisor"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!dividend || !divisor}
              size="lg"
              className="w-full mt-4"
              data-testid="button-start-guided-division"
            >
              <DivideSquare className="w-5 h-5 mr-2" />
              Inizia Divisione
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-slate-600 text-center max-w-md">
        Ti guiderò attraverso ogni passaggio della divisione in colonna, tra quoziente, sottrazioni e resti!
      </div>
    </div>
  );
}
