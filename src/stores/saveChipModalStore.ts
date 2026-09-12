import { create } from "zustand";

export interface ChipSaveState {
  readonly id?: string | null;
  readonly name: string;
  readonly color: string;
}

export interface SaveChipModalStore {
  isOpen: boolean;
  initialState?: ChipSaveState;
  open: (state?: ChipSaveState) => void;
  close: () => void;
}

export const useSaveChipModalStore = create<SaveChipModalStore>((set) => ({
  isOpen: false,
  initialState: undefined,
  open: (state) => set({ isOpen: true, initialState: state }),
  close: () => set({ isOpen: false }),
}));

export const saveChipModal = {
  open: (state: ChipSaveState) => {
    useSaveChipModalStore.getState().open(state);
  },
  close: () => {
    useSaveChipModalStore.getState().close();
  },
};
