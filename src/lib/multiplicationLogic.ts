import type { DifficultyLevel, MultiplicationState, StepValidation, StepType } from "@shared/schema";

export function initializeMultiplication(num1: number, num2: number): MultiplicationState {
  const num1Digits = String(num1).split('').map(Number).reverse();
  const num2Digits = String(num2).split('').map(Number).reverse();

  return {
    num1,
    num2,
    num1Digits,
    num2Digits,
    currentMultiplierIndex: 0,
    currentMultiplicandIndex: 0,
    currentCarry: 0,
    partialProducts: [],
    currentPartialProduct: [],
    userInputs: [],
    carries: [],
    hints: 0,
    errors: 0,
    isComplete: false,
    phase: 'multiplication',
    additionColumnIndex: 0,
    additionCarry: 0,
    finalResultDigits: [],
  };
}

function getAdditionColumnCount(state: MultiplicationState): number {
  if (state.partialProducts.length === 0) return 0;

  return state.partialProducts.reduce((maxColumns, partial, idx) => {
    const columns = partial.length + idx;
    return Math.max(maxColumns, columns);
  }, 0);
}

function calculateAdditionColumnTotal(state: MultiplicationState) {
  const columnIndex = state.additionColumnIndex;
  const sumFromCarry = state.additionCarry;

  const columnSum = state.partialProducts.reduce((total, partial, rowIdx) => {
    const digitIndex = columnIndex - rowIdx;
    if (digitIndex >= 0 && digitIndex < partial.length) {
      return total + partial[digitIndex];
    }
    return total;
  }, sumFromCarry);

  const digit = columnSum % 10;
  const carry = Math.floor(columnSum / 10);

  return {
    sum: columnSum,
    digit,
    carry,
  };
}

export function calculateExpectedValue(
  state: MultiplicationState,
  stepType: StepType
): number {
  const { num1Digits, num2Digits, currentMultiplierIndex, currentMultiplicandIndex, currentCarry } = state;

  if (stepType === 'multiply' || stepType === 'partial') {
    const multiplier = num2Digits[currentMultiplierIndex];
    const multiplicand = num1Digits[currentMultiplicandIndex];
    const product = multiplier * multiplicand + currentCarry;
    return product % 10; // only the units digit
  }

  if (stepType === 'carry') {
    const multiplier = num2Digits[currentMultiplierIndex];
    const multiplicand = num1Digits[currentMultiplicandIndex];
    const product = multiplier * multiplicand + currentCarry;
    return Math.floor(product / 10); // carry value
  }

  if (stepType === 'sum') {
    const { digit } = calculateAdditionColumnTotal(state);
    return digit;
  }

  return 0;
}

export function validateStep(
  state: MultiplicationState,
  userValue: number,
  stepType: StepType
): StepValidation {
  let expectedValue = calculateExpectedValue(state, stepType);
  let expectedCarry: number | null = null;
  let expectedDigit: number | null = null;
  let isCorrect = userValue === expectedValue;

  if (stepType === 'multiply' || stepType === 'partial') {
    const multiplier = state.num2Digits[state.currentMultiplierIndex];
    const multiplicand = state.num1Digits[state.currentMultiplicandIndex];
    const product = multiplier * multiplicand + state.currentCarry;
    expectedDigit = product % 10;
    expectedCarry = Math.floor(product / 10);
    expectedValue = product;
    isCorrect = userValue === expectedValue || userValue === expectedDigit;
  }

  if (stepType === 'sum') {
    const { sum, digit, carry } = calculateAdditionColumnTotal(state);
    expectedDigit = digit;
    expectedCarry = carry;
    expectedValue = sum;
    isCorrect = userValue === expectedValue || userValue === expectedDigit;
  }

  return {
    isCorrect,
    expectedValue,
    actualValue: userValue,
    stepType,
    expectedCarry: expectedCarry ?? undefined,
    expectedDigit: expectedDigit ?? undefined,
  };
}

