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
    game.score = params.found * 100 - 25; // 3 finds x 100, minus the 25-point hint already spent (hintsLeft 2) = 275
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
    // Scene 1: 20 s -> bonus 200 - 5*20 = 100 (700 finds + 100 = 800).
    // Scene 2: 32 s -> bonus 200 - 5*32 = 40 (700 finds + 40 = 740).
    // Score so far: 800 + 740 = 1540.
    game.score = 1540;
    game.clicks = 8;
    game.wrongClicks = 1;
    game.sceneTimesMs = [20000, 32000];
    game.sceneScores = [100, 40];
    game.sceneElapsedMs = 32000;
    return true;
  }

  if (params.shot === 'end') {
    game.screen = 'results';
    game.sceneIndex = 2;
    const scene = SCENES[2];
    game.found = new Set(scene.differences.map((d) => d.id));
    game.foundOrder = scene.differences.map((d) => d.id);
    // Scenes: 20 s -> +100, 32 s -> +40, 44 s -> max(0, 200 - 5*44) = 0.
    // Finds 21 x 100 = 2100, bonuses 100 + 40 + 0 = 140, total 2240.
    // Total time 20 + 32 + 44 = 96 s = 1:36.
    game.score = 2240;
    game.clicks = 24;
    game.wrongClicks = 3;
    game.sceneTimesMs = [20000, 32000, 44000];
    game.sceneScores = [100, 40, 0];
    game.sceneElapsedMs = 44000;
    return true;
  }

  return false;
}
