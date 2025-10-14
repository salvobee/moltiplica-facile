import { MultiplicationState } from "@shared/schema";

interface MultiplicationDisplayProps {
  state: MultiplicationState;
  showPartialProducts?: boolean;
}

export function MultiplicationDisplay({ state, showPartialProducts = true }: MultiplicationDisplayProps) {
  const { num1Digits, num2Digits, partialProducts } = state;

  // Reverse digits for display (we store them reversed for easier calculation)
  const num1Display = [...num1Digits].reverse();
  const num2Display = [...num2Digits].reverse();

  // Calculate max width needed
  const maxWidth = Math.max(num1Digits.length, num2Digits.length, 
    ...partialProducts.map(p => p.length + partialProducts.indexOf(p)));

  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-card border-2 border-card-border rounded-lg">
      {/* Number 1 - aligned right */}
      <div className="flex justify-end items-center gap-1 font-mono text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
        {num1Display.map((digit, idx) => (
          <div key={idx} className="w-12 sm:w-14 md:w-16 text-center" data-testid={`num1-digit-${idx}`}>
            {digit}
          </div>
        ))}
      </div>

      {/* Multiplication sign and Number 2 */}
      <div className="flex justify-end items-center gap-1 font-mono text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
        <span className="w-12 sm:w-14 md:w-16 text-center text-primary">×</span>
        {num2Display.map((digit, idx) => (
          <div key={idx} className="w-12 sm:w-14 md:w-16 text-center" data-testid={`num2-digit-${idx}`}>
            {digit}
          </div>
        ))}
      </div>

      {/* Separator line */}
      <div className="w-full border-t-2 border-foreground" />

      {/* Partial products */}
      {showPartialProducts && partialProducts.length > 0 && (
        <div className="flex flex-col gap-1 w-full">
          {partialProducts.map((partial, partialIdx) => {
            const partialDisplay = [...partial].reverse();
            // Add leading zeros based on position
            const leadingZeros = partialIdx;
            
            return (
              <div key={partialIdx} className="flex justify-end items-center gap-1 font-mono text-3xl sm:text-4xl md:text-5xl font-medium text-muted-foreground">
                {partialDisplay.map((digit, digitIdx) => (
                  <div key={digitIdx} className="w-12 sm:w-14 md:w-16 text-center" data-testid={`partial-${partialIdx}-digit-${digitIdx}`}>
                    {digit}
                  </div>
                ))}
                {/* Show leading zeros */}
                {Array.from({ length: leadingZeros }).map((_, idx) => (
                  <div key={`zero-${idx}`} className="w-12 sm:w-14 md:w-16 text-center text-muted-foreground/50">
                    0
                  </div>
                ))}
              </div>
            );
          })}

          {/* Final separator if we have multiple partial products */}
          {partialProducts.length > 1 && (
            <div className="w-full border-t-2 border-foreground mt-2" />
          )}
        </div>
      )}
    </div>
  );
}
