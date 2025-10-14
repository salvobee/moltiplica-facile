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
    if (score >= 250) return "Fantastico! Sei un campione!";
    if (score >= 150) return "Ottimo lavoro! Continua così!";
    return "Ben fatto! Continua a esercitarti!";
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <Card className="w-full border-2 border-success bg-success/5">
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-success" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-center text-success">
            {getMessage()}
          </h2>

          <div className="flex items-center gap-3">
            <Star className="w-12 h-12 text-accent fill-accent" />
            <span className="text-5xl sm:text-6xl font-bold text-foreground" data-testid="text-score">
              {score}
            </span>
            <span className="text-2xl text-muted-foreground">punti</span>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-md mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-primary">{difficulty}</div>
              <div className="text-sm text-muted-foreground text-center">Difficoltà</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-destructive">{errors}</div>
              <div className="text-sm text-muted-foreground text-center">Errori</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-accent">{hints}</div>
              <div className="text-sm text-muted-foreground text-center">Suggerimenti</div>
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
