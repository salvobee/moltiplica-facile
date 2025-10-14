import type { ReactNode } from "react";
import { MultiplicationState } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MultiplicationDisplayProps {
  state: MultiplicationState;
  showPartialProducts?: boolean;
}

export function MultiplicationDisplay({ state, showPartialProducts = true }: MultiplicationDisplayProps) {
  const { num1Digits, num2Digits, partialProducts, currentPartialProduct } = state;

  const isAdditionPhase = state.phase === 'addition';
  const isCompletePhase = state.phase === 'complete';
  const activeAdditionColumn = isAdditionPhase ? state.additionColumnIndex : null;

  // Reverse digits for display (we store them reversed for easier calculation)
  const num1Display = [...num1Digits].reverse();
  const num2Display = [...num2Digits].reverse();

  const showCarryRow =
    state.currentCarry > 0 && state.currentMultiplicandIndex < state.num1Digits.length;

  const carryIndicators = showCarryRow
    ? num1Display.map((_, idx) => {
        const targetIndex = num1Display.length - 1 - state.currentMultiplicandIndex;
        if (idx === targetIndex) {
          return state.currentCarry.toString();
        }
        return '';
      })
    : [];

  const hasActiveMultiplicationStep =
    state.phase === 'multiplication' && state.currentMultiplierIndex < state.num2Digits.length;

  const activeMultiplicandDisplayIndex =
    hasActiveMultiplicationStep && state.currentMultiplicandIndex < state.num1Digits.length
      ? num1Display.length - 1 - state.currentMultiplicandIndex
      : null;

  const activeMultiplierDisplayIndex =
    hasActiveMultiplicationStep && state.currentMultiplierIndex < state.num2Digits.length
      ? num2Display.length - 1 - state.currentMultiplierIndex
      : null;

  type PartialRow = {
    digits: number[];
    shift: number;
    renderIndex: number;
    isPreview: boolean;
  };

  const partialRows: PartialRow[] = showPartialProducts
    ? state.partialProducts.map((partial, idx) => ({
        digits: partial,
        shift: idx,
        renderIndex: idx,
        isPreview: false,
      }))
    : [];

  if (
    showPartialProducts &&
    currentPartialProduct.length > 0 &&
    state.currentMultiplierIndex < state.num2Digits.length
  ) {
    partialRows.push({
      digits: currentPartialProduct,
      shift: state.currentMultiplierIndex,
      renderIndex: state.currentMultiplierIndex,
      isPreview: true,
    });
  }

  const additionColumnCount = state.partialProducts.length
    ? state.partialProducts.reduce((max, partial, idx) => {
        const columns = partial.length + idx;
        return Math.max(max, columns);
      }, 0)
    : 0;

  const computedFinalDigits = (() => {
    if (state.finalResultDigits.length > 0) {
      return state.finalResultDigits;
    }
    if (isCompletePhase) {
      const productValue = state.num1 * state.num2;
      return String(productValue)
        .split('')
        .map(Number)
        .reverse();
    }
    return [];
  })();

  const totalDigitColumns = Math.max(
    num1Display.length,
    num2Display.length,
    carryIndicators.length,
    ...partialRows.map((row) => row.digits.length + row.shift),
    computedFinalDigits.length,
    additionColumnCount,
    state.additionColumnIndex + (state.additionCarry > 0 ? 1 : 0)
  );

  const totalColumns = totalDigitColumns + 1; // extra column for the × / = symbols

  const createDigitCells = <T,>(
    values: T[],
    {
      shift = 0,
      getContent = (value: T) => value as ReactNode,
      getTestId,
      activeIndex,
      activeClassName,
      placeholder,
    }: {
      shift?: number;
      getContent?: (value: T, idx: number) => ReactNode;
      getTestId?: (idx: number) => string | undefined;
      activeIndex?: number | null;
      activeClassName?: string;
      placeholder?: ReactNode;
    }
  ) => {
    const totalLength = values.length + shift;
    const startIndex = totalDigitColumns - totalLength;

    return Array.from({ length: totalDigitColumns }, (_, colIdx) => {
      const cellIndex = colIdx - startIndex;
      const withinDigits = cellIndex >= 0 && cellIndex < values.length;
      const withinShift = !withinDigits && colIdx >= totalDigitColumns - shift;

      let content: ReactNode = placeholder ?? <span className="opacity-0">0</span>;
      let className = "";
      let testId: string | undefined;

      if (withinDigits) {
        const digitIdx = cellIndex;
        content = getContent(values[digitIdx], digitIdx);
        testId = getTestId?.(digitIdx);
        if (activeIndex === digitIdx && activeClassName) {
          className = activeClassName;
        }
      } else if (withinShift) {
        content = <span className="text-muted-foreground/50">0</span>;
      }

      return (
        <td
          key={`col-${colIdx}`}
          className={cn(
            "w-9 sm:w-11 md:w-12 h-12 sm:h-14 md:h-16 text-center align-bottom font-mono",
            className
          )}
          data-testid={testId}
        >
          {content}
        </td>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-card border-2 border-card-border rounded-lg">
      <table className="w-full table-fixed">
        <tbody>
          {showCarryRow && (
            <tr className="text-lg sm:text-xl md:text-2xl text-primary font-semibold">
              {createDigitCells(carryIndicators, {
                placeholder: <span className="opacity-0">0</span>,
              })}
              <td className="w-9 sm:w-11 md:w-12" />
            </tr>
          )}

          <tr className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            {createDigitCells(num1Display, {
              getContent: (digit) => digit,
              getTestId: (idx) => `num1-digit-${idx}`,
              activeIndex: activeMultiplicandDisplayIndex,
              activeClassName:
                "bg-primary/15 text-primary rounded-lg border border-primary/60 shadow-sm font-extrabold",
              placeholder: <span />,
            })}
            <td className="w-9 sm:w-11 md:w-12 text-center text-primary align-bottom">×</td>
          </tr>

          <tr className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            {createDigitCells(num2Display, {
              getContent: (digit) => digit,
              getTestId: (idx) => `num2-digit-${idx}`,
              activeIndex: activeMultiplierDisplayIndex,
              activeClassName:
                "bg-primary/15 text-primary rounded-lg border border-primary/60 shadow-sm font-extrabold",
              placeholder: <span />,
            })}
            <td className="w-9 sm:w-11 md:w-12 text-center text-primary align-bottom">=</td>
          </tr>

          <tr>
            <td colSpan={totalColumns} className="pt-1 pb-2">
              <div className="w-full border-t-2 border-foreground" />
            </td>
          </tr>

          {showPartialProducts &&
            partialRows.map((row, rowIdx) => {
              const partialDisplay = [...row.digits].reverse();
              const additionHighlightIndex =
                activeAdditionColumn !== null
                  ? (() => {
                      const digitIndex = activeAdditionColumn - row.shift;
                      if (digitIndex >= 0 && digitIndex < row.digits.length) {
                        return partialDisplay.length - 1 - digitIndex;
                      }
                      return null;
                    })()
                  : null;
              const isLastActualRow =
                !row.isPreview && state.partialProducts.length > 1 && row.renderIndex === state.partialProducts.length - 1;
              const symbol = isLastActualRow ? '+' : '';

              return (
                <tr
                  key={`${row.isPreview ? "preview" : "partial"}-${rowIdx}`}
                  className={cn(
                    "text-3xl sm:text-4xl md:text-5xl font-medium",
                    row.isPreview ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {createDigitCells(partialDisplay, {
                    shift: row.shift,
                    getContent: (digit) => digit,
                    getTestId: (idx) =>
                      row.isPreview
                        ? `partial-preview-digit-${idx}`
                        : `partial-${row.renderIndex}-digit-${idx}`,
                    placeholder: <span />,
                    activeIndex: additionHighlightIndex ?? undefined,
                    activeClassName:
                      additionHighlightIndex !== null
                        ? "bg-accent/20 text-foreground rounded-lg border border-accent shadow-sm"
                        : undefined,
                  })}
                  <td className="w-9 sm:w-11 md:w-12 text-center text-primary align-bottom font-semibold">
                    {symbol}
                  </td>
                </tr>
              );
            })}

          {showPartialProducts && state.partialProducts.length > 1 && (
            <tr>
              <td colSpan={totalColumns} className="pt-1">
                <div className="w-full border-t-2 border-foreground" />
              </td>
            </tr>
          )}

          {(isAdditionPhase || isCompletePhase || computedFinalDigits.length > 0) && (
            <tr className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              {createDigitCells(
                Array.from({ length: totalDigitColumns }, (_, colIdx) => {
                  const digitIndex = totalDigitColumns - 1 - colIdx;
                  return computedFinalDigits[digitIndex] ?? null;
                }),
                {
                  getContent: (value) => (value !== null && value !== undefined ? value : <span />),
                  placeholder: <span />,
                  activeIndex:
                    activeAdditionColumn !== null && activeAdditionColumn < totalDigitColumns
                      ? totalDigitColumns - 1 - activeAdditionColumn
                      : undefined,
                  activeClassName:
                    activeAdditionColumn !== null && activeAdditionColumn < totalDigitColumns
                      ? "bg-accent/20 text-foreground rounded-lg border border-accent shadow-sm"
                      : undefined,
                }
              )}
              <td className="w-9 sm:w-11 md:w-12 text-center text-primary align-bottom font-semibold">=</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
