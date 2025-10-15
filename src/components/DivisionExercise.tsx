import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/NumberInput";
import { HintCard } from "@/components/HintCard";
import { DivisionDisplay } from "@/components/DivisionDisplay";
import {
  initializeDivision,
  validateDivisionStep,
  advanceDivisionStep,
  getDivisionHint,
  calculateDivisionResult,
  calculateDivisionScore,
} from "@/lib/divisionLogic";
import type { DivisionState, DivisionStepType, DifficultyLevel } from "@shared/schema";
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
  const [state, setState] = useState<DivisionState>(() => initializeDivision(dividend, divisor));
  const [currentInput, setCurrentInput] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3 | null>(null);
  const [hintMessage, setHintMessage] = useState<string>("");
  const [showFinal, setShowFinal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentStepType = (): DivisionStepType => {
    if (state.phase === 'remainder') {
      return 'remainder';
    }
    return 'quotient';
  };

  const currentStepType = getCurrentStepType();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (state.phase === 'complete') {
      return;
    }

    if (currentInput === null) {
      inputRef.current?.focus();
      return;
    }

    const validation = validateDivisionStep(state, currentInput, currentStepType);

    if (validation.isCorrect) {
      setIsCorrect(true);
      setIsError(false);
      setHintLevel(null);
      setHintMessage("");

      setTimeout(() => {
        const newState = advanceDivisionStep(state, currentStepType, currentInput);
        setState(newState);
        setCurrentInput(null);
        setIsCorrect(false);
        inputRef.current?.focus();

        if (newState.isComplete) {
          const score = calculateDivisionScore(difficulty, newState.errors, newState.hints);
          setShowFinal(true);
          setTimeout(() => {
            onComplete(score, newState.errors, newState.hints);
          }, 5000);
        }
      }, 800);
    } else {
      setIsError(true);
      const newState = { ...state, errors: state.errors + 1 };
      setState(newState);

      setTimeout(() => {
        setIsError(false);
        setCurrentInput(null);
        inputRef.current?.focus();
      }, 400);
    }

    inputRef.current?.focus();
  };

  const handleHint = () => {
    if (state.phase === 'complete') {
      return;
    }
    const nextLevel = ((hintLevel || 0) + 1) as 1 | 2 | 3;
    if (nextLevel <= 3) {
      setHintLevel(nextLevel);
      const message = getDivisionHint(state, nextLevel, currentStepType);
      setHintMessage(message);

      const newState = { ...state, hints: state.hints + 1 };
      setState(newState);
    }
  };

  const getInstructionText = (): ReactNode => {
    if (state.phase === 'remainder') {
      const product =
        state.pendingProduct ?? (state.pendingQuotientDigit ?? 0) * state.divisor;
      return (
        <>
          Calcola il resto: sottrai{' '}
          <span className="font-semibold text-slate-800">{product}</span>
          {' '}da{' '}
          <span className="font-semibold text-slate-800">{state.currentPartialDividend}</span>.
        </>
      );
    }

    return (
      <>
        Quante volte il numero{' '}
        <span className="font-semibold text-slate-800">{state.divisor}</span>
        {' '}sta in{' '}
        <span className="font-semibold text-slate-800">{state.currentPartialDividend}</span>?
        {' '}Inserisci la cifra del quoziente.
      </>
    );
  };

  const instructionText = getInstructionText();

  useEffect(() => {
    setState(initializeDivision(dividend, divisor));
    setCurrentInput(null);
    setIsCorrect(false);
    setIsError(false);
    setHintLevel(null);
    setHintMessage("");
    setShowFinal(false);
  }, [dividend, divisor]);

  if (showFinal) {
    const quotient = calculateDivisionResult(state);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-emerald-600 mb-4">Complimenti!</h2>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-slate-800">
            {dividend} ÷ {divisor} = {quotient} con resto {state.remainder}
          </p>
        </div>
        <DivisionDisplay state={state} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4">
          <div className="text-sm font-medium text-slate-600">
            Errori: <span className="text-rose-500 font-bold">{state.errors}</span>
          </div>
          <div className="text-sm font-medium text-slate-600">
            Suggerimenti: <span className="text-amber-500 font-bold">{state.hints}</span>
          </div>
        </div>
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} data-testid="button-reset">
            <RotateCcw className="w-4 h-4 mr-2" />
            Ricomincia
          </Button>
        )}
      </div>

      <DivisionDisplay state={state} />

      <Card className="border-2 border-sky-400">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-center text-sky-600 font-bold">
            {instructionText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <NumberInput
                ref={inputRef}
                value={currentInput}
                onChange={setCurrentInput}
                isCorrect={isCorrect}
                isError={isError}
                size="lg"
                autoFocus
                data-testid="input-current-step"
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                type="submit"
                disabled={currentInput === null || state.phase === 'complete'}
                size="lg"
                className="min-w-32"
                data-testid="button-submit"
              >
                Conferma
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={handleHint}
                variant="outline"
                size="lg"
                disabled={hintLevel === 3 || state.phase === 'complete'}
                data-testid="button-hint"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Suggerimento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hintMessage && hintLevel && (
        <HintCard message={hintMessage} type="hint" level={hintLevel} />
      )}
    </div>
  );
}
