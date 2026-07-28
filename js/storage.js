export const STORAGE_KEY = 'guess-the-flag:progress';

const VALID_MODES = ['easy', 'medium', 'hard', 'progressive'];

export const DEFAULT_STATE = {
  mode: 'progressive',
  progressive: { streak: 0, misses: 0, highestUnlockedIndex: 0 },
  practice: { easy: 0, medium: 0, hard: 0 },
  bestStreaks: { easy: 0, medium: 0, hard: 0, progressive: 0 },
};

function numberOr(value, fallback) {
  return typeof value === 'number' ? value : fallback;
}

function isOldShape(parsed) {
  return typeof parsed.streak === 'number'
    && typeof parsed.highestUnlockedIndex === 'number'
    && parsed.mode === undefined;
}

// Migrates the pre-modes save format ({ streak, highestUnlockedIndex }) into
// the current shape, preserving progressive progress instead of wiping it.
function migrateOldShape(parsed) {
  return {
    mode: 'progressive',
    progressive: { streak: parsed.streak, misses: 0, highestUnlockedIndex: parsed.highestUnlockedIndex },
    practice: { ...DEFAULT_STATE.practice },
    bestStreaks: { ...DEFAULT_STATE.bestStreaks, progressive: parsed.streak },
  };
}

function withDefaults(parsed) {
  return {
    mode: VALID_MODES.includes(parsed.mode) ? parsed.mode : DEFAULT_STATE.mode,
    progressive: {
      streak: numberOr(parsed.progressive?.streak, 0),
      misses: numberOr(parsed.progressive?.misses, 0),
      highestUnlockedIndex: numberOr(parsed.progressive?.highestUnlockedIndex, 0),
    },
    practice: {
      easy: numberOr(parsed.practice?.easy, 0),
      medium: numberOr(parsed.practice?.medium, 0),
      hard: numberOr(parsed.practice?.hard, 0),
    },
    bestStreaks: {
      easy: numberOr(parsed.bestStreaks?.easy, 0),
      medium: numberOr(parsed.bestStreaks?.medium, 0),
      hard: numberOr(parsed.bestStreaks?.hard, 0),
      progressive: numberOr(parsed.bestStreaks?.progressive, 0),
    },
  };
}

export function loadState(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(DEFAULT_STATE);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
  if (typeof parsed !== 'object' || parsed === null) return structuredClone(DEFAULT_STATE);
  if (isOldShape(parsed)) return migrateOldShape(parsed);
  return withDefaults(parsed);
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
