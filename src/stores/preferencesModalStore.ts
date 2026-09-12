import { create } from "zustand";

export interface PreferencesModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const usePreferencesModalStore = create<PreferencesModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const preferencesModal = {
  open: () => usePreferencesModalStore.getState().open(),
  close: () => usePreferencesModalStore.getState().close(),
};
