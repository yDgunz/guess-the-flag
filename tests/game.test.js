import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TIER_ORDER, UNLOCK_THRESHOLDS, DEMOTE_AFTER_MISSES, OPTION_COUNTS, MODES,
  unlockedTiers, poolForTiers, roundParamsForMode, pickRound,
  recordAnswer, nextStreak, updateBest,
} from '../js/game.js';

const SAMPLE = [
  { code: 'fr', name: 'France', tier: 'easy' },
  { code: 'br', name: 'Brazil', tier: 'easy' },
  { code: 'jp', name: 'Japan', tier: 'easy' },
  { code: 'ca', name: 'Canada', tier: 'easy' },
  { code: 'it', name: 'Italy', tier: 'medium' },
  { code: 'cn', name: 'China', tier: 'medium' },
  { code: 'al', name: 'Albania', tier: 'hard' },
];

test('OPTION_COUNTS caps every tier at 6 flags for small-screen fit', () => {
  assert.equal(OPTION_COUNTS.easy, 4);
  assert.equal(OPTION_COUNTS.medium, 6);
  assert.equal(OPTION_COUNTS.hard, 6);
});

test('MODES lists the three fixed tiers plus progressive', () => {
  assert.deepEqual(MODES, ['easy', 'medium', 'hard', 'progressive']);
});

test('unlockedTiers returns cumulative tier list by index', () => {
  assert.deepEqual(unlockedTiers(0), ['easy']);
  assert.deepEqual(unlockedTiers(1), ['easy', 'medium']);
  assert.deepEqual(unlockedTiers(2), ['easy', 'medium', 'hard']);
});

test('poolForTiers filters countries to only the given tiers', () => {
  const pool = poolForTiers(SAMPLE, ['easy']);
  assert.equal(pool.length, 4);
  assert.ok(pool.every(c => c.tier === 'easy'));
});

test('roundParamsForMode for a fixed tier only uses that tier', () => {
  assert.deepEqual(roundParamsForMode('easy', 0), { tiers: ['easy'], optionCount: OPTION_COUNTS.easy });
  assert.deepEqual(roundParamsForMode('hard', 0), { tiers: ['hard'], optionCount: OPTION_COUNTS.hard });
});

test('roundParamsForMode for progressive uses cumulative unlocked tiers sized by current tier', () => {
  assert.deepEqual(
    roundParamsForMode('progressive', 1),
    { tiers: ['easy', 'medium'], optionCount: OPTION_COUNTS.medium },
  );
});

test('pickRound at easy tier only uses easy-tier countries', () => {
  const rng = () => 0; // deterministic
  const round = pickRound(SAMPLE, ['easy'], OPTION_COUNTS.easy, rng);
  assert.equal(round.options.length, OPTION_COUNTS.easy);
  assert.ok(round.options.every(c => c.tier === 'easy'));
  assert.ok(round.options.some(c => c.code === round.target.code));
});

test('pickRound options contain no duplicates', () => {
  const round = pickRound(SAMPLE, ['easy'], OPTION_COUNTS.easy, Math.random);
  const codes = round.options.map(o => o.code);
  assert.equal(new Set(codes).size, codes.length);
});

test('pickRound draws from all given tiers combined', () => {
  const round = pickRound(SAMPLE, ['easy', 'medium'], OPTION_COUNTS.medium, Math.random);
  assert.equal(round.options.length, Math.min(OPTION_COUNTS.medium, 6));
  assert.ok(round.options.every(c => ['easy', 'medium'].includes(c.tier)));
});

test('nextStreak increments on correct, resets to 0 on incorrect', () => {
  assert.equal(nextStreak(3, true), 4);
  assert.equal(nextStreak(3, false), 0);
});

test('updateBest keeps the higher of the two values', () => {
  assert.equal(updateBest(5, 8), 8);
  assert.equal(updateBest(8, 5), 8);
});

test('recordAnswer increments streak on correct, resets on incorrect', () => {
  const state = { streak: 3, misses: 1, highestUnlockedIndex: 0 };
  let next = recordAnswer(state, true);
  assert.equal(next.streak, 4);
  assert.equal(next.misses, 0);
  assert.equal(next.justUnlocked, false);

  next = recordAnswer(state, false);
  assert.equal(next.streak, 0);
  assert.equal(next.misses, 2);
  assert.equal(next.highestUnlockedIndex, 0);
  assert.equal(next.justUnlocked, false);
});

test('recordAnswer unlocks medium at the easy-tier threshold', () => {
  const threshold = UNLOCK_THRESHOLDS.easy;
  const state = { streak: threshold - 1, misses: 0, highestUnlockedIndex: 0 };
  const next = recordAnswer(state, true);
  assert.equal(next.streak, threshold);
  assert.equal(next.highestUnlockedIndex, 1);
  assert.equal(next.justUnlocked, true);
});

test('recordAnswer unlocks hard at the medium-tier threshold', () => {
  const threshold = UNLOCK_THRESHOLDS.medium;
  const state = { streak: threshold - 1, misses: 0, highestUnlockedIndex: 1 };
  const next = recordAnswer(state, true);
  assert.equal(next.streak, threshold);
  assert.equal(next.highestUnlockedIndex, 2);
  assert.equal(next.justUnlocked, true);
});

test('recordAnswer does not unlock past the last tier', () => {
  const state = { streak: 1000, misses: 0, highestUnlockedIndex: TIER_ORDER.length - 1 };
  const next = recordAnswer(state, true);
  assert.equal(next.highestUnlockedIndex, TIER_ORDER.length - 1);
  assert.equal(next.justUnlocked, false);
});

test('recordAnswer demotes one tier down after DEMOTE_AFTER_MISSES wrong in a row', () => {
  const state = { streak: 0, misses: DEMOTE_AFTER_MISSES - 1, highestUnlockedIndex: 2 };
  const next = recordAnswer(state, false);
  assert.equal(next.highestUnlockedIndex, 1);
  assert.equal(next.misses, 0);
  assert.equal(next.justDemoted, true);
});

test('recordAnswer does not demote below the easiest tier', () => {
  const state = { streak: 0, misses: DEMOTE_AFTER_MISSES - 1, highestUnlockedIndex: 0 };
  const next = recordAnswer(state, false);
  assert.equal(next.highestUnlockedIndex, 0);
  assert.equal(next.justDemoted, false);
});

test('a correct answer resets the miss counter, preventing an unrelated future demotion', () => {
  const missed = recordAnswer({ streak: 0, misses: 0, highestUnlockedIndex: 1 }, false);
  const missedAgain = recordAnswer(missed, false);
  assert.equal(missedAgain.misses, 2);
  const gotItRight = recordAnswer(missedAgain, true);
  assert.equal(gotItRight.misses, 0);
  const missedOnceMore = recordAnswer(gotItRight, false);
  assert.equal(missedOnceMore.misses, 1);
  assert.equal(missedOnceMore.justDemoted, false);
});
