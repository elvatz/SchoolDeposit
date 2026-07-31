"use client";

import * as React from "react";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

type ToastInput = Omit<ToastItem, "id">;

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let memoryState: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener(memoryState));
}

function dismiss(id: string) {
  memoryState = memoryState.filter((t) => t.id !== id);
  emit();
}

export function toast(input: ToastInput) {
  const id = Math.random().toString(36).slice(2, 9);
  memoryState = [...memoryState, { id, ...input }];
  emit();
  setTimeout(() => dismiss(id), 4000);
  return id;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toasts, toast, dismiss };
}
