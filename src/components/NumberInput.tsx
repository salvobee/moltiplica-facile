import { useState, useEffect } from "react";
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

export function NumberInput({ 
  value, 
  onChange, 
  isCorrect, 
  isError, 
  size = 'md',
  autoFocus,
  placeholder = "",
  disabled = false,
  "data-testid": testId
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  const [shake, setShake] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (isError) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }, [isError]);

  useEffect(() => {
    if (isCorrect) {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }
  }, [isCorrect]);

  useEffect(() => {
    if (value === null || Number.isNaN(value)) {
      setLocalValue('');
      return;
    }

    const nextValue = value.toString();
    setLocalValue((prev) => (prev === nextValue ? prev : nextValue));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

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
    sm: 'w-10 h-10 text-2xl',
    md: 'w-12 h-12 sm:w-14 sm:h-14 text-3xl sm:text-4xl',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-4xl sm:text-5xl',
  };

  return (
    <Input
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
        "text-center font-mono font-bold border-2 rounded-md transition-all text-slate-800",
        sizeClasses[size],
        isCorrect && "border-emerald-500 bg-emerald-100 text-emerald-600",
        isError && "border-rose-500 bg-rose-100 text-rose-600",
        !isCorrect && !isError && "border-sky-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200",
        shake && "error-shake",
        bounce && "success-bounce",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    />
  );
}
