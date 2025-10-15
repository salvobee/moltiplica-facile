import type {
  DifficultyLevel,
  DivisionState,
  DivisionStepType,
  DivisionStepValidation,
} from "@shared/schema";

function normalizePositiveInteger(value: number): number {
  const intValue = Math.floor(Math.abs(value));
  return intValue;
}

function ensureValidDivisor(divisor: number): number {
  const normalized = Math.max(1, normalizePositiveInteger(divisor));
  return normalized === 0 ? 1 : normalized;
}

function prepareInitialPartial(dividendDigits: number[], divisor: number) {
  let index = 0;
  let partial = 0;

  while (index < dividendDigits.length && partial < divisor) {
    partial = partial * 10 + dividendDigits[index];
    index++;
  }

  if (partial === 0 && dividendDigits.length > 0) {
    partial = dividendDigits[0];
    index = 1;
  }

  return { partial, index };
}

export function initializeDivision(dividend: number, divisor: number): DivisionState {
  const normalizedDividend = normalizePositiveInteger(dividend);
  const normalizedDivisor = ensureValidDivisor(divisor);
  const dividendDigits = String(normalizedDividend)
    .split("")
    .map((digit) => Number(digit));

  const { partial, index } = prepareInitialPartial(dividendDigits, normalizedDivisor);

  return {
    dividend: normalizedDividend,
    divisor: normalizedDivisor,
    dividendDigits,
    quotientDigits: Array(dividendDigits.length).fill(null),
    currentDigitIndex: index,
    currentQuotientIndex: 0,
    currentPartialDividend: partial,
    remainder: 0,
    pendingQuotientDigit: null,
    pendingProduct: null,
    subtractionSteps: [],
    hints: 0,
    errors: 0,
    isComplete: false,
    phase: 'quotient',
  };
}

export function calculateDivisionExpectedValue(
  state: DivisionState,
  stepType: DivisionStepType
): number {
  if (stepType === 'quotient') {
    if (state.divisor === 0) {
      return 0;
    }
    return Math.floor(state.currentPartialDividend / state.divisor);
  }

  const product = state.pendingProduct ?? state.divisor * (state.pendingQuotientDigit ?? 0);
  const remainder = state.currentPartialDividend - product;
  return remainder;
}

export function validateDivisionStep(
  state: DivisionState,
  userValue: number,
  stepType: DivisionStepType
): DivisionStepValidation {
  const expectedValue = calculateDivisionExpectedValue(state, stepType);
  const isCorrect = userValue === expectedValue;

  if (stepType === 'quotient') {
    const product = expectedValue * state.divisor;
    return {
      isCorrect,
      expectedValue,
      actualValue: userValue,
      stepType,
      expectedQuotient: expectedValue,
      expectedProduct: product,
    };
  }

  return {
    isCorrect,
    expectedValue,
    actualValue: userValue,
    stepType,
    expectedQuotient: state.pendingQuotientDigit ?? undefined,
    expectedProduct: state.pendingProduct ?? undefined,
  };
}

