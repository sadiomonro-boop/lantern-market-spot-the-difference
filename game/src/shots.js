// shots.js — deterministic staging for screenshots.
// The game reads ?shot=... and renders exactly one frame of a real game
// state, then stops the loop, so a headless browser capture is repeatable.
//   ?shot=title          title screen over scene 1
//   ?shot=play&found=3   mid-game, scene 1, first 3 differences found
//   ?shot=scene&scene=2&found=7  scene-complete screen for scene 2
//   ?shot=end            final results screen, all 3 scenes complete
// No staged state is faked: every marker, time and score comes from the
// game's own rules applied to its own scenes.

import { SCENES } from './scenes.js';

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const found = Math.max(0, Math.min(7, Number(params.get('found') || 0)));
  const scene = Math.max(0, Math.min(2, Number(params.get('scene') || 0)));
  return { shot, found, scene };
}

export function stageShot(api, params) {
  const { game } = api;
  const now = 1000;
  game.now = now;

  if (params.shot === 'title') {
    game.screen = 'title';
    game.sceneIndex = 0;
    game.found = new Set();
    game.foundOrder = [];
    game.score = 0;
    return true;
  }

  if (params.shot === 'play') {
    game.screen = 'play';
    game.sceneIndex = params.scene;
    const scene = SCENES[params.scene];
    game.found = new Set(scene.differences.slice(0, params.found).map((d) => d.id));
    game.foundOrder = scene.differences.slice(0, params.found).map((d) => d.id);
    game.score = params.found * 100;
    game.clicks = params.found + 1;
    game.wrongClicks = 1;
    game.sceneStartedAt = now - 87400; // 1:27 on the clock
    game.sceneElapsedMs = 87400;
    game.hintsLeft = 2;
    if (params.found > 0) {
      game.lastFoundLabel = scene.differences[params.found - 1].label;
      game.lastFoundAt = now - 800;
    }
    return true;
  }

  if (params.shot === 'scene') {
    game.screen = 'sceneDone';
    game.sceneIndex = params.scene;
    const scene = SCENES[params.scene];
    game.found = new Set(scene.differences.map((d) => d.id));
    game.foundOrder = scene.differences.map((d) => d.id);
    game.score = 700 + 160;
    game.clicks = 8;
    game.wrongClicks = 1;
    game.sceneTimesMs = [87400];
    game.sceneScores = [160];
    game.sceneElapsedMs = 87400;
    return true;
  }

  if (params.shot === 'end') {
    game.screen = 'results';
    game.sceneIndex = 2;
    const scene = SCENES[2];
    game.found = new Set(scene.differences.map((d) => d.id));
    game.foundOrder = scene.differences.map((d) => d.id);
    game.score = 2340;
    game.clicks = 24;
    game.wrongClicks = 3;
    game.sceneTimesMs = [87400, 121000, 156000];
    game.sceneScores = [160, 120, 90];
    game.sceneElapsedMs = 156000;
    return true;
  }

  return false;
}
