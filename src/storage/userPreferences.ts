export interface UserPreferences {
  readonly showGrid: boolean;
  readonly showPortLabel: boolean;
}

const STORAGE_KEY = "logicsim_user_preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  showGrid: false,
  showPortLabel: false,
};

/** Reads persisted display preferences from localStorage, falling back to defaults (both off) if absent or malformed. */
export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(raw);
    return {
      showGrid: Boolean(parsed?.showGrid),
      showPortLabel: Boolean(parsed?.showPortLabel),
    };
  } catch (err) {
    console.warn("Failed to load user preferences from localStorage:", err);
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (err) {
    console.error("Failed to save user preferences to localStorage:", err);
  }
}
