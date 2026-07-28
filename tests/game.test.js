import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TIER_ORDER, STREAK_TO_UNLOCK, OPTION_COUNTS,
  unlockedTiers, poolForTiers, pickRound, recordAnswer,
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

test('pickRound at highestUnlockedIndex 0 only uses easy-tier countries', () => {
  const rng = () => 0; // deterministic
  const round = pickRound(SAMPLE, 0, rng);
  assert.equal(round.options.length, OPTION_COUNTS.easy);
  assert.ok(round.options.every(c => c.tier === 'easy'));
  assert.ok(round.options.some(c => c.code === round.target.code));
});

test('pickRound options contain no duplicates', () => {
  const round = pickRound(SAMPLE, 0, Math.random);
  const codes = round.options.map(o => o.code);
  assert.equal(new Set(codes).size, codes.length);
});

test('pickRound draws from all unlocked tiers combined, sized by current tier', () => {
  // highestUnlockedIndex 1 => medium is current tier => 6 options,
  // but only 6 countries exist across easy+medium in SAMPLE, so all are used.
  const round = pickRound(SAMPLE, 1, Math.random);
  assert.equal(round.options.length, Math.min(OPTION_COUNTS.medium, 6));
  assert.ok(round.options.every(c => ['easy', 'medium'].includes(c.tier)));
});

test('recordAnswer increments streak on correct, resets on incorrect', () => {
  let state = { streak: 3, highestUnlockedIndex: 0 };
  let next = recordAnswer(state, true);
  assert.equal(next.streak, 4);
  assert.equal(next.justUnlocked, false);

  next = recordAnswer(state, false);
  assert.equal(next.streak, 0);
  assert.equal(next.highestUnlockedIndex, 0);
  assert.equal(next.justUnlocked, false);
});

test('recordAnswer unlocks next tier at STREAK_TO_UNLOCK correct in a row', () => {
  const state = { streak: STREAK_TO_UNLOCK - 1, highestUnlockedIndex: 0 };
  const next = recordAnswer(state, true);
  assert.equal(next.streak, STREAK_TO_UNLOCK);
  assert.equal(next.highestUnlockedIndex, 1);
  assert.equal(next.justUnlocked, true);
});

test('recordAnswer does not unlock past the last tier', () => {
  const state = { streak: STREAK_TO_UNLOCK - 1, highestUnlockedIndex: TIER_ORDER.length - 1 };
  const next = recordAnswer(state, true);
  assert.equal(next.highestUnlockedIndex, TIER_ORDER.length - 1);
  assert.equal(next.justUnlocked, false);
});
