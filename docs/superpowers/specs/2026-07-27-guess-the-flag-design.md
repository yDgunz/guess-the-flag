# Guess the Flag — Design Spec

**Date:** 2026-07-27
**Status:** Approved

## Overview

A single-page web game for a 6-year-old to practice recognizing national flags, played on an iPad via Safari (added to the home screen). A country name is shown; the player taps the matching flag from a grid of options. Themed around the World Cup, since that's what sparked his interest.

## Core Gameplay Loop

- Header shows the current difficulty tier badge and the current first-try streak count.
- Main area shows the target country's name (large text) plus a grid of flag options:
  - Easy: 4 options
  - Medium: 6 options
  - Hard: 8 options
- The country name is also read aloud via the browser's built-in text-to-speech (Web Speech API `SpeechSynthesisUtterance`) when the round loads.
- Correct tap: flag briefly highlights, a confetti/cheer animation plays, short pause, then the next round loads automatically.
- Incorrect tap: the tapped flag shakes/dims briefly; no penalty, no round-ending; the player keeps guessing until they tap the correct flag. An incorrect tap resets the in-progress streak counter (see Progression) but does not end or restart the round itself.
- The correct flag is never revealed automatically — the player always finds it themselves.

## Difficulty Tiers & Progression

Three tiers, defined by real-world recognizability:

- **Easy** (~32 flags): nations that qualified for the 2022 FIFA World Cup.
- **Medium** (~70 flags): other populous / commonly-seen countries (e.g. G20 members, large-population countries, other Olympic-recognizable nations).
- **Hard** (~90+ flags): all remaining UN member states, including less commonly recognized flags.

Tier membership is stored as static data (`data/countries.js` or `.json`) with each country tagged with a `tier` field. This is a first-pass curation and can be hand-tuned later without any code changes.

**Unlock rule:** Getting **10 correct answers in a row on the first try** unlocks the next tier. A wrong tap resets the streak counter to zero but does **not** undo an already-unlocked tier.

**Tier mixing:** Once a tier is unlocked, rounds are drawn from **all currently unlocked tiers combined** (not just the newest one), so previously-learned flags keep showing up.

**Persistence:** Unlocked tier(s) and current streak are saved to `localStorage` so progress survives closing Safari or restarting the iPad. No accounts/login.

## Visual Design

World Cup stadium theme:
- Green pitch-style gradient background with subtle stadium-light accents.
- Ball and trophy motifs used as decorative elements.
- Large, bold, rounded flag tiles sized for easy tapping by small hands.
- Confetti burst animation on each correct answer; a bigger celebration (more confetti + distinct sound) when a new tier unlocks.

## Audio

- Short sound effect on correct answer (cheerful chime).
- Short, gentle sound effect on incorrect tap (soft, non-punishing).
- Distinct celebratory sound when a tier unlocks.
- Spoken country name via Web Speech API on each new round (no audio files needed for this part).

## Data & Assets

- Flag images: bundled SVGs from the open-source `flag-icons` library (MIT licensed), vendored into the repo (not loaded from a CDN) so the game works reliably regardless of network conditions once loaded.
- Country/tier data: a single static JS/JSON file mapping ISO country code → display name → tier.

## Tech Stack & Deployment

- Plain HTML, CSS, and vanilla JavaScript. No framework, no build step — keeps the project simple to maintain and trivial to deploy.
- Hosted on **GitHub Pages**, served from the repo directly.
- Playable by adding the deployed URL to the iPad's home screen (via Safari's "Add to Home Screen"), so it opens full-screen like a native app.

## Out of Scope (for now)

- User accounts or multiplayer.
- Timers or lives/limited attempts.
- Continent-based filtering or map-based question modes.
- Manual tier selection UI (progression is automatic and cumulative).

These can be revisited later if desired, but are intentionally excluded from this first version.
