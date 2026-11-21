// render.js — all drawing of Lantern Market: the HUD, the two picture
// panels with their markers, the crosshair, the hint pulse, and every
// screen (title, scene complete, results, paused). Nothing here changes
// game state; it only paints what game.js holds.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  HINT_PULSE_MS,
  HUD_HEIGHT,
  LEFT_PANEL_X,
  PANEL_HEIGHT,
  PANEL_TOP,
  PANEL_WIDTH,
  RIGHT_PANEL_X,
  SCENE_NAMES,
} from './config.js';
import { SCENES, drawScenePanel } from './scenes.js';
import { isMuted } from './audio.js';

// The clickable hint button in the footer (shared with main.js).
export const HINT_BUTTON = { x: 1060, y: 700, w: 200, h: 56 };

function fmtTime(ms) {
  const total = Math.floor(ms / 1000);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function drawPanelFrame(ctx, x, label) {
  ctx.strokeStyle = COLORS.panelFrame;
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 2, PANEL_TOP - 2, PANEL_WIDTH + 4, PANEL_HEIGHT + 4);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, x, PANEL_TOP - 10);
}

function drawFoundMarker(ctx, panelX, diff, number) {
  const cx = panelX + diff.x;
  const cy = PANEL_TOP + diff.y;
  ctx.beginPath();
  ctx.arc(cx, cy, diff.r + 6, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.foundRing;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, diff.r + 11, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,209,102,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - diff.r - 16, 13, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.foundRing;
  ctx.fill();
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = COLORS.foundNumber;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), cx, cy - diff.r - 15);
}

function drawHintPulse(ctx, panelX, diff, now, startedAt) {
  const progress = (now - startedAt) / HINT_PULSE_MS;
  const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);
  const radius = diff.r + 6 + pulse * 10;
  const cx = panelX + diff.x;
  const cy = PANEL_TOP + diff.y;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.hintRing;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.hintRing;
  ctx.fill();
}

function drawCrosshair(ctx, panelX, crosshair) {
  const cx = panelX + crosshair.x;
  const cy = PANEL_TOP + crosshair.y;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy);
  ctx.lineTo(cx - 8, cy);
  ctx.moveTo(cx + 8, cy);
  ctx.lineTo(cx + 20, cy);
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx, cy - 8);
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx, cy + 20);
  ctx.stroke();
}

function drawWrongFlash(ctx, game) {
  const age = game.now - game.wrongFlashAt;
  if (age > 400 || !game.wrongFlashPos) return;
  const panelX = game.wrongFlashPos.panel === 'left' ? LEFT_PANEL_X : RIGHT_PANEL_X;
  const cx = panelX + game.wrongFlashPos.x;
  const cy = PANEL_TOP + game.wrongFlashPos.y;
  ctx.strokeStyle = COLORS.wrongFlash;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 1 - age / 400;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 10);
  ctx.lineTo(cx + 10, cy + 10);
  ctx.moveTo(cx + 10, cy - 10);
  ctx.lineTo(cx - 10, cy + 10);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawHud(ctx, game, api) {
  ctx.fillStyle = COLORS.hudPanel;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = COLORS.hudBorder;
  ctx.fillRect(0, HUD_HEIGHT - 2, CANVAS_WIDTH, 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText('LANTERN MARKET', 24, 34);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('Spot the Difference', 24, 66);

  const scene = SCENES[game.sceneIndex];
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = COLORS.cream;
  ctx.textAlign = 'center';
  ctx.fillText(`Scene ${game.sceneIndex + 1} of 3 — ${scene.name}`, 640, 30);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(scene.subtitle, 640, 58);

  // The counter: the first thing the judge must see.
  const foundCount = game.found.size;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillStyle = foundCount === 7 ? COLORS.teal : COLORS.cream;
  ctx.textAlign = 'right';
  ctx.fillText(`${foundCount} of 7 found`, 1256, 30);
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(`Time ${fmtTime(api.sceneElapsedMs())}   Score ${game.score}`, 1256, 62);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = COLORS.hintRing;
  ctx.fillText(`Hints: ${game.hintsLeft} left (H)`, 1256, 86);
}

function drawFooter(ctx, game) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('Click a difference on either picture  •  Arrows move the crosshair, Enter marks  •  H hint  •  P pause  •  M mute', 24, 700);
  ctx.fillText(isMuted() ? 'Sound: off (M)' : 'Sound: on (M)', 24, 728);

  // Hint button.
  const b = HINT_BUTTON;
  ctx.fillStyle = game.hintsLeft > 0 ? COLORS.gold : '#5d5266';
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = '#1d1428';
  ctx.textAlign = 'center';
  ctx.fillText(`HINT  (${game.hintsLeft})`, b.x + b.w / 2, b.y + b.h / 2 + 1);

  // Found toast.
  if (game.lastFoundLabel && game.now - game.lastFoundAt < 2600) {
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = COLORS.foundRing;
    ctx.textAlign = 'center';
    ctx.fillText(`Found it — ${game.lastFoundLabel}!  +100`, 640, 728);
  }
}