export function getHintMessage(
  state: MultiplicationState,
  hintLevel: 1 | 2 | 3,
  stepType: StepType
): string {
  const { num1Digits, num2Digits, currentMultiplierIndex, currentMultiplicandIndex, currentCarry } = state;
  const multiplier = num2Digits[currentMultiplierIndex];
  const multiplicand = num1Digits[currentMultiplicandIndex];

  if (stepType === 'multiply' || stepType === 'partial') {
    if (hintLevel === 1) {
      return "Riprova! Controlla bene l'operazione";
    }
    if (hintLevel === 2) {
      return `Devi moltiplicare ${multiplier} × ${multiplicand}${currentCarry > 0 ? ` e aggiungere il riporto ${currentCarry}` : ''}`;
    }
    if (hintLevel === 3) {
      const result = multiplier * multiplicand + currentCarry;
      const carry = Math.floor(result / 10);
      if (carry > 0) {
        return `${multiplier} × ${multiplicand}${currentCarry > 0 ? ` + ${currentCarry}` : ''} = ${result}. Scrivi ${result} e porta ${carry} alla colonna successiva.`;
      }
      return `${multiplier} × ${multiplicand}${currentCarry > 0 ? ` + ${currentCarry}` : ''} = ${result}. Scrivi ${result}.`;
    }
  }

  if (stepType === 'carry') {
    if (hintLevel === 1) {
      return "Controlla il riporto!";
    }
    if (hintLevel === 2) {
      const product = multiplier * multiplicand + currentCarry;
      return `Il risultato è ${product}, quindi il riporto è...?`;
    }
    if (hintLevel === 3) {
      const product = multiplier * multiplicand + currentCarry;
      const carry = Math.floor(product / 10);
      return `Il riporto è ${carry} (le decine di ${product})`;
    }
  }

  if (stepType === 'sum') {
    const { sum, digit, carry } = calculateAdditionColumnTotal(state);
    const columnIndex = state.additionColumnIndex;
    const positionLabels = ['unità', 'decine', 'centinaia', 'migliaia'];
    const position = positionLabels[columnIndex] ?? `colonna ${columnIndex + 1}`;
    const digitsToSum = state.partialProducts
      .map((partial, idx) => {
        const digitIndex = columnIndex - idx;
        if (digitIndex >= 0 && digitIndex < partial.length) {
          return partial[digitIndex];
        }
        return null;
      })
      .filter((value): value is number => value !== null);
    const additions = [
      ...digitsToSum.map(String),
      ...(state.additionCarry > 0 ? [String(state.additionCarry)] : []),
    ];

    if (hintLevel === 1) {
      return `Osserva bene la colonna delle ${position} e somma tutte le cifre evidenziate.`;
    }
    if (hintLevel === 2) {
      return `Somma le cifre evidenziate${state.additionCarry > 0 ? ` e aggiungi il riporto ${state.additionCarry}` : ''}. Qual è il risultato?`;
    }
    if (hintLevel === 3) {
      const sumExpression = additions.length > 0 ? `${additions.join(' + ')} = ${sum}` : `${sum}`;
      const carryText = carry > 0 ? `, quindi scrivi ${digit} e porta ${carry}` : `, quindi scrivi ${digit}`;
      return `${sumExpression}${carryText}.`;
    }
  }

  return "Riprova con attenzione!";
}

export function advanceStep(state: MultiplicationState, stepType: StepType): MultiplicationState {
  const newState = { ...state };

  if (stepType === 'sum') {
    newState.finalResultDigits = [...newState.finalResultDigits];
    const { digit, carry } = calculateAdditionColumnTotal(newState);
    newState.finalResultDigits[newState.additionColumnIndex] = digit;
    newState.additionColumnIndex += 1;
    newState.additionCarry = carry;

    const totalColumns = getAdditionColumnCount(newState);
    const isAdditionFinished =
      newState.additionColumnIndex >= totalColumns && newState.additionCarry === 0;

    if (isAdditionFinished) {
      newState.phase = 'complete';
      newState.isComplete = true;
    }

    return newState;
  }

  // Calculate the current product value and carry
  const multiplier = newState.num2Digits[newState.currentMultiplierIndex];
  const multiplicand = newState.num1Digits[newState.currentMultiplicandIndex];
  const product = multiplier * multiplicand + newState.currentCarry;
  const digit = product % 10;
  const carry = Math.floor(product / 10);

  // Add digit to current partial product
  newState.currentPartialProduct.push(digit);

  // Move to next multiplicand
  newState.currentMultiplicandIndex++;
  newState.currentCarry = carry;

  // Check if we finished this partial product
  if (newState.currentMultiplicandIndex >= newState.num1Digits.length) {
    // Add any remaining carry
    if (newState.currentCarry > 0) {
      newState.currentPartialProduct.push(newState.currentCarry);
    }

    // Save the partial product
    newState.partialProducts.push([...newState.currentPartialProduct]);

    // Reset for next multiplier
    newState.currentPartialProduct = [];
    newState.currentMultiplicandIndex = 0;
    newState.currentCarry = 0;
    newState.currentMultiplierIndex++;

    // Check if we're done with all partial products
    if (newState.currentMultiplierIndex >= newState.num2Digits.length) {
      if (newState.num2Digits.length > 1) {
        newState.phase = 'addition';
        newState.additionColumnIndex = 0;
        newState.additionCarry = 0;
      } else {
        newState.phase = 'complete';
        newState.isComplete = true;
      }
    }
  }

  return newState;
}

export function calculateFinalResult(partialProducts: number[][]): number {
  let result = 0;
  partialProducts.forEach((partial, index) => {
    const multiplier = Math.pow(10, index);
    const partialValue = partial.reduce((sum, digit, pos) => {
      return sum + digit * Math.pow(10, pos);
    }, 0);
    result += partialValue * multiplier;
  });
  return result;
}

export function generateRandomExercise(difficulty: DifficultyLevel): { num1: number; num2: number } {
  let num1: number;
  let num2: number;

  if (difficulty === 1) {
    // 1 digit × 1 digit or 2 digits × 1 digit
    num1 = Math.floor(Math.random() * 90) + 10; // 10-99
    num2 = Math.floor(Math.random() * 9) + 1; // 1-9
  } else if (difficulty === 2) {
    // 2 digits × 2 digits
    num1 = Math.floor(Math.random() * 90) + 10; // 10-99
    num2 = Math.floor(Math.random() * 90) + 10; // 10-99
  } else if (difficulty === 3) {
    // 3 digits × 2 digits
    num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    num2 = Math.floor(Math.random() * 90) + 10; // 10-99
  } else {
    // 3 digits × 3 digits
    num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    num2 = Math.floor(Math.random() * 900) + 100; // 100-999
  }

  return { num1, num2 };
}

export function calculateScore(difficulty: DifficultyLevel, errors: number, hints: number): number {
  const baseScore = difficulty * 100; // 100, 200, 300 o 400
  const errorPenalty = errors * 10;
  const hintPenalty = hints * 5;
  return Math.max(10, baseScore - errorPenalty - hintPenalty);
}
