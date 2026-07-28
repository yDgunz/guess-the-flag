# Guess the Flag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, no-build-step web game where a player taps the flag matching a shown country name, with three progressively-unlocked difficulty tiers, a World Cup stadium visual theme, and GitHub Pages hosting.

**Architecture:** Plain HTML/CSS/vanilla JS ES modules, no framework, no bundler. Pure game-logic functions live in `js/game.js` and are unit-tested with Node's built-in test runner (no dependencies). Browser-only concerns (DOM rendering, audio, speech, localStorage) live in thin wrapper modules that are verified manually in-browser rather than unit tested, per the spec.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), Node.js built-in `node:test` + `node:assert` for logic tests, vendored `flag-icons` SVGs (MIT licensed), Web Audio API + Web Speech API. Hosted on GitHub Pages.

## Global Constraints

- No build step, no framework, no npm runtime dependency shipped to the browser — the spec requires plain HTML/CSS/JS deployable directly to GitHub Pages.
- Flag SVGs must be vendored into the repo (not loaded from a CDN).
- Progress (unlocked tiers, streak) persists via `localStorage`, no accounts.
- Option counts by tier: Easy = 4, Medium = 6, Hard = 8 (exact values from spec).
- Unlock rule: 10 correct answers in a row on the first try unlocks the next tier (exact value from spec).
- Once a tier is unlocked, rounds draw from all unlocked tiers combined (cumulative), per spec.
- A wrong tap never ends or reveals the round — the player keeps guessing until correct (per spec).

---

### Task 1: Vendor flag assets and country data

**Files:**
- Create: `vendor/flag-icons/flags/4x3/*.svg` (200 files, filtered subset of the `flag-icons` npm package)
- Create: `vendor/flag-icons/LICENSE`
- Create: `data/countries.js`
- Test: `tests/countries.test.js`

**Interfaces:**
- Produces: `COUNTRIES` — an array of `{ code: string, name: string, tier: 'easy'|'medium'|'hard' }`, exported from `data/countries.js` as an ES module. `code` matches the filename (without extension) of a vendored SVG under `vendor/flag-icons/flags/4x3/`. Every later task that needs flag/country data imports `COUNTRIES` from this file.

- [ ] **Step 1: Fetch and vendor the flag SVGs**

```bash
mkdir -p vendor/flag-icons/flags/4x3
cd /tmp && npm pack flag-icons@7.5.0 --silent && tar xzf flag-icons-7.5.0.tgz
cp package/LICENSE /path/to/repo/vendor/flag-icons/LICENSE
```

Then copy only the 200 SVG files whose codes appear in `data/countries.js` (Step 2) from `package/flags/4x3/` into `vendor/flag-icons/flags/4x3/` in the repo. Do not vendor the full 271-file set — only the codes actually used.

- [ ] **Step 2: Write `data/countries.js`**