export function advanceDivisionStep(
  state: DivisionState,
  stepType: DivisionStepType,
  userValue: number
): DivisionState {
  const newState: DivisionState = {
    ...state,
    quotientDigits: [...state.quotientDigits],
    subtractionSteps: [...state.subtractionSteps],
  };

  if (stepType === 'quotient') {
    newState.pendingQuotientDigit = userValue;
    newState.pendingProduct = userValue * newState.divisor;
    newState.quotientDigits[newState.currentQuotientIndex] = userValue;
    newState.phase = 'remainder';
    return newState;
  }

  const quotientDigit = newState.pendingQuotientDigit ?? 0;
  const product = newState.pendingProduct ?? quotientDigit * newState.divisor;
  const remainder = userValue;

  let broughtDownDigit: number | null = null;
  let resultAfterBringDown: number | null = null;
  let nextPartialDividend = remainder;
  let nextDigitIndex = newState.currentDigitIndex;

  if (newState.currentDigitIndex < newState.dividendDigits.length) {
    broughtDownDigit = newState.dividendDigits[newState.currentDigitIndex];
    nextPartialDividend = remainder * 10 + broughtDownDigit;
    resultAfterBringDown = nextPartialDividend;
    nextDigitIndex += 1;
  }

  newState.subtractionSteps.push({
    quotientDigit,
    partialDividend: newState.currentPartialDividend,
    product,
    remainder,
    broughtDownDigit,
    resultAfterBringDown,
  });

  newState.currentQuotientIndex += 1;
  newState.currentDigitIndex = nextDigitIndex;
  newState.currentPartialDividend = nextPartialDividend;
  newState.pendingQuotientDigit = null;
  newState.pendingProduct = null;
  newState.remainder = remainder;

  if (nextDigitIndex >= newState.dividendDigits.length && nextPartialDividend < newState.divisor) {
    newState.phase = 'complete';
    newState.isComplete = true;
    return newState;
  }

  if (nextDigitIndex >= newState.dividendDigits.length && nextPartialDividend >= newState.divisor) {
    newState.phase = 'quotient';
    return newState;
  }

  newState.phase = 'quotient';
  return newState;
}

export function getDivisionHint(
  state: DivisionState,
  hintLevel: 1 | 2 | 3,
  stepType: DivisionStepType
): string {
  if (stepType === 'quotient') {
    if (hintLevel === 1) {
      return "Osserva il dividendo parziale e prova a dividere.";
    }
    if (hintLevel === 2) {
      return `Quante volte il ${state.divisor} sta in ${state.currentPartialDividend}?`;
    }
    const tentative = Math.floor(state.currentPartialDividend / state.divisor);
    return `${state.currentPartialDividend} ÷ ${state.divisor} = ${tentative}. Scrivi ${tentative} nel quoziente.`;
  }

  const product = state.pendingProduct ?? (state.pendingQuotientDigit ?? 0) * state.divisor;
  if (hintLevel === 1) {
    return "Calcola il resto sottraendo il prodotto dal dividendo parziale.";
  }
  if (hintLevel === 2) {
    return `Sottrai ${product} da ${state.currentPartialDividend} per trovare il resto.`;
  }
  const remainder = state.currentPartialDividend - product;
  return `${state.currentPartialDividend} - ${product} = ${remainder}. Questo è il resto da scrivere.`;
}

export function calculateDivisionResult(state: DivisionState): number {
  const digits = state.quotientDigits.filter((digit) => digit !== null) as number[];
  if (digits.length === 0) {
    return 0;
  }
  return Number(digits.join(""));
}

export function calculateDivisionScore(
  difficulty: DifficultyLevel,
  errors: number,
  hints: number
): number {
  const baseScore = difficulty * 100;
  const errorPenalty = errors * 10;
  const hintPenalty = hints * 5;
  return Math.max(10, baseScore - errorPenalty - hintPenalty);
}

export function generateRandomDivisionExercise(difficulty: DifficultyLevel): {
  dividend: number;
  divisor: number;
} {
  let dividend = 0;
  let divisor = 0;

  if (difficulty === 1) {
    divisor = Math.floor(Math.random() * 8) + 2; // 2-9
    dividend = Math.floor(Math.random() * 90) + 10; // 10-99
  } else if (difficulty === 2) {
    divisor = Math.floor(Math.random() * 90) + 10; // 10-99
    dividend = Math.floor(Math.random() * 900) + 100; // 100-999
  } else if (difficulty === 3) {
    divisor = Math.floor(Math.random() * 90) + 10; // 10-99
    dividend = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  } else {
    divisor = Math.floor(Math.random() * 900) + 100; // 100-999
    dividend = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
  }

  if (dividend < divisor) {
    dividend = divisor * 2;
  }

  return { dividend, divisor };
}
