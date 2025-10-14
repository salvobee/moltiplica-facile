import { MultiplicationState } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MultiplicationDisplayProps {
  state: MultiplicationState;
  showPartialProducts?: boolean;
}

export function MultiplicationDisplay({ state, showPartialProducts = true }: MultiplicationDisplayProps) {
  const { num1Digits, num2Digits, partialProducts, currentPartialProduct } = state;

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

  const hasActiveStep =
    !state.isComplete && state.currentMultiplierIndex < state.num2Digits.length;

  const activeMultiplicandDisplayIndex =
    hasActiveStep && state.currentMultiplicandIndex < state.num1Digits.length
      ? num1Display.length - 1 - state.currentMultiplicandIndex
      : null;

  const activeMultiplierDisplayIndex =
    hasActiveStep && state.currentMultiplierIndex < state.num2Digits.length
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

  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-card border-2 border-card-border rounded-lg">
      {/* Carry indicators */}
      {showCarryRow && (
        <div className="flex justify-end items-end gap-1 font-mono text-lg sm:text-xl md:text-2xl text-primary">
          {carryIndicators.map((carry, idx) => (
            <div key={`carry-${idx}`} className="w-12 sm:w-14 md:w-16 text-center min-h-[1.25rem]">
              {carry ? <sup className="font-semibold">{carry}</sup> : <span className="opacity-0">0</span>}
            </div>
          ))}
        </div>
      )}

      {/* Number 1 - aligned right */}
      <div className="flex justify-end items-center gap-1 font-mono text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
        {num1Display.map((digit, idx) => {
          const isActive = activeMultiplicandDisplayIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                "w-12 sm:w-14 md:w-16 text-center transition-all duration-200",
                isActive &&
                  "bg-primary/15 text-primary rounded-lg border border-primary/60 shadow-sm font-extrabold"
              )}
              data-testid={`num1-digit-${idx}`}
            >
              {digit}
            </div>
          );
        })}
      </div>

      {/* Multiplication sign and Number 2 */}
      <div className="flex justify-end items-center gap-1 font-mono text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
        <span className="w-12 sm:w-14 md:w-16 text-center text-primary">×</span>
        {num2Display.map((digit, idx) => {
          const isActive = activeMultiplierDisplayIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                "w-12 sm:w-14 md:w-16 text-center transition-all duration-200",
                isActive &&
                  "bg-primary/15 text-primary rounded-lg border border-primary/60 shadow-sm font-extrabold"
              )}
              data-testid={`num2-digit-${idx}`}
            >
              {digit}
            </div>
          );
        })}
      </div>

      {/* Separator line */}
      <div className="w-full border-t-2 border-foreground" />

      {/* Partial products */}
      {showPartialProducts && partialRows.length > 0 && (
        <div className="flex flex-col gap-1 w-full">
          {partialRows.map((row, rowIdx) => {
            const partialDisplay = [...row.digits].reverse();
            const leadingZeros = row.shift;

            return (
              <div
                key={`${row.isPreview ? 'preview' : 'partial'}-${rowIdx}`}
                className={cn(
                  "flex justify-end items-center gap-1 font-mono text-3xl sm:text-4xl md:text-5xl font-medium",
                  row.isPreview ? "text-primary" : "text-muted-foreground"
                )}
              >
                {partialDisplay.map((digit, digitIdx) => (
                  <div
                    key={digitIdx}
                    className="w-12 sm:w-14 md:w-16 text-center"
                    data-testid={
                      row.isPreview
                        ? `partial-preview-digit-${digitIdx}`
                        : `partial-${row.renderIndex}-digit-${digitIdx}`
                    }
                  >
                    {digit}
                  </div>
                ))}
                {Array.from({ length: leadingZeros }).map((_, idx) => (
                  <div key={`zero-${idx}`} className="w-12 sm:w-14 md:w-16 text-center text-muted-foreground/50">
                    0
                  </div>
                ))}
              </div>
            );
          })}

          {/* Final separator if we have multiple partial products */}
          {state.partialProducts.length > 1 && (
            <div className="w-full border-t-2 border-foreground mt-2" />
          )}
        </div>
      )}
    </div>
  );
}
