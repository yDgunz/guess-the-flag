export const STORAGE_KEY = 'guess-the-flag:progress';

export const DEFAULT_STATE = { streak: 0, highestUnlockedIndex: 0 };

export function loadState(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_STATE };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.streak !== 'number' || typeof parsed.highestUnlockedIndex !== 'number') {
      return { ...DEFAULT_STATE };
    }
    return parsed;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
