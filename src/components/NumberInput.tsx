import { forwardRef, useState, useEffect, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isCorrect?: boolean;
  isError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  placeholder?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      isCorrect,
      isError,
      size = 'md',
      autoFocus,
      placeholder = "",
      disabled = false,
      "data-testid": testId,
    }: NumberInputProps,
    ref,
  ) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  const [shake, setShake] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [feedbackState, setFeedbackState] = useState<"correct" | "error" | null>(null);

  useEffect(() => {
    if (!isError) return;

    setShake(true);
    setFeedbackState("error");
    const timer = setTimeout(() => setFeedbackState(null), 1200);
    const shakeTimer = setTimeout(() => setShake(false), 400);

    return () => {
      clearTimeout(timer);
      clearTimeout(shakeTimer);
    };
  }, [isError]);

  useEffect(() => {
    if (!isCorrect) return;

    setBounce(true);
    setFeedbackState("correct");
    const timer = setTimeout(() => setFeedbackState(null), 1200);
    const bounceTimer = setTimeout(() => setBounce(false), 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(bounceTimer);
    };
  }, [isCorrect]);

  useEffect(() => {
    if (value === null || Number.isNaN(value)) {
      setLocalValue('');
      return;
    }

    const nextValue = value.toString();
    setLocalValue((prev) => (prev === nextValue ? prev : nextValue));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Only allow numeric characters
    if (/^\d*$/.test(newValue)) {
      setLocalValue(newValue);
      if (newValue === '') {
        onChange(null);
        return;
      }

      const parsedValue = parseInt(newValue, 10);
      if (!Number.isNaN(parsedValue)) {
        onChange(parsedValue);
      }
    }
  };

  const sizeClasses = {
    sm: 'w-14 h-14 text-3xl sm:w-16 sm:h-16 sm:text-[2.5rem]',
    md: 'w-16 h-16 text-[2.75rem] sm:w-20 sm:h-20 sm:text-[3.25rem]',
    lg: 'w-20 h-20 text-[3.25rem] sm:w-24 sm:h-24 sm:text-[3.75rem]',
  };

  const feedbackClasses =
    feedbackState === "correct"
      ? "!border-emerald-500 focus-visible:!border-emerald-500 focus-visible:!ring-emerald-200 ring-2 ring-emerald-200 bg-emerald-50 text-emerald-700"
      : feedbackState === "error"
      ? "!border-rose-500 focus-visible:!border-rose-500 focus-visible:!ring-rose-200 ring-2 ring-rose-200 bg-rose-50 text-rose-700"
      : "!border-sky-400 focus-visible:!border-sky-500 focus-visible:!ring-sky-200";

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        data-testid={testId}
        className={cn(
          "text-center font-mono font-bold border-2 rounded-md transition-[colors,transform,shadow] text-slate-800 leading-none tracking-tight px-0",
          sizeClasses[size],
          feedbackClasses,
          shake && "error-shake",
          bounce && "success-bounce",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";
