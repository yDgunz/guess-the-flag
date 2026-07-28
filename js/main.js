import { COUNTRIES } from '../data/countries.js';
import { TIER_ORDER, roundParamsForMode, pickRound, recordAnswer, nextStreak, updateBest } from './game.js';
import { loadState, saveState } from './storage.js';
import { playCorrect, playWrong, playUnlock, speak } from './audio.js';
import { mapCodeFor, paddedViewBox, viewBoxString } from './worldmap.js';

const tierBadge = document.getElementById('tier-badge');
const streakDisplay = document.getElementById('streak-display');
const bestStreakDisplay = document.getElementById('best-streak-display');
const promptEl = document.getElementById('prompt');
const grid = document.getElementById('flag-grid');
const confettiLayer = document.getElementById('confetti-layer');
const modeButtons = document.querySelectorAll('.mode-btn');
const mapBtn = document.getElementById('map-btn');
const mapOverlay = document.getElementById('map-overlay');
const mapClose = document.getElementById('map-close');
const mapCountryName = document.getElementById('map-country-name');
const mapSvgWrap = document.getElementById('map-svg-wrap');

let state = loadState(window.localStorage);
let currentRound = null;
let pendingAdvance = null;
let mapReady = false;

fetch('vendor/svg-maps-world/world.svg')
  .then((r) => r.text())
  .then((svgText) => {
    mapSvgWrap.innerHTML = svgText;
    mapReady = true;
  });

function currentStreak() {
  return state.mode === 'progressive' ? state.progressive.streak : state.practice[state.mode];
}

function tierBadgeLabel() {
  const tierName = state.mode === 'progressive' ? TIER_ORDER[state.progressive.highestUnlockedIndex] : state.mode;
  return tierName.charAt(0).toUpperCase() + tierName.slice(1);
}

function render() {
  tierBadge.textContent = tierBadgeLabel();
  streakDisplay.textContent = `🔥 ${currentStreak()}`;
  bestStreakDisplay.textContent = `🏆 ${state.bestStreaks[state.mode]}`;
  modeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === state.mode);
  });
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

function highlightCountry(code) {
  const svg = mapSvgWrap.querySelector('svg');
  if (!svg) return;
  const prev = svg.querySelector('.map-highlight');
  if (prev) prev.classList.remove('map-highlight');
  const path = svg.querySelector(`#${CSS.escape(mapCodeFor(code))}`);
  if (!path) return;
  path.classList.add('map-highlight');
  const box = paddedViewBox(path.getBBox());
  svg.setAttribute('viewBox', viewBoxString(box));
}

function openMap(target) {
  mapCountryName.textContent = target.name;
  mapOverlay.classList.remove('hidden');
  if (mapReady) highlightCountry(target.code);
}

function closeMapAndAdvance() {
  mapOverlay.classList.add('hidden');
  loadRound();
}

function loadRound() {
  mapBtn.classList.add('hidden');
  const { tiers, optionCount } = roundParamsForMode(state.mode, state.progressive.highestUnlockedIndex);
  currentRound = pickRound(COUNTRIES, tiers, optionCount);
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
    mapBtn.classList.remove('hidden');
  } else {
    btn.classList.add('wrong');
    playWrong();
    setTimeout(() => btn.classList.remove('wrong'), 400);
  }

  let justUnlocked = false;
  let justDemoted = false;
  let streak;
  if (state.mode === 'progressive') {
    const result = recordAnswer(state.progressive, correct);
    state.progressive = { streak: result.streak, misses: result.misses, highestUnlockedIndex: result.highestUnlockedIndex };
    justUnlocked = result.justUnlocked;
    justDemoted = result.justDemoted;
    streak = result.streak;
  } else {
    streak = nextStreak(state.practice[state.mode], correct);
    state.practice[state.mode] = streak;
  }
  state.bestStreaks[state.mode] = updateBest(state.bestStreaks[state.mode], streak);
  saveState(window.localStorage, state);
  render();

  if (justUnlocked) {
    playUnlock();
    spawnConfetti(60);
  }

  if (correct || justDemoted) {
    pendingAdvance = setTimeout(() => {
      pendingAdvance = null;
      loadRound();
    }, 900);
  }
}

mapBtn.addEventListener('click', () => {
  if (pendingAdvance) {
    clearTimeout(pendingAdvance);
    pendingAdvance = null;
  }
  openMap(currentRound.target);
});

mapClose.addEventListener('click', closeMapAndAdvance);
mapOverlay.addEventListener('click', (e) => {
  if (e.target === mapOverlay) closeMapAndAdvance();
});

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === state.mode) return;
    if (pendingAdvance) {
      clearTimeout(pendingAdvance);
      pendingAdvance = null;
    }
    state.mode = btn.dataset.mode;
    saveState(window.localStorage, state);
    render();
    loadRound();
  });
});

render();
loadRound();
