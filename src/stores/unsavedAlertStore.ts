import { create } from "zustand";

export interface UnsavedAlertStore {
  isOpen: boolean;
  chipId?: string | null;
  open: (chipId: string) => void;
  close: () => void;
}

export const useUnsavedAlertStore = create<UnsavedAlertStore>((set) => ({
  isOpen: false,
  chipId: null,
  open: (chipId) => set({ isOpen: true, chipId }),
  close: () => set({ isOpen: false, chipId: null }),
}));

export const unsavedAlert = {
  open: (chipId: string) => useUnsavedAlertStore.getState().open(chipId),
  close: () => useUnsavedAlertStore.getState().close(),
};
