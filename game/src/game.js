// game.js — the state machine and rules of Lantern Market.
// Screens: title -> play (scene 1..3) -> sceneDone -> play ... -> results.
// A difference is found by clicking (or keyboard-marking) within its radius
// on either panel. Hints pulse one unfound difference. The timer counts up
// per scene; finishing a scene earns a time bonus.

import {
  DIFFERENCES_PER_SCENE,
  HINTS_PER_SCENE,
  HINT_COST,
  HINT_PULSE_MS,
  LEFT_PANEL_X,
  PANEL_HEIGHT,
  PANEL_TOP,
  PANEL_WIDTH,
  POINTS_PER_FIND,
  RIGHT_PANEL_X,
  SCENE_TIME_BONUS_BASE,
  SCENE_TIME_BONUS_PER_SECOND,
} from './config.js';
import { SCENES } from './scenes.js';
import { playFound, playWrong, playHint, playSceneComplete, playFinalFanfare, playClick, ensureAudio } from './audio.js';

export function createGame() {
  const game = {
    screen: 'title',
    sceneIndex: 0,
    found: new Set(),
    foundOrder: [],
    hintsLeft: HINTS_PER_SCENE,
    hintTarget: null,
    hintStartedAt: 0,
    score: 0,
    clicks: 0,
    wrongClicks: 0,
    sceneStartedAt: 0,
    sceneElapsedMs: 0,
    sceneTimesMs: [],
    sceneScores: [],
    totalFound: 0,
    paused: false,
    lastFoundLabel: '',
    lastFoundAt: 0,
    wrongFlashAt: 0,
    wrongFlashPos: null,
    now: 0,
  };

  function scene() {
    return SCENES[game.sceneIndex];
  }

  function startScene(index) {
    game.sceneIndex = index;
    game.found = new Set();
    game.foundOrder = [];
    game.hintsLeft = HINTS_PER_SCENE;
    game.hintTarget = null;
    game.sceneStartedAt = game.now;
    game.sceneElapsedMs = 0;
    game.lastFoundLabel = '';
    game.screen = 'play';
  }

  function startGame() {
    game.score = 0;
    game.clicks = 0;
    game.wrongClicks = 0;
    game.totalFound = 0;
    game.sceneTimesMs = [];
    game.sceneScores = [];
    game.paused = false;
    startScene(0);
  }

  function sceneElapsedMs() {
    if (game.screen === 'play' && !game.paused) return game.now - game.sceneStartedAt;
    return game.sceneElapsedMs;
  }

  function finishScene() {
    const elapsed = sceneElapsedMs();
    const bonus = Math.max(0, SCENE_TIME_BONUS_BASE - Math.round((elapsed / 1000) * SCENE_TIME_BONUS_PER_SECOND));
    game.sceneElapsedMs = elapsed;
    game.sceneTimesMs.push(elapsed);
    game.sceneScores.push(bonus);
    game.score += bonus;
    game.screen = 'sceneDone';
    playSceneComplete();
  }

  function finishGame() {
    game.screen = 'results';
    playFinalFanfare();
  }

  function nextScene() {
    if (game.sceneIndex + 1 < SCENES.length) startScene(game.sceneIndex + 1);
    else finishGame();
  }

  // Convert a canvas point to panel-local coordinates, or null when it is
  // not inside either picture panel. Returns {panel, x, y}.
  function panelPoint(px, py) {
    if (py < PANEL_TOP || py > PANEL_TOP + PANEL_HEIGHT) return null;
    if (px >= LEFT_PANEL_X && px <= LEFT_PANEL_X + PANEL_WIDTH) {
      return { panel: 'left', x: px - LEFT_PANEL_X, y: py - PANEL_TOP };
    }
    if (px >= RIGHT_PANEL_X && px <= RIGHT_PANEL_X + PANEL_WIDTH) {
      return { panel: 'right', x: px - RIGHT_PANEL_X, y: py - PANEL_TOP };
    }
    return null;
  }

  function differenceAt(x, y) {
    for (const diff of scene().differences) {
      if (game.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
    }
    return null;
  }

  function markAt(px, py) {
    if (game.screen !== 'play' || game.paused) return;
    const point = panelPoint(px, py);
    if (!point) return;
    game.clicks++;
    const diff = differenceAt(point.x, point.y);
    if (diff) {
      game.found.add(diff.id);
      game.foundOrder.push(diff.id);
      game.totalFound++;
      game.score += POINTS_PER_FIND;
      game.lastFoundLabel = diff.label;
      game.lastFoundAt = game.now;
      if (game.hintTarget === diff.id) game.hintTarget = null;
      playFound();
      if (game.found.size >= DIFFERENCES_PER_SCENE) finishScene();
    } else {
      game.wrongClicks++;
      game.wrongFlashAt = game.now;
      game.wrongFlashPos = { x: point.x, y: point.y, panel: point.panel };
      playWrong();
    }
  }

  function useHint() {
    if (game.screen !== 'play' || game.paused) return;
    if (game.hintsLeft <= 0) return;
    const remaining = scene().differences.filter((d) => !game.found.has(d.id));
    if (remaining.length === 0) return;
    game.hintsLeft--;
    game.score = Math.max(0, game.score - HINT_COST);
    game.hintTarget = remaining[0].id;
    game.hintStartedAt = game.now;
    playHint();
  }

  function hintActive() {
    if (!game.hintTarget) return null;
    if (game.now - game.hintStartedAt > HINT_PULSE_MS) {
      game.hintTarget = null;
      return null;
    }
    return scene().differences.find((d) => d.id === game.hintTarget) || null;
  }

  function accuracy() {
    if (game.clicks === 0) return 100;
    return Math.round(((game.clicks - game.wrongClicks) / game.clicks) * 100);
  }

  function totalTimeMs() {
    return game.sceneTimesMs.reduce((sum, t) => sum + t, 0);
  }

  function click(px, py) {
    ensureAudio();
    if (game.screen === 'title') {
      playClick();
      startGame();
      return;
    }
    if (game.screen === 'sceneDone') {
      playClick();
      nextScene();
      return;
    }
    if (game.screen === 'results') {
      playClick();
      startGame();
      return;
    }
    markAt(px, py);
  }

  function key(action) {
    ensureAudio();
    if (action === 'move') return;
    if (action === 'mark') {
      if (game.screen === 'title' || game.screen === 'sceneDone' || game.screen === 'results') {
        click(0, 0);
        return;
      }
      return; // main.js converts the crosshair to a canvas point first
    }
    if (action === 'h') useHint();
    if (action === 'n' && game.screen === 'sceneDone') nextScene();
    if (action === 'r') startGame();
    if (action === 'p' && game.screen === 'play') {
      game.paused = !game.paused;
      if (!game.paused) game.sceneStartedAt = game.now - game.sceneElapsedMs;
      else game.sceneElapsedMs = game.now - game.sceneStartedAt;
    }
  }

  function update(now) {
    game.now = now;
    if (game.screen === 'play' && !game.paused) game.sceneElapsedMs = now - game.sceneStartedAt;
  }

  return {
    game,
    scene,
    startGame,
    startScene,
    sceneElapsedMs,
    panelPoint,
    markAt,
    useHint,
    hintActive,
    accuracy,
    totalTimeMs,
    click,
    key,
    update,
    nextScene,
  };
}
