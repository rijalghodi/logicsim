import { create } from "zustand";
import { loadUserPreferences, saveUserPreferences } from "@/storage/userPreferences";

interface UserPreferencesState {
  showGrid: boolean;
  showPortLabel: boolean;
  setShowGrid: (value: boolean) => void;
  setShowPortLabel: (value: boolean) => void;
}

const initial = loadUserPreferences();

/** Display preferences (grid, port labels), persisted to localStorage on every change. Default: both off. */
export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  showGrid: initial.showGrid,
  showPortLabel: initial.showPortLabel,

  setShowGrid: (value) => {
    set({ showGrid: value });
    saveUserPreferences({ showGrid: value, showPortLabel: get().showPortLabel });
  },

  setShowPortLabel: (value) => {
    set({ showPortLabel: value });
    saveUserPreferences({ showGrid: get().showGrid, showPortLabel: value });
  },
}));