```javascript
export const COUNTRIES = [
  { code: 'af', name: 'Afghanistan', tier: 'medium' },
  { code: 'al', name: 'Albania', tier: 'hard' },
  { code: 'dz', name: 'Algeria', tier: 'medium' },
  { code: 'ad', name: 'Andorra', tier: 'hard' },
  { code: 'ao', name: 'Angola', tier: 'medium' },
  { code: 'ag', name: 'Antigua and Barbuda', tier: 'hard' },
  { code: 'ar', name: 'Argentina', tier: 'easy' },
  { code: 'am', name: 'Armenia', tier: 'hard' },
  { code: 'au', name: 'Australia', tier: 'easy' },
  { code: 'at', name: 'Austria', tier: 'medium' },
  { code: 'az', name: 'Azerbaijan', tier: 'medium' },
  { code: 'bs', name: 'Bahamas', tier: 'hard' },
  { code: 'bh', name: 'Bahrain', tier: 'hard' },
  { code: 'bd', name: 'Bangladesh', tier: 'medium' },
  { code: 'bb', name: 'Barbados', tier: 'hard' },
  { code: 'by', name: 'Belarus', tier: 'medium' },
  { code: 'be', name: 'Belgium', tier: 'easy' },
  { code: 'bz', name: 'Belize', tier: 'hard' },
  { code: 'bj', name: 'Benin', tier: 'hard' },
  { code: 'bt', name: 'Bhutan', tier: 'hard' },
  { code: 'bo', name: 'Bolivia', tier: 'medium' },
  { code: 'ba', name: 'Bosnia and Herzegovina', tier: 'hard' },
  { code: 'bw', name: 'Botswana', tier: 'hard' },
  { code: 'br', name: 'Brazil', tier: 'easy' },
  { code: 'bn', name: 'Brunei Darussalam', tier: 'hard' },
  { code: 'bg', name: 'Bulgaria', tier: 'medium' },
  { code: 'bf', name: 'Burkina Faso', tier: 'hard' },
  { code: 'bi', name: 'Burundi', tier: 'hard' },
  { code: 'cv', name: 'Cabo Verde', tier: 'hard' },
  { code: 'kh', name: 'Cambodia', tier: 'hard' },
  { code: 'cm', name: 'Cameroon', tier: 'easy' },
  { code: 'ca', name: 'Canada', tier: 'easy' },
  { code: 'cf', name: 'Central African Republic', tier: 'hard' },
  { code: 'td', name: 'Chad', tier: 'hard' },
  { code: 'cl', name: 'Chile', tier: 'medium' },
  { code: 'cn', name: 'China', tier: 'medium' },
  { code: 'co', name: 'Colombia', tier: 'medium' },
  { code: 'km', name: 'Comoros', tier: 'hard' },
  { code: 'cr', name: 'Costa Rica', tier: 'easy' },
  { code: 'hr', name: 'Croatia', tier: 'easy' },
  { code: 'cu', name: 'Cuba', tier: 'medium' },
  { code: 'cy', name: 'Cyprus', tier: 'hard' },
  { code: 'cz', name: 'Czech Republic', tier: 'medium' },
  { code: 'ci', name: "Côte d'Ivoire", tier: 'medium' },
  { code: 'cd', name: 'DR Congo', tier: 'hard' },
  { code: 'dk', name: 'Denmark', tier: 'easy' },
  { code: 'dj', name: 'Djibouti', tier: 'hard' },
  { code: 'dm', name: 'Dominica', tier: 'hard' },
  { code: 'do', name: 'Dominican Republic', tier: 'hard' },
  { code: 'ec', name: 'Ecuador', tier: 'easy' },
  { code: 'eg', name: 'Egypt', tier: 'medium' },
  { code: 'sv', name: 'El Salvador', tier: 'hard' },
  { code: 'gb-eng', name: 'England', tier: 'easy' },
  { code: 'gq', name: 'Equatorial Guinea', tier: 'hard' },
  { code: 'er', name: 'Eritrea', tier: 'hard' },
  { code: 'ee', name: 'Estonia', tier: 'medium' },
  { code: 'sz', name: 'Eswatini', tier: 'hard' },
  { code: 'et', name: 'Ethiopia', tier: 'medium' },
  { code: 'fm', name: 'Federated States of Micronesia', tier: 'hard' },
  { code: 'fj', name: 'Fiji', tier: 'hard' },
  { code: 'fi', name: 'Finland', tier: 'medium' },
  { code: 'fr', name: 'France', tier: 'easy' },
  { code: 'ga', name: 'Gabon', tier: 'hard' },
  { code: 'gm', name: 'Gambia', tier: 'hard' },
  { code: 'ge', name: 'Georgia', tier: 'hard' },
  { code: 'de', name: 'Germany', tier: 'easy' },
  { code: 'gh', name: 'Ghana', tier: 'easy' },
  { code: 'gr', name: 'Greece', tier: 'medium' },
  { code: 'gd', name: 'Grenada', tier: 'hard' },
  { code: 'gt', name: 'Guatemala', tier: 'medium' },
  { code: 'gn', name: 'Guinea', tier: 'hard' },
  { code: 'gw', name: 'Guinea-Bissau', tier: 'hard' },
  { code: 'gy', name: 'Guyana', tier: 'hard' },
  { code: 'ht', name: 'Haiti', tier: 'hard' },
  { code: 'hn', name: 'Honduras', tier: 'medium' },
  { code: 'hu', name: 'Hungary', tier: 'medium' },
  { code: 'is', name: 'Iceland', tier: 'medium' },
  { code: 'in', name: 'India', tier: 'medium' },
  { code: 'id', name: 'Indonesia', tier: 'medium' },
  { code: 'ir', name: 'Iran', tier: 'easy' },
  { code: 'iq', name: 'Iraq', tier: 'medium' },
  { code: 'ie', name: 'Ireland', tier: 'medium' },
  { code: 'il', name: 'Israel', tier: 'medium' },
  { code: 'it', name: 'Italy', tier: 'medium' },
  { code: 'jm', name: 'Jamaica', tier: 'medium' },
  { code: 'jp', name: 'Japan', tier: 'easy' },
  { code: 'jo', name: 'Jordan', tier: 'medium' },
  { code: 'kz', name: 'Kazakhstan', tier: 'medium' },
  { code: 'ke', name: 'Kenya', tier: 'medium' },
  { code: 'ki', name: 'Kiribati', tier: 'hard' },
  { code: 'xk', name: 'Kosovo', tier: 'hard' },
  { code: 'kw', name: 'Kuwait', tier: 'medium' },
  { code: 'kg', name: 'Kyrgyzstan', tier: 'hard' },
  { code: 'la', name: 'Laos', tier: 'hard' },
  { code: 'lv', name: 'Latvia', tier: 'medium' },
  { code: 'lb', name: 'Lebanon', tier: 'medium' },
  { code: 'ls', name: 'Lesotho', tier: 'hard' },
  { code: 'lr', name: 'Liberia', tier: 'hard' },
  { code: 'ly', name: 'Libya', tier: 'medium' },
  { code: 'li', name: 'Liechtenstein', tier: 'hard' },
  { code: 'lt', name: 'Lithuania', tier: 'medium' },
  { code: 'lu', name: 'Luxembourg', tier: 'hard' },
  { code: 'mg', name: 'Madagascar', tier: 'hard' },
  { code: 'mw', name: 'Malawi', tier: 'hard' },
  { code: 'my', name: 'Malaysia', tier: 'medium' },
  { code: 'mv', name: 'Maldives', tier: 'hard' },
  { code: 'ml', name: 'Mali', tier: 'hard' },
  { code: 'mt', name: 'Malta', tier: 'hard' },
  { code: 'mh', name: 'Marshall Islands', tier: 'hard' },
  { code: 'mr', name: 'Mauritania', tier: 'hard' },
  { code: 'mu', name: 'Mauritius', tier: 'hard' },
  { code: 'mx', name: 'Mexico', tier: 'easy' },
  { code: 'md', name: 'Moldova', tier: 'hard' },
  { code: 'mc', name: 'Monaco', tier: 'hard' },
  { code: 'mn', name: 'Mongolia', tier: 'hard' },
  { code: 'me', name: 'Montenegro', tier: 'hard' },
  { code: 'ma', name: 'Morocco', tier: 'easy' },
  { code: 'mz', name: 'Mozambique', tier: 'medium' },
  { code: 'mm', name: 'Myanmar', tier: 'medium' },
  { code: 'na', name: 'Namibia', tier: 'hard' },
  { code: 'nr', name: 'Nauru', tier: 'hard' },
  { code: 'np', name: 'Nepal', tier: 'medium' },
  { code: 'nl', name: 'Netherlands', tier: 'easy' },
  { code: 'nz', name: 'New Zealand', tier: 'medium' },
  { code: 'ni', name: 'Nicaragua', tier: 'hard' },
  { code: 'ne', name: 'Niger', tier: 'hard' },
  { code: 'ng', name: 'Nigeria', tier: 'medium' },
  { code: 'kp', name: 'North Korea', tier: 'hard' },
  { code: 'mk', name: 'North Macedonia', tier: 'hard' },
  { code: 'no', name: 'Norway', tier: 'medium' },
  { code: 'om', name: 'Oman', tier: 'medium' },
  { code: 'pk', name: 'Pakistan', tier: 'medium' },
  { code: 'pw', name: 'Palau', tier: 'hard' },
  { code: 'ps', name: 'Palestine', tier: 'hard' },
  { code: 'pa', name: 'Panama', tier: 'medium' },
  { code: 'pg', name: 'Papua New Guinea', tier: 'hard' },
  { code: 'py', name: 'Paraguay', tier: 'medium' },
  { code: 'pe', name: 'Peru', tier: 'medium' },
  { code: 'ph', name: 'Philippines', tier: 'medium' },
  { code: 'pl', name: 'Poland', tier: 'easy' },
  { code: 'pt', name: 'Portugal', tier: 'easy' },
  { code: 'qa', name: 'Qatar', tier: 'easy' },
  { code: 'cg', name: 'Republic of the Congo', tier: 'hard' },
  { code: 'ro', name: 'Romania', tier: 'medium' },
  { code: 'ru', name: 'Russia', tier: 'medium' },
  { code: 'rw', name: 'Rwanda', tier: 'hard' },
  { code: 'kn', name: 'Saint Kitts and Nevis', tier: 'hard' },
  { code: 'lc', name: 'Saint Lucia', tier: 'hard' },
  { code: 'vc', name: 'Saint Vincent and the Grenadines', tier: 'hard' },
  { code: 'ws', name: 'Samoa', tier: 'hard' },
  { code: 'sm', name: 'San Marino', tier: 'hard' },
  { code: 'st', name: 'Sao Tome and Principe', tier: 'hard' },
  { code: 'sa', name: 'Saudi Arabia', tier: 'easy' },
  { code: 'sn', name: 'Senegal', tier: 'easy' },
  { code: 'rs', name: 'Serbia', tier: 'easy' },
  { code: 'sc', name: 'Seychelles', tier: 'hard' },
  { code: 'sl', name: 'Sierra Leone', tier: 'hard' },
  { code: 'sg', name: 'Singapore', tier: 'medium' },
  { code: 'sk', name: 'Slovakia', tier: 'medium' },
  { code: 'si', name: 'Slovenia', tier: 'hard' },
  { code: 'sb', name: 'Solomon Islands', tier: 'hard' },
  { code: 'so', name: 'Somalia', tier: 'hard' },
  { code: 'za', name: 'South Africa', tier: 'medium' },
  { code: 'kr', name: 'South Korea', tier: 'easy' },
  { code: 'ss', name: 'South Sudan', tier: 'hard' },
  { code: 'es', name: 'Spain', tier: 'easy' },
  { code: 'lk', name: 'Sri Lanka', tier: 'medium' },
  { code: 'sd', name: 'Sudan', tier: 'medium' },
  { code: 'sr', name: 'Suriname', tier: 'hard' },
  { code: 'se', name: 'Sweden', tier: 'medium' },
  { code: 'ch', name: 'Switzerland', tier: 'easy' },
  { code: 'sy', name: 'Syria', tier: 'medium' },
  { code: 'tw', name: 'Taiwan', tier: 'hard' },
  { code: 'tj', name: 'Tajikistan', tier: 'hard' },
  { code: 'tz', name: 'Tanzania', tier: 'medium' },
  { code: 'th', name: 'Thailand', tier: 'medium' },
  { code: 'tl', name: 'Timor-Leste', tier: 'hard' },
  { code: 'tg', name: 'Togo', tier: 'hard' },
  { code: 'to', name: 'Tonga', tier: 'hard' },
  { code: 'tt', name: 'Trinidad and Tobago', tier: 'hard' },
  { code: 'tn', name: 'Tunisia', tier: 'easy' },
  { code: 'tm', name: 'Turkmenistan', tier: 'hard' },
  { code: 'tv', name: 'Tuvalu', tier: 'hard' },
  { code: 'tr', name: 'Türkiye', tier: 'medium' },
  { code: 'ug', name: 'Uganda', tier: 'medium' },
  { code: 'ua', name: 'Ukraine', tier: 'medium' },
  { code: 'ae', name: 'United Arab Emirates', tier: 'medium' },
  { code: 'gb', name: 'United Kingdom', tier: 'medium' },
  { code: 'us', name: 'United States', tier: 'easy' },
  { code: 'uy', name: 'Uruguay', tier: 'easy' },
  { code: 'uz', name: 'Uzbekistan', tier: 'medium' },
  { code: 'vu', name: 'Vanuatu', tier: 'hard' },
  { code: 'va', name: 'Vatican City', tier: 'hard' },
  { code: 've', name: 'Venezuela', tier: 'medium' },
  { code: 'vn', name: 'Vietnam', tier: 'medium' },
  { code: 'gb-wls', name: 'Wales', tier: 'easy' },
  { code: 'eh', name: 'Western Sahara', tier: 'hard' },
  { code: 'ye', name: 'Yemen', tier: 'medium' },
  { code: 'zm', name: 'Zambia', tier: 'medium' },
  { code: 'zw', name: 'Zimbabwe', tier: 'medium' },
];
```

