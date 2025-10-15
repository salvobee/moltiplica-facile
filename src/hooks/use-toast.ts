import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export type ToastVariant = "default" | "success" | "destructive";

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastMessage extends ToastOptions {
  id: string;
  open: boolean;
}

interface ToastState {
  toasts: ToastMessage[];
}

const TOAST_LIMIT = 3;
const DEFAULT_DURATION = 4000;

let listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };
let counter = 0;
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function notify() {
  for (const listener of listeners) {
    listener(memoryState);
  }
}

function genId() {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return counter.toString();
}

function setState(newState: ToastState) {
  memoryState = newState;
  notify();
}

function removeToast(id?: string) {
  if (!id) {
    setState({ toasts: [] });
    return;
  }

  timeouts.delete(id);
  setState({
    toasts: memoryState.toasts.filter((toast) => toast.id !== id),
  });
}

function scheduleRemoval(id: string, duration?: number) {
  const timeout = setTimeout(() => {
    removeToast(id);
  }, duration ?? DEFAULT_DURATION);
  timeouts.set(id, timeout);
}

export function dismissToast(id?: string) {
  if (!id) {
    memoryState.toasts.forEach((toast) => dismissToast(toast.id));
    return;
  }

  setState({
    toasts: memoryState.toasts.map((toast) =>
      toast.id === id
        ? {
            ...toast,
            open: false,
          }
        : toast,
    ),
  });

  const timeout = timeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
  }
  scheduleRemoval(id, 150);
}

export function toast(options: ToastOptions = {}) {
  const id = options.id ?? genId();
  const toastDuration = options.duration ?? DEFAULT_DURATION;

  const toastItem: ToastMessage = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: toastDuration,
    open: true,
  };

  const nextToasts = [toastItem, ...memoryState.toasts].slice(0, TOAST_LIMIT);
  setState({ toasts: nextToasts });

  if (toastDuration !== Infinity) {
    const timeout = setTimeout(() => dismissToast(id), toastDuration);
    timeouts.set(id, timeout);
  }

  return {
    id,
    dismiss: () => dismissToast(id),
  };
}

export function useToast() {
  const [state, setLocalState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners = [...listeners, setLocalState];
    return () => {
      listeners = listeners.filter((listener) => listener !== setLocalState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: dismissToast,
  };
}
