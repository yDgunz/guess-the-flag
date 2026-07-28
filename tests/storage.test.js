import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState, STORAGE_KEY, DEFAULT_STATE } from '../js/storage.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
}

test('loadState returns default state when nothing stored', () => {
  const state = loadState(fakeStorage());
  assert.deepEqual(state, DEFAULT_STATE);
});

test('saveState then loadState round-trips the state', () => {
  const storage = fakeStorage();
  const state = {
    mode: 'hard',
    progressive: { streak: 7, misses: 2, highestUnlockedIndex: 1 },
    practice: { easy: 3, medium: 0, hard: 12 },
    bestStreaks: { easy: 20, medium: 5, hard: 12, progressive: 9 },
  };
  saveState(storage, state);
  assert.deepEqual(loadState(storage), state);
});

test('loadState falls back to default on corrupt data', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, 'not json');
  assert.deepEqual(loadState(storage), DEFAULT_STATE);
});

test('saving DEFAULT_STATE resets previously saved progress', () => {
  const storage = fakeStorage();
  saveState(storage, {
    mode: 'progressive',
    progressive: { streak: 18, misses: 0, highestUnlockedIndex: 2 },
    practice: { easy: 0, medium: 0, hard: 0 },
    bestStreaks: { easy: 0, medium: 0, hard: 0, progressive: 18 },
  });
  saveState(storage, DEFAULT_STATE);
  assert.deepEqual(loadState(storage), DEFAULT_STATE);
});

test('loadState migrates the pre-modes save format without losing progress', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ streak: 7, highestUnlockedIndex: 1 }));
  assert.deepEqual(loadState(storage), {
    mode: 'progressive',
    progressive: { streak: 7, misses: 0, highestUnlockedIndex: 1 },
    practice: { easy: 0, medium: 0, hard: 0 },
    bestStreaks: { easy: 0, medium: 0, hard: 0, progressive: 7 },
  });
});

test('loadState fills in missing fields from a partial saved shape', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ mode: 'easy', practice: { easy: 4 } }));
  assert.deepEqual(loadState(storage), {
    mode: 'easy',
    progressive: { streak: 0, misses: 0, highestUnlockedIndex: 0 },
    practice: { easy: 4, medium: 0, hard: 0 },
    bestStreaks: { easy: 0, medium: 0, hard: 0, progressive: 0 },
  });
});

test('loadState rejects an unrecognized mode and falls back to progressive', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ mode: 'nonsense' }));
  assert.equal(loadState(storage).mode, 'progressive');
});
