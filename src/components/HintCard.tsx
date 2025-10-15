import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HintCardProps {
  message: string;
  type: 'hint' | 'error' | 'success';
  level?: 1 | 2 | 3;
}

export function HintCard({ message, type, level }: HintCardProps) {
  const icons = {
    hint: Lightbulb,
    error: AlertCircle,
    success: CheckCircle,
  };

  const Icon = icons[type];

  const colorClasses = {
    hint: 'border-amber-300 bg-amber-100 text-amber-800',
    error: 'border-rose-400 bg-rose-50 text-rose-600',
    success: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  };

  return (
    <Card className={cn(
      "border-2 transition-all duration-300",
      colorClasses[type],
      type === 'hint' && level === 3 && "pulse-hint"
    )}>
      <CardContent className="p-4 flex items-start gap-3">
        <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <p className="text-base sm:text-lg font-medium leading-relaxed" data-testid={`hint-message-${type}`}>
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
