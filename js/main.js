import { COUNTRIES } from '../data/countries.js';
import { TIER_ORDER, pickRound, recordAnswer } from './game.js';
import { loadState, saveState, DEFAULT_STATE } from './storage.js';
import { playCorrect, playWrong, playUnlock, speak } from './audio.js';

const tierBadge = document.getElementById('tier-badge');
const streakDisplay = document.getElementById('streak-display');
const promptEl = document.getElementById('prompt');
const grid = document.getElementById('flag-grid');
const confettiLayer = document.getElementById('confetti-layer');
const resetBtn = document.getElementById('reset-btn');

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

resetBtn.addEventListener('click', () => {
  if (!window.confirm('Restart from Easy? This clears the current streak and unlocked tiers.')) return;
  state = { ...DEFAULT_STATE };
  saveState(window.localStorage, state);
  render();
  loadRound();
});

render();
loadRound();
