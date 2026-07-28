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