function drawPanels(ctx, game, api, input) {
  const scene = SCENES[game.sceneIndex];
  const applied = new Set(scene.differences.map((d) => d.id));

  drawPanelFrame(ctx, LEFT_PANEL_X, 'ORIGINAL');
  drawPanelFrame(ctx, RIGHT_PANEL_X, 'SPOT THE CHANGES');

  ctx.save();
  ctx.beginPath();
  ctx.rect(LEFT_PANEL_X, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.clip();
  ctx.translate(LEFT_PANEL_X, PANEL_TOP);
  drawScenePanel(ctx, scene, new Set());
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(RIGHT_PANEL_X, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.clip();
  ctx.translate(RIGHT_PANEL_X, PANEL_TOP);
  drawScenePanel(ctx, scene, applied);
  ctx.restore();

  // Markers on both panels, numbered in the order found.
  game.foundOrder.forEach((id, i) => {
    const diff = scene.differences.find((d) => d.id === id);
    if (!diff) return;
    drawFoundMarker(ctx, LEFT_PANEL_X, diff, i + 1);
    drawFoundMarker(ctx, RIGHT_PANEL_X, diff, i + 1);
  });

  // Hint pulse on both panels.
  const hint = api.hintActive();
  if (hint) {
    drawHintPulse(ctx, LEFT_PANEL_X, hint, game.now, game.hintStartedAt);
    drawHintPulse(ctx, RIGHT_PANEL_X, hint, game.now, game.hintStartedAt);
  }

  // Keyboard crosshair on both panels.
  if (input.crosshairVisible && game.screen === 'play' && !game.paused) {
    drawCrosshair(ctx, LEFT_PANEL_X, input.crosshair);
    drawCrosshair(ctx, RIGHT_PANEL_X, input.crosshair);
  }

  drawWrongFlash(ctx, game);
}

function dimOverlay(ctx) {
  ctx.fillStyle = 'rgba(12,8,22,0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function panelCard(ctx, title, lines, prompt) {
  const cardW = 760;
  const cardH = 120 + lines.length * 44 + 70;
  const x = (CANVAS_WIDTH - cardW) / 2;
  const y = (CANVAS_HEIGHT - cardH) / 2;
  ctx.fillStyle = COLORS.hudPanel;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText(title, CANVAS_WIDTH / 2, y + 52);
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillStyle = COLORS.cream;
  lines.forEach((lineText, i) => {
    ctx.fillText(lineText, CANVAS_WIDTH / 2, y + 116 + i * 44);
  });
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = COLORS.hintRing;
  ctx.fillText(prompt, CANVAS_WIDTH / 2, y + cardH - 40);
}

function drawTitle(ctx, game) {
  dimOverlay(ctx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText('LANTERN MARKET', CANVAS_WIDTH / 2, 190);
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillStyle = COLORS.cream;
  ctx.fillText('Spot the Difference', CANVAS_WIDTH / 2, 250);
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('Two pictures of the night market. Seven changes hide between them.', CANVAS_WIDTH / 2, 310);
  ctx.fillText('Three scenes. Find all 7 in each one — faster finds earn more points.', CANVAS_WIDTH / 2, 342);
  ctx.fillText('Click a difference, or move the crosshair with the arrow keys and press Enter.', CANVAS_WIDTH / 2, 374);
  ctx.fillText('H spends a hint. A wrong click only costs accuracy — keep hunting!', CANVAS_WIDTH / 2, 406);
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillStyle = COLORS.hintRing;
  ctx.fillText('CLICK TO BEGIN', CANVAS_WIDTH / 2, 500);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('Best played with mouse and keyboard  •  No downloads, no network — everything is drawn in code', CANVAS_WIDTH / 2, 560);
}

export function draw(ctx, game, api, input) {
  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (game.screen === 'title') {
    // Show scene 1 behind the title so the first frame already reads as a game.
    drawHud(ctx, game, api);
    drawPanels(ctx, game, api, input);
    drawFooter(ctx, game);
    drawTitle(ctx, game);
    return;
  }

  drawHud(ctx, game, api);
  drawPanels(ctx, game, api, input);
  drawFooter(ctx, game);

  if (game.paused && game.screen === 'play') {
    dimOverlay(ctx);
    panelCard(ctx, 'PAUSED', ['Take a breath — the lanterns will wait.'], 'Press P to keep hunting');
    return;
  }

  if (game.screen === 'sceneDone') {
    const elapsed = game.sceneTimesMs[game.sceneTimesMs.length - 1] || 0;
    const bonus = game.sceneScores[game.sceneScores.length - 1] || 0;
    const sceneName = SCENE_NAMES[game.sceneIndex];
    const next = game.sceneIndex + 1 < SCENES.length ? 'Click or press N for the next scene' : 'Click or press N for your results';
    dimOverlay(ctx);
    panelCard(
      ctx,
      `${sceneName} — Complete!`,
      [
        `All 7 differences found in ${fmtTime(elapsed)}`,
        `Accuracy this game: ${api.accuracy()}%   •   Time bonus: +${bonus}`,
        `Score so far: ${game.score}`,
      ],
      next,
    );
    return;
  }

  if (game.screen === 'results') {
    dimOverlay(ctx);
    panelCard(
      ctx,
      'You found them all!',
      [
        `All 21 differences across 3 scenes`,
        `Final score: ${game.score}   •   Total time: ${fmtTime(api.totalTimeMs())}`,
        `Accuracy: ${api.accuracy()}%   •   Clicks: ${game.clicks}`,
      ],
      'Press R or click to play again',
    );
  }
}
