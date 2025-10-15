import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-end gap-2 p-4 sm:items-end">
      <div className="flex w-full max-w-sm flex-col gap-2 pointer-events-auto sm:mr-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-lg transition-all",
              toast.variant === "destructive" && "border-rose-400 bg-rose-50 text-rose-600",
              toast.variant === "success" && "border-emerald-400 bg-emerald-50 text-emerald-600",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
                {toast.description && (
                  <p className="text-sm text-slate-500">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Chiudi notifica"
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
                onClick={() => dismiss(toast.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
