import type { MultiplicationState, StepValidation, StepType } from "@shared/schema";

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
    // Calculate sum of partial products at current position
    const position = currentMultiplicandIndex;
    let sum = 0;
    state.partialProducts.forEach((partial, index) => {
      if (partial[position] !== undefined) {
        sum += partial[position];
      }
    });
    return sum % 10;
  }

  return 0;
}

export function validateStep(
  state: MultiplicationState,
  userValue: number,
  stepType: StepType
): StepValidation {
  const expectedValue = calculateExpectedValue(state, stepType);
  const isCorrect = userValue === expectedValue;

  return {
    isCorrect,
    expectedValue,
    actualValue: userValue,
    stepType,
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
      return `${multiplier} × ${multiplicand}${currentCarry > 0 ? ` + ${currentCarry}` : ''} = ${result}. Scrivi ${result % 10}`;
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

  return "Riprova con attenzione!";
}

export function advanceStep(state: MultiplicationState): MultiplicationState {
  const newState = { ...state };
  
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
      newState.isComplete = true;
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

export function generateRandomExercise(difficulty: 1 | 2 | 3): { num1: number; num2: number } {
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
  } else {
    // 3 digits × 2 digits
    num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    num2 = Math.floor(Math.random() * 90) + 10; // 10-99
  }

  return { num1, num2 };
}

export function calculateScore(difficulty: 1 | 2 | 3, errors: number, hints: number): number {
  const baseScore = difficulty * 100; // 100, 200, or 300
  const errorPenalty = errors * 10;
  const hintPenalty = hints * 5;
  return Math.max(10, baseScore - errorPenalty - hintPenalty);
}
