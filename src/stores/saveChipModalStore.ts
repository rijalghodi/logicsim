import { create } from "zustand";

export interface ChipSaveState {
  readonly id: string | null;
  readonly name: string;
  readonly color: string;
}

export interface SaveChipModalStore {
  isOpen: boolean;
  chipId: string | null;
  open: (chipId: string | null) => void;
  close: () => void;
}

export const useSaveChipModalStore = create<SaveChipModalStore>((set) => ({
  isOpen: false,
  chipId: null,
  open: (chipId) => set({ isOpen: true, chipId }),
  close: () => set({ isOpen: false, chipId: null }),
}));

export const saveChipModal = {
  open: (chipId: string | null) => {
    useSaveChipModalStore.getState().open(chipId);
  },
  close: () => {
    useSaveChipModalStore.getState().close();
  },
};
