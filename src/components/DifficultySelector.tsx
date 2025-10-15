import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DifficultyLevel } from "@shared/schema";

interface DifficultySelectorProps {
  onSelect: (difficulty: DifficultyLevel) => void;
  disabled?: boolean;
}

export function DifficultySelector({ onSelect, disabled }: DifficultySelectorProps) {
  const difficulties: { level: DifficultyLevel; label: string; description: string; example: string }[] = [
    { level: 1, label: "Facile", description: "2 cifre × 1 cifra", example: "23 × 5" },
    { level: 2, label: "Medio", description: "2 cifre × 2 cifre", example: "47 × 25" },
    { level: 3, label: "Difficile", description: "3 cifre × 2 cifre", example: "147 × 25" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
      {difficulties.map((diff) => (
        <Card
          key={diff.level}
          className={cn(
            "border-2 transition-all cursor-pointer",
            "hover:border-sky-500 hover:shadow-lg hover:-translate-y-0.5"
          )}
        >
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-sky-600">{diff.level}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{diff.label}</h3>
            <p className="text-sm text-slate-600 text-center">{diff.description}</p>
            <p className="text-lg font-mono font-semibold text-slate-800">{diff.example}</p>
            <Button
              onClick={() => onSelect(diff.level)}
              disabled={disabled}
              className="w-full mt-2"
              data-testid={`button-difficulty-${diff.level}`}
            >
              Inizia
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
