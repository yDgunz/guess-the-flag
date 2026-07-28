import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { COUNTRIES } from '../data/countries.js';

test('every country has a unique code, non-empty name, and valid tier', () => {
  const seen = new Set();
  for (const c of COUNTRIES) {
    assert.match(c.code, /^[a-z-]+$/, `bad code: ${c.code}`);
    assert.ok(!seen.has(c.code), `duplicate code: ${c.code}`);
    seen.add(c.code);
    assert.ok(c.name.length > 0, `empty name for ${c.code}`);
    assert.ok(['easy', 'medium', 'hard'].includes(c.tier), `bad tier for ${c.code}`);
  }
});

test('every country code has a vendored flag SVG', () => {
  const files = new Set(readdirSync('vendor/flag-icons/flags/4x3'));
  for (const c of COUNTRIES) {
    assert.ok(files.has(`${c.code}.svg`), `missing SVG for ${c.code}`);
  }
});

test('tier counts roughly match spec (easy ~32, medium ~70, hard ~90+)', () => {
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const c of COUNTRIES) counts[c.tier]++;
  assert.ok(counts.easy >= 30 && counts.easy <= 35, `easy count off: ${counts.easy}`);
  assert.ok(counts.medium >= 60 && counts.medium <= 80, `medium count off: ${counts.medium}`);
  assert.ok(counts.hard >= 80, `hard count off: ${counts.hard}`);
});
