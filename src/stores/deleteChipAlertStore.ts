import { create } from "zustand";

export interface DeleteChipAlertStore {
  isOpen: boolean;
  chipId: string | null;
  open: (chipId: string) => void;
  close: () => void;
}

export const useDeleteChipAlertStore = create<DeleteChipAlertStore>((set) => ({
  isOpen: false,
  chipId: null,
  open: (chipId) => set({ isOpen: true, chipId }),
  close: () => set({ isOpen: false, chipId: null }),
}));

export const deleteChipAlert = {
  open: (chipId: string) => useDeleteChipAlertStore.getState().open(chipId),
  close: () => useDeleteChipAlertStore.getState().close(),
};
