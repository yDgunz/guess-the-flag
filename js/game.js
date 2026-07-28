export const TIER_ORDER = ['easy', 'medium', 'hard'];
export const OPTION_COUNTS = { easy: 4, medium: 6, hard: 6 };
export const UNLOCK_THRESHOLDS = { easy: 15, medium: 20 };

export function unlockedTiers(highestUnlockedIndex) {
  return TIER_ORDER.slice(0, highestUnlockedIndex + 1);
}

export function poolForTiers(countries, tierNames) {
  return countries.filter(c => tierNames.includes(c.tier));
}

function shuffle(array, rng) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRound(countries, highestUnlockedIndex, rng = Math.random) {
  const tiers = unlockedTiers(highestUnlockedIndex);
  const pool = poolForTiers(countries, tiers);
  const currentTier = TIER_ORDER[highestUnlockedIndex];
  const desiredCount = Math.min(OPTION_COUNTS[currentTier], pool.length);

  const shuffled = shuffle(pool, rng);
  const options = shuffled.slice(0, desiredCount);
  const target = options[Math.floor(rng() * options.length)];

  return { target, options: shuffle(options, rng) };
}

export function recordAnswer(state, correct) {
  if (!correct) {
    return { streak: 0, highestUnlockedIndex: state.highestUnlockedIndex, justUnlocked: false };
  }
  const streak = state.streak + 1;
  const currentTier = TIER_ORDER[state.highestUnlockedIndex];
  const threshold = UNLOCK_THRESHOLDS[currentTier];
  const canUnlock = threshold !== undefined
    && streak >= threshold
    && state.highestUnlockedIndex < TIER_ORDER.length - 1;
  const highestUnlockedIndex = canUnlock ? state.highestUnlockedIndex + 1 : state.highestUnlockedIndex;
  return { streak, highestUnlockedIndex, justUnlocked: canUnlock };
}
