import { useMemo, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateDivisionScore } from "@/lib/multiplicationLogic";
import type { DifficultyLevel } from "@shared/schema";
import { ArrowRight, HelpCircle, RotateCcw } from "lucide-react";

interface DivisionExerciseProps {
  dividend: number;
  divisor: number;
  difficulty: DifficultyLevel;
  onComplete: (score: number, errors: number, hints: number) => void;
  onReset?: () => void;
}

export function DivisionExercise({
  dividend,
  divisor,
  difficulty,
  onComplete,
  onReset,
}: DivisionExerciseProps) {
  const expectedQuotient = useMemo(() => Math.floor(dividend / divisor), [dividend, divisor]);
  const expectedRemainder = useMemo(() => dividend % divisor, [dividend, divisor]);

  const [quotient, setQuotient] = useState("");
  const [remainder, setRemainder] = useState(expectedRemainder ? "" : "0");
  const [errors, setErrors] = useState(0);
  const [hints, setHints] = useState(0);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [hintMessage, setHintMessage] = useState<string>("");

  const isRemainderNeeded = expectedRemainder !== 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userQuotient = Number.parseInt(quotient, 10);
    const userRemainder = Number.parseInt(remainder || "0", 10);

    const isQuotientValid = Number.isFinite(userQuotient) && userQuotient === expectedQuotient;
    const isRemainderValid = Number.isFinite(userRemainder) && userRemainder === expectedRemainder;

    if (isQuotientValid && isRemainderValid) {
      setFeedback("success");
      const score = calculateDivisionScore(difficulty, errors, hints);

      setTimeout(() => {
        onComplete(score, errors, hints);
      }, 600);
    } else {
      setFeedback("error");
      setErrors((prev) => prev + 1);
    }
  };

  const handleHint = () => {
    setHints((prev) => {
      const next = Math.min(prev + 1, 3);
      let message = "Riprova con attenzione!";

      if (next === 1) {
        message = `Quante volte ${divisor} entra in ${dividend}?`;
      } else if (next === 2) {
        message = `${dividend} = ${divisor} × ${expectedQuotient}${
          expectedRemainder ? ` + ${expectedRemainder}` : ""
        }.`;
      } else {
        message = `Il quoziente è ${expectedQuotient}${
          expectedRemainder ? ` e il resto è ${expectedRemainder}` : " senza resto"
        }.`;
      }

      setHintMessage(message);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4 text-sm font-medium text-slate-600">
          <span>
            Errori: <span className="text-rose-500 font-bold">{errors}</span>
          </span>
          <span>
            Suggerimenti: <span className="text-amber-500 font-bold">{hints}</span>
          </span>
        </div>
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} data-testid="button-reset">
            <RotateCcw className="w-4 h-4 mr-2" />
            Ricomincia
          </Button>
        )}
      </div>

      <Card className="border-2 border-sky-400">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-center text-sky-600 font-bold">
            Risolvi la divisione in colonna
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-mono font-bold text-slate-800">
              {dividend} ÷ {divisor}
            </span>
            <p className="text-sm text-slate-600 text-center max-w-md">
              Inserisci il quoziente finale{isRemainderNeeded ? " e il resto" : ""}. Usa i suggerimenti se hai bisogno di aiuto!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              <div className="flex flex-col gap-2 items-center">
                <label htmlFor="quotient" className="text-sm font-semibold text-slate-700">
                  Quoziente
                </label>
                <Input
                  id="quotient"
                  value={quotient}
                  onChange={(event) => setQuotient(event.target.value)}
                  inputMode="numeric"
                  className="text-2xl h-14 text-center font-mono"
                  placeholder="Es: 24"
                  required
                  data-testid="input-quotient"
                />
              </div>

              <div className="flex flex-col gap-2 items-center">
                <label htmlFor="remainder" className="text-sm font-semibold text-slate-700">
                  Resto
                </label>
                <Input
                  id="remainder"
                  value={remainder}
                  onChange={(event) => setRemainder(event.target.value)}
                  inputMode="numeric"
                  className="text-2xl h-14 text-center font-mono"
                  placeholder="0"
                  required
                  data-testid="input-remainder"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" size="lg" className="gap-2" data-testid="button-submit-division">
                <ArrowRight className="w-4 h-4" />
                Verifica Risultato
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleHint}
                disabled={hints >= 3}
                data-testid="button-hint-division"
              >
                <HelpCircle className="w-4 h-4" />
                Suggerimento
              </Button>
            </div>

            {feedback === "success" && (
              <p className="text-emerald-600 font-semibold">Perfetto! Hai risolto correttamente la divisione.</p>
            )}
            {feedback === "error" && (
              <p className="text-rose-500 font-semibold">
                Il risultato non è corretto. Controlla quoziente e resto e riprova.
              </p>
            )}
            {hintMessage && (
              <p className="text-sm text-amber-600 text-center max-w-md">{hintMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

