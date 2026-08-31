export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

type Listener = (toast: ToastMessage) => void;

let nextId = 1;
const listeners = new Set<Listener>();

function emit(type: ToastType, text: string) {
  const toast: ToastMessage = { id: nextId++, type, text };
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  success: (text: string) => emit("success", text),
  error: (text: string) => emit("error", text),
  warning: (text: string) => emit("warning", text),
  info: (text: string) => emit("info", text),
};
