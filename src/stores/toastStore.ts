import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastEvent {
  message: string;
  type: ToastType;
}

export interface ToastStore {
  current: ToastEvent | null;
  show: (event: ToastEvent) => void;
  hide: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  current: null,
  show: (event) => {
    set({ current: event });
    setTimeout(() => {
      set((state) => (state.current?.message === event.message ? { current: null } : state));
    }, 3500);
  },
  hide: () => set({ current: null }),
}));

export const toast = {
  success: (message: string) => {
    useToastStore.getState().show({ message, type: "success" });
  },
  error: (message: string) => {
    useToastStore.getState().show({ message, type: "error" });
  },
  info: (message: string) => {
    useToastStore.getState().show({ message, type: "info" });
  },
};
