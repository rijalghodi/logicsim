import { create } from "zustand";

export interface UnsavedAlertStore {
  isOpen: boolean;
  chipIdToOpen: string | null;
  open: (chipIdToOpen: string | null) => void;
  close: () => void;
}

export const useUnsavedAlertStore = create<UnsavedAlertStore>((set) => ({
  isOpen: false,
  chipIdToOpen: null,
  open: (chipIdToOpen: string | null) => set({ isOpen: true, chipIdToOpen: chipIdToOpen }),
  close: () => set({ isOpen: false, chipIdToOpen: null }),
}));

export const unsavedAlert = {
  open: (chipIdToOpen: string | null) => useUnsavedAlertStore.getState().open(chipIdToOpen),
  close: () => useUnsavedAlertStore.getState().close(),
};
