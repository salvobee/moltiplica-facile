import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiplicationDisplay } from "./MultiplicationDisplay";
import { NumberInput } from "./NumberInput";
import { HintCard } from "./HintCard";
import { 
  initializeMultiplication, 
  validateStep, 
  getHintMessage, 
  advanceStep,
  calculateFinalResult,
  calculateScore
} from "@/lib/multiplicationLogic";
import type { MultiplicationState, StepType, DifficultyLevel } from "@shared/schema";
import { ArrowRight, HelpCircle, RotateCcw } from "lucide-react";

interface GuidedExerciseProps {
  num1: number;
  num2: number;
  difficulty: DifficultyLevel;
  onComplete: (score: number, errors: number, hints: number) => void;
  onReset?: () => void;
}

export function GuidedExercise({ num1, num2, difficulty, onComplete, onReset }: GuidedExerciseProps) {
  const [state, setState] = useState<MultiplicationState>(() => initializeMultiplication(num1, num2));
  const [currentInput, setCurrentInput] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3 | null>(null);
  const [hintMessage, setHintMessage] = useState<string>("");
  const [showFinal, setShowFinal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current step type
  const getCurrentStepType = (): StepType => {
    if (state.phase === 'addition' || state.phase === 'complete') {
      return 'sum';
    }
    return 'multiply';
  };

  const currentStepType = getCurrentStepType();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (currentInput === null) {
      inputRef.current?.focus();
      return;
    }

    const validation = validateStep(state, currentInput, currentStepType);

    if (validation.isCorrect) {
      setIsCorrect(true);
      setIsError(false);
      setHintLevel(null);
      setHintMessage("");

      // Advance to next step after a brief delay
      setTimeout(() => {
        const newState = advanceStep(state, currentStepType);
        setState(newState);
        setCurrentInput(null);
        setIsCorrect(false);
        inputRef.current?.focus();

        // Check if exercise is complete
        if (newState.isComplete) {
          const score = calculateScore(difficulty, newState.errors, newState.hints);
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
    const nextLevel = ((hintLevel || 0) + 1) as 1 | 2 | 3;
    if (nextLevel <= 3) {
      setHintLevel(nextLevel);
      const message = getHintMessage(state, nextLevel, currentStepType);
      setHintMessage(message);
      
      const newState = { ...state, hints: state.hints + 1 };
      setState(newState);
    }
  };

  const getInstructionText = (): ReactNode => {
    if (currentStepType === 'sum') {
      const columnLabels = ['unità', 'decine', 'centinaia', 'migliaia'];
      const columnIndex = state.additionColumnIndex;
      const label = columnLabels[columnIndex] ?? `colonna ${columnIndex + 1}`;
      return (
        <>
          Somma in colonna i prodotti parziali nelle {label}
          {state.additionCarry > 0 && (
            <>
              ,{' '}
              <span className="text-rose-500 font-semibold">
                aggiungendo il riporto di {state.additionCarry}
              </span>
            </>
          )}
          .
        </>
      );
    }
    const multiplier = state.num2Digits[state.currentMultiplierIndex];
    const multiplicand = state.num1Digits[state.currentMultiplicandIndex];
    return (
      <>
        Moltiplica {multiplier} × {multiplicand}
        {state.currentCarry > 0 && (
          <>
            ,{' '}
            <span className="text-rose-500 font-semibold">
              aggiungendo il riporto di {state.currentCarry}
            </span>
          </>
        )}
        , scrivendo il risultato completo.
      </>
    );
  };

  const instructionText = getInstructionText();

  if (showFinal) {
    const finalResult = calculateFinalResult(state.partialProducts);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-emerald-600 mb-4">Complimenti!</h2>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-slate-800">
            {num1} × {num2} = {finalResult}
          </p>
        </div>
        <MultiplicationDisplay state={state} showPartialProducts={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4">
      {/* Stats Bar */}
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

      {/* Multiplication Display */}
      <MultiplicationDisplay state={state} showPartialProducts={true} />

      {/* Current Step Card */}
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
                disabled={currentInput === null}
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
                disabled={hintLevel === 3}
                data-testid="button-hint"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Suggerimento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Hint Display */}
      {hintMessage && hintLevel && (
        <HintCard message={hintMessage} type="hint" level={hintLevel} />
      )}
    </div>
  );
}
