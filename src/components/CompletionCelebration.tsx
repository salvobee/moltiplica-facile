import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, RotateCcw } from "lucide-react";
import type { DifficultyLevel } from "@shared/schema";

interface CompletionCelebrationProps {
  score: number;
  difficulty: DifficultyLevel;
  errors: number;
  hints: number;
  onNewExercise: () => void;
}

export function CompletionCelebration({ score, difficulty, errors, hints, onNewExercise }: CompletionCelebrationProps) {
  useEffect(() => {
    // Create confetti effect
    const colors = ['#3b82f6', '#fbbf24', '#10b981', '#8b5cf6'];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 50);
    }
  }, []);

  const getMessage = () => {
    if (score >= 350) return "Incredibile! Sei un maestro delle operazioni in colonna!";
    if (score >= 250) return "Fantastico! Sei un campione delle operazioni!";
    if (score >= 150) return "Ottimo lavoro! Continua così!";
    return "Ben fatto! Continua a esercitarti!";
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <Card className="w-full border-2 border-emerald-300 bg-emerald-50">
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-emerald-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-center text-emerald-600">
            {getMessage()}
          </h2>

          <div className="flex items-center gap-3">
            <Star className="w-12 h-12 text-amber-400 fill-amber-400" />
            <span className="text-5xl sm:text-6xl font-bold text-slate-800" data-testid="text-score">
              {score}
            </span>
            <span className="text-2xl text-slate-600">punti</span>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-md mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-sky-600">{difficulty}</div>
              <div className="text-sm text-slate-600 text-center">Difficoltà</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-rose-500">{errors}</div>
              <div className="text-sm text-slate-600 text-center">Errori</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-amber-500">{hints}</div>
              <div className="text-sm text-slate-600 text-center">Suggerimenti</div>
            </div>
          </div>

          <Button
            onClick={onNewExercise}
            size="lg"
            className="w-full max-w-xs mt-4"
            data-testid="button-new-exercise"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Nuova Operazione
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
