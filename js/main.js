import { COUNTRIES } from '../data/countries.js';
import { TIER_ORDER, roundParamsForMode, pickRound, recordAnswer, nextStreak, updateBest } from './game.js';
import { loadState, saveState } from './storage.js';
import { playCorrect, playWrong, playUnlock, speak } from './audio.js';

const tierBadge = document.getElementById('tier-badge');
const streakDisplay = document.getElementById('streak-display');
const bestStreakDisplay = document.getElementById('best-streak-display');
const promptEl = document.getElementById('prompt');
const grid = document.getElementById('flag-grid');
const confettiLayer = document.getElementById('confetti-layer');
const modeButtons = document.querySelectorAll('.mode-btn');

let state = loadState(window.localStorage);
let currentRound = null;

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

function loadRound() {
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
    setTimeout(loadRound, 900);
  }
}

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === state.mode) return;
    state.mode = btn.dataset.mode;
    saveState(window.localStorage, state);
    render();
    loadRound();
  });
});

render();
loadRound();