- [ ] **Step 3: Write the failing data-integrity test**

```javascript
// tests/countries.test.js
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
```

- [ ] **Step 4: Run the test to verify it fails (before vendoring/data exist)**

Run: `node --test tests/countries.test.js`
Expected: FAIL (module not found, since Steps 1-2 haven't been done yet if following strict TDD) — if Steps 1-2 are already done by the time you run this, skip to Step 5 and confirm PASS instead.

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test tests/countries.test.js`
Expected: PASS, 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add vendor/flag-icons data/countries.js tests/countries.test.js
git commit -m "Add vendored flag SVGs and tiered country data"
```

---

### Task 2: Game logic module (pure functions, unit tested)

**Files:**
- Create: `js/game.js`
- Test: `tests/game.test.js`

**Interfaces:**
- Consumes: `COUNTRIES` from `data/countries.js` (Task 1) — array of `{ code, name, tier }`.
- Produces (all named exports from `js/game.js`):
  - `TIER_ORDER = ['easy', 'medium', 'hard']`
  - `STREAK_TO_UNLOCK = 10`
  - `OPTION_COUNTS = { easy: 4, medium: 6, hard: 8 }`
  - `unlockedTiers(highestUnlockedIndex: number): string[]`
  - `poolForTiers(countries: Array, unlockedTierNames: string[]): Array`
  - `pickRound(countries: Array, highestUnlockedIndex: number, rng?: () => number): { target: {code,name,tier}, options: Array<{code,name,tier}> }`
  - `recordAnswer(state: {streak: number, highestUnlockedIndex: number}, correct: boolean): {streak: number, highestUnlockedIndex: number, justUnlocked: boolean}`
  - Later tasks (3, 4) import `pickRound` and `recordAnswer` and the constants above — do not rename these.

- [ ] **Step 1: Write the failing tests**

```javascript
// tests/game.test.js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/game.test.js`
Expected: FAIL with "Cannot find module '../js/game.js'"

- [ ] **Step 3: Implement `js/game.js`**

```javascript
// js/game.js
export const TIER_ORDER = ['easy', 'medium', 'hard'];
export const STREAK_TO_UNLOCK = 10;
export const OPTION_COUNTS = { easy: 4, medium: 6, hard: 8 };

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
  const canUnlock = streak >= STREAK_TO_UNLOCK && state.highestUnlockedIndex < TIER_ORDER.length - 1;
  const highestUnlockedIndex = canUnlock ? state.highestUnlockedIndex + 1 : state.highestUnlockedIndex;
  return { streak, highestUnlockedIndex, justUnlocked: canUnlock };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/game.test.js`
Expected: PASS, all 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/game.test.js
git commit -m "Add pure game logic module with unit tests"
```

---

### Task 3: Persistence wrapper

**Files:**
- Create: `js/storage.js`
- Test: `tests/storage.test.js`

**Interfaces:**
- Produces: `loadState(storage): {streak: number, highestUnlockedIndex: number}`, `saveState(storage, state): void`, `STORAGE_KEY = 'guess-the-flag:progress'`. `storage` is any object with `getItem(key)`/`setItem(key, value)` (so a fake in-memory object can be passed in tests instead of the real `localStorage`).
- Consumes: nothing from other tasks. Task 5 (main.js) imports `loadState`/`saveState` and calls them with the real `window.localStorage`.

- [ ] **Step 1: Write the failing tests**

```javascript
// tests/storage.test.js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/storage.test.js`
Expected: FAIL with "Cannot find module '../js/storage.js'"

- [ ] **Step 3: Implement `js/storage.js`**

```javascript
// js/storage.js
export const STORAGE_KEY = 'guess-the-flag:progress';

const DEFAULT_STATE = { streak: 0, highestUnlockedIndex: 0 };

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/storage.test.js`
Expected: PASS, all 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add js/storage.js tests/storage.test.js
git commit -m "Add localStorage persistence wrapper with tests"
```

---

### Task 4: Audio module

**Files:**
- Create: `js/audio.js`

**Interfaces:**
- Produces: `playCorrect(): void`, `playWrong(): void`, `playUnlock(): void`, `speak(text: string): void`. All are browser-only (use `AudioContext`/`webkitAudioContext` and `window.speechSynthesis`); no unit tests — verified manually in Task 6.
- Consumes: nothing from other tasks.

This module wraps browser-only APIs (`AudioContext`, `speechSynthesis`) that don't run under Node, so it is verified manually in-browser (Task 6) rather than via `node --test`, consistent with the spec's audio requirements.

- [ ] **Step 1: Implement `js/audio.js`**

```javascript
// js/audio.js
let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function tone(freq, startTime, duration, type = 'sine', gain = 0.2) {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playCorrect() {
  const now = getCtx().currentTime;
  tone(523.25, now, 0.15);       // C5
  tone(659.25, now + 0.1, 0.2);  // E5
  tone(783.99, now + 0.2, 0.3);  // G5
}

export function playWrong() {
  const now = getCtx().currentTime;
  tone(196, now, 0.25, 'triangle', 0.15); // low, gentle
}

export function playUnlock() {
  const now = getCtx().currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(freq, now + i * 0.12, 0.35);
  });
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
```

- [ ] **Step 2: Commit**

```bash
git add js/audio.js
git commit -m "Add synthesized sound effects and speech audio module"
```

---

### Task 5: HTML structure, stadium-theme CSS, and main.js wiring

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `js/main.js`

**Interfaces:**
- Consumes: `COUNTRIES` (Task 1), `pickRound`/`recordAnswer`/`TIER_ORDER` (Task 2), `loadState`/`saveState` (Task 3), `playCorrect`/`playWrong`/`playUnlock`/`speak` (Task 4).
- Produces: the running app. No further tasks depend on this one's internals.

- [ ] **Step 1: Write `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>Guess the Flag</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="hud">
    <div class="tier-badge" id="tier-badge">Easy</div>
    <div class="streak" id="streak-display">🔥 0</div>
  </header>

  <main>
    <h1 class="prompt" id="prompt">Loading…</h1>
    <div class="flag-grid" id="flag-grid"></div>
  </main>

  <div class="confetti-layer" id="confetti-layer"></div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `style.css`**

```css
:root {
  --pitch-green: #1e7d32;
  --pitch-green-dark: #145a24;
  --gold: #ffd54a;
  --white: #ffffff;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background:
    radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 60%),
    repeating-linear-gradient(
      90deg,
      var(--pitch-green) 0 80px,
      var(--pitch-green-dark) 80px 160px
    );
  color: var(--white);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.tier-badge {
  background: var(--gold);
  color: #3a2a00;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.streak {
  font-size: 1.3rem;
  font-weight: 700;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1.5rem;
}

.prompt {
  font-size: clamp(1.8rem, 5vw, 3rem);
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  margin: 0.5rem 0;
}

.flag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 900px;
}

.flag-btn {
  border: 4px solid var(--white);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: var(--white);
  padding: 0;
  aspect-ratio: 4 / 3;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.flag-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.flag-btn:active {
  transform: scale(0.96);
}

.flag-btn.correct {
  box-shadow: 0 0 0 6px var(--gold);
}

.flag-btn.wrong {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 10;
}

.confetti-piece {
  position: absolute;
  top: -10px;
  width: 10px;
  height: 10px;
  opacity: 0.9;
  animation: fall linear forwards;
}

@keyframes fall {
  to {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0.6;
  }
}
```

- [ ] **Step 3: Write `js/main.js`**

```javascript
// js/main.js
import { COUNTRIES } from '../data/countries.js';
import { TIER_ORDER, pickRound, recordAnswer } from './game.js';
import { loadState, saveState } from './storage.js';
import { playCorrect, playWrong, playUnlock, speak } from './audio.js';

const tierBadge = document.getElementById('tier-badge');
const streakDisplay = document.getElementById('streak-display');
const promptEl = document.getElementById('prompt');
const grid = document.getElementById('flag-grid');
const confettiLayer = document.getElementById('confetti-layer');

let state = loadState(window.localStorage);
let currentRound = null;

function tierLabel(index) {
  return TIER_ORDER[index].charAt(0).toUpperCase() + TIER_ORDER[index].slice(1);
}

function render() {
  tierBadge.textContent = tierLabel(state.highestUnlockedIndex);
  streakDisplay.textContent = `🔥 ${state.streak}`;
}

function spawnConfetti(count) {
  const colors = ['#ffd54a', '#ffffff', '#4caf50', '#2196f3', '#ff5252'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1 + Math.random()}s`;
    confettiLayer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

function loadRound() {
  currentRound = pickRound(COUNTRIES, state.highestUnlockedIndex);
  promptEl.textContent = currentRound.target.name;
  speak(currentRound.target.name);

  grid.innerHTML = '';
  for (const country of currentRound.options) {
    const btn = document.createElement('button');
    btn.className = 'flag-btn';
    btn.dataset.code = country.code;
    const img = document.createElement('img');
    img.src = `vendor/flag-icons/flags/4x3/${country.code}.svg`;
    img.alt = country.name;
    btn.appendChild(img);
    btn.addEventListener('click', () => handleGuess(btn, country));
    grid.appendChild(btn);
  }
}

function handleGuess(btn, country) {
  const correct = country.code === currentRound.target.code;

  if (correct) {
    btn.classList.add('correct');
    playCorrect();
    spawnConfetti(20);
  } else {
    btn.classList.add('wrong');
    playWrong();
    setTimeout(() => btn.classList.remove('wrong'), 400);
  }

  const result = recordAnswer(state, correct);
  state = { streak: result.streak, highestUnlockedIndex: result.highestUnlockedIndex };
  saveState(window.localStorage, state);
  render();

  if (result.justUnlocked) {
    playUnlock();
    spawnConfetti(60);
  }

  if (correct) {
    setTimeout(loadRound, 900);
  }
}

render();
loadRound();
```

- [ ] **Step 4: Commit**

```bash
git add index.html style.css js/main.js
git commit -m "Add stadium-theme UI and wire up game rendering"
```

---

### Task 6: Manual browser verification

**Files:** none created — verification only.

- [ ] **Step 1: Serve the app locally**

```bash
python3 -m http.server 8000
```

- [ ] **Step 2: Open `http://localhost:8000` in a browser and verify:**
  - The prompt shows a country name and it's spoken aloud.
  - The flag grid shows 4 flags (Easy tier) and images load correctly (no broken image icons).
  - Tapping the wrong flag shakes it and plays a soft sound; tapping again still works.
  - Tapping the correct flag shows a gold highlight, confetti, a cheerful sound, then auto-advances to a new round.
  - Reload the page — the streak and tier badge persist (via localStorage) instead of resetting.
  - In the browser console, manually verify unlock behavior:

    ```js
    localStorage.setItem('guess-the-flag:progress', JSON.stringify({ streak: 9, highestUnlockedIndex: 0 }));
    location.reload();
    ```

    Then get one more correct answer and confirm the tier badge flips to "Medium", a bigger confetti burst plays, and the flag grid grows to 6 options drawn from both Easy and Medium flags.
  - Resize the browser to a narrow/tall iPad-portrait-like viewport and confirm the flag grid reflows without horizontal scrolling.

- [ ] **Step 3: Fix any issues found, re-verify, then note completion**

No commit needed unless fixes were made — if fixes were made, commit them with a message describing what was fixed.

---

### Task 7: GitHub Pages deployment prep

**Files:**
- Create: `README.md`
- Create: `.gitignore`

**Interfaces:** none — this is packaging/documentation, no code interfaces.

- [ ] **Step 1: Write `.gitignore`**

```
.DS_Store
node_modules/
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Guess the Flag

A World Cup–themed flag-guessing game built for a 6-year-old flag enthusiast.

## Play locally

    python3 -m http.server 8000

Then open http://localhost:8000

## Run tests

    node --test tests/

## Deploy

Push to GitHub and enable GitHub Pages (Settings → Pages → Deploy from branch → main → /root).
Add the resulting URL to the iPad's home screen via Safari's Share → "Add to Home Screen" for a full-screen app feel.
```

- [ ] **Step 3: Commit**

```bash
git add README.md .gitignore
git commit -m "Add README and gitignore for deployment"
```

- [ ] **Step 4: Stop here and hand back to the user/orchestrator**

Creating the actual GitHub repository and pushing code makes the project publicly visible on a shared external system (GitHub). This step requires explicit confirmation before proceeding — do not run `gh repo create` or `git push` without it.

---

## Self-Review Notes

- Spec coverage checked: core loop, tiers/progression, visuals, audio, persistence, tech stack/deployment, and out-of-scope items all map to a task above.
- No placeholders: all code blocks are complete and runnable as written.
- Type/interface consistency checked: `pickRound`, `recordAnswer`, `loadState`/`saveState`, and the audio function names are used identically across Tasks 2-5.
- Scope: single cohesive project, appropriately sized for one plan.
