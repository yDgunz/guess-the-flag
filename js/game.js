export const TIER_ORDER = ['easy', 'medium', 'hard'];
export const OPTION_COUNTS = { easy: 4, medium: 6, hard: 6 };
export const UNLOCK_THRESHOLDS = { easy: 15, medium: 20 };
export const DEMOTE_AFTER_MISSES = 3;
export const MODES = ['easy', 'medium', 'hard', 'progressive'];

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

// Given the selected mode, returns which tiers to draw from and how many
// options a round should show. For a fixed tier ('easy'/'medium'/'hard') this
// is just that tier. For 'progressive' it's the cumulative unlocked tiers,
// sized by the current (highest unlocked) tier's option count.
export function roundParamsForMode(mode, highestUnlockedIndex) {
  if (mode === 'progressive') {
    const currentTier = TIER_ORDER[highestUnlockedIndex];
    return { tiers: unlockedTiers(highestUnlockedIndex), optionCount: OPTION_COUNTS[currentTier] };
  }
  return { tiers: [mode], optionCount: OPTION_COUNTS[mode] };
}

export function pickRound(countries, tierNames, optionCount, rng = Math.random) {
  const pool = poolForTiers(countries, tierNames);
  const desiredCount = Math.min(optionCount, pool.length);

  const shuffled = shuffle(pool, rng);
  const options = shuffled.slice(0, desiredCount);
  const target = options[Math.floor(rng() * options.length)];

  return { target, options: shuffle(options, rng) };
}

export function nextStreak(streak, correct) {
  return correct ? streak + 1 : 0;
}

export function updateBest(best, streak) {
  return Math.max(best, streak);
}

// Progressive-mode-only: advances the streak and, once the current tier's
// unlock threshold is met, unlocks the next tier permanently. Symmetrically,
// DEMOTE_AFTER_MISSES wrong answers in a row drops back to an easier tier, so
// a run of misses doesn't leave the player stuck somewhere too hard.
export function recordAnswer(state, correct) {
  if (correct) {
    const streak = state.streak + 1;
    const currentTier = TIER_ORDER[state.highestUnlockedIndex];
    const threshold = UNLOCK_THRESHOLDS[currentTier];
    const canUnlock = threshold !== undefined
      && streak >= threshold
      && state.highestUnlockedIndex < TIER_ORDER.length - 1;
    const highestUnlockedIndex = canUnlock ? state.highestUnlockedIndex + 1 : state.highestUnlockedIndex;
    return { streak, misses: 0, highestUnlockedIndex, justUnlocked: canUnlock, justDemoted: false };
  }

  const misses = state.misses + 1;
  const shouldDemote = misses >= DEMOTE_AFTER_MISSES;
  const justDemoted = shouldDemote && state.highestUnlockedIndex > 0;
  const highestUnlockedIndex = justDemoted ? state.highestUnlockedIndex - 1 : state.highestUnlockedIndex;
  return { streak: 0, misses: shouldDemote ? 0 : misses, highestUnlockedIndex, justUnlocked: false, justDemoted };
}
