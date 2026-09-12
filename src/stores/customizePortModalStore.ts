import { create } from "zustand";

export interface CustomizePortModalStore {
  isOpen: boolean;
  portId: string | null;
  open: (portId: string) => void;
  close: () => void;
}

export const useCustomizePortModalStore = create<CustomizePortModalStore>((set) => ({
  isOpen: false,
  portId: null,
  open: (portId) => set({ isOpen: true, portId }),
  close: () => set({ isOpen: false, portId: null }),
}));

export const customizePortModal = {
  open: (portId: string) => useCustomizePortModalStore.getState().open(portId),
  close: () => useCustomizePortModalStore.getState().close(),
};
