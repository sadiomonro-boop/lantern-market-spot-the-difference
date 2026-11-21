// main.js — wiring and the game loop for Lantern Market.
// Boots the canvas, wires input to the game, runs requestAnimationFrame,
// and stops after one frame in ?shot= mode so screenshots are exact.

import { CANVAS_HEIGHT, CANVAS_WIDTH, LEFT_PANEL_X, PANEL_TOP } from './config.js';
import { createGame } from './game.js';
import { createInput } from './input.js';
import { draw, HINT_BUTTON as HINT_BTN } from './render.js';
import { readShotParams, stageShot } from './shots.js';
import { toggleMute, ensureAudio } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const api = createGame();
const { game } = api;
const input = createInput(canvas);

// Clicking the footer hint button spends a hint instead of marking.
function insideHintButton(x, y) {
  return x >= HINT_BTN.x && x <= HINT_BTN.x + HINT_BTN.w && y >= HINT_BTN.y && y <= HINT_BTN.y + HINT_BTN.h;
}

input.onClick = (x, y) => {
  if (game.screen === 'play' && insideHintButton(x, y)) {
    api.useHint();
    return;
  }
  api.click(x, y);
};

input.onKey = (action) => {
  if (action === 'mark') {
    if (game.screen === 'play') {
      // Keyboard mark: the crosshair sits in panel space; mark the left panel.
      api.markAt(LEFT_PANEL_X + input.crosshair.x, PANEL_TOP + input.crosshair.y);
    } else {
      api.click(0, 0);
    }
    return;
  }
  if (action === 'm') {
    toggleMute();
    return;
  }
  api.key(action);
};

const shotParams = readShotParams();
const staged = shotParams ? stageShot(api, shotParams) : false;
if (staged) {
  // Frame the game edge to edge for screenshots: hide the page caption and
  // let the canvas use the full viewport.
  const fallback = document.getElementById('fallback');
  if (fallback) fallback.style.display = 'none';
  canvas.style.maxWidth = '100vw';
  canvas.style.maxHeight = '100vh';
}

function frame(now) {
  api.update(now);
  draw(ctx, game, api, input);
  if (staged) {
    window.__shotDone = true;
    return; // screenshot mode: one exact frame, then stop
  }
  requestAnimationFrame(frame);
}

ensureAudio();
requestAnimationFrame(frame);

// Expose a tiny handle for headless play-testing (click a difference, read state).
window.__lanternMarket = { api, game, input, canvas };
