import type { DivisionState } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DivisionDisplayProps {
  state: DivisionState;
}

export function DivisionDisplay({ state }: DivisionDisplayProps) {
  const {
    divisor,
    dividend,
    quotientDigits,
    currentQuotientIndex,
    currentPartialDividend,
    subtractionSteps,
    phase,
    pendingQuotientDigit,
    pendingProduct,
    remainder,
  } = state;

  const activeProduct =
    pendingProduct ?? (pendingQuotientDigit !== null ? pendingQuotientDigit * divisor : null);
  const productDisplay = activeProduct !== null ? activeProduct : '___';

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex justify-center">
        <div className="flex gap-2">
          {quotientDigits.map((digit, idx) => {
            const isActive = phase === 'quotient' && idx === currentQuotientIndex;
            return (
              <div
                key={`quotient-${idx}`}
                className={cn(
                  "w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-mono",
                  isActive
                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                {digit !== null ? digit : ''}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center min-w-[4rem]">
            <span className="text-xl font-semibold text-slate-600">Divisore</span>
            <span className="text-3xl sm:text-4xl font-bold text-slate-800 font-mono">{divisor}</span>
          </div>
          <div className="flex-1">
            <div className="border-b-4 border-slate-400 pb-2 mb-4">
              <div className="text-xl font-semibold text-slate-600">Dividendo</div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 font-mono">{dividend}</div>
            </div>

            <div className="space-y-3">
              {subtractionSteps.map((step, idx) => (
                <div
                  key={`step-${idx}`}
                  className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700"
                >
                  <div className="flex flex-wrap items-center gap-2 text-lg font-mono">
                    <span>{step.partialDividend}</span>
                    <span>-</span>
                    <span>
                      ({divisor} × {step.quotientDigit})
                    </span>
                    <span>=</span>
                    <span className="text-sky-600 font-semibold">{step.remainder}</span>
                  </div>
                  {step.broughtDownDigit !== null && step.resultAfterBringDown !== null && (
                    <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-slate-500">↓</span>
                      <span>
                        Porta giù <strong>{step.broughtDownDigit}</strong> →{' '}
                        <span className="font-mono text-base">{step.resultAfterBringDown}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {!state.isComplete && (
                <div className="border border-dashed border-sky-400 bg-sky-50/60 rounded-lg px-4 py-3">
                  {phase === 'quotient' ? (
                    <div className="text-slate-700 text-lg">
                      <span className="font-semibold text-sky-700">Dividendo parziale:</span>{' '}
                      <span className="font-mono text-xl">{currentPartialDividend}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-700">
                      <div className="text-lg">
                        Sottrai <span className="font-mono text-xl">{productDisplay}</span> da{' '}
                        <span className="font-mono text-xl">{currentPartialDividend}</span>
                      </div>
                      {pendingQuotientDigit !== null && (
                        <div className="text-sm text-slate-600">
                          ({divisor} × {pendingQuotientDigit} = {productDisplay})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {state.isComplete && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-lg text-slate-700">
          <div>
            Quoziente finale:{' '}
            <span className="font-mono text-2xl text-emerald-600">
              {state.quotientDigits.filter((digit) => digit !== null).length > 0
                ? state.quotientDigits.filter((digit) => digit !== null).join('')
                : '0'}
            </span>
          </div>
          <div>
            Resto:{' '}
            <span className="font-mono text-2xl text-rose-500">{remainder}</span>
          </div>
        </div>
      )}
    </div>
  );
}
