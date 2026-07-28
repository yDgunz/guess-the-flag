import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState, STORAGE_KEY } from '../js/storage.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
}

test('loadState returns default state when nothing stored', () => {
  const state = loadState(fakeStorage());
  assert.deepEqual(state, { streak: 0, highestUnlockedIndex: 0 });
});

test('saveState then loadState round-trips the state', () => {
  const storage = fakeStorage();
  saveState(storage, { streak: 7, highestUnlockedIndex: 1 });
  assert.deepEqual(loadState(storage), { streak: 7, highestUnlockedIndex: 1 });
});

test('loadState falls back to default on corrupt data', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, 'not json');
  assert.deepEqual(loadState(storage), { streak: 0, highestUnlockedIndex: 0 });
});
