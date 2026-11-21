// input.js — keyboard and mouse state for Lantern Market.
// Mouse: click a panel to mark a difference; click the hint button for a hint.
// Keyboard: arrow keys move a crosshair (shown on both panels), Enter or
// Space marks at the crosshair, H hints, N goes to the next scene,
// R restarts, M mutes, P pauses.

import { CROSSHAIR_START, CROSSHAIR_STEP, PANEL_HEIGHT, PANEL_WIDTH } from './config.js';

export function createInput(canvas) {
  const input = {
    mouseX: 0,
    mouseY: 0,
    mouseInside: false,
    crosshair: { x: CROSSHAIR_START.x, y: CROSSHAIR_START.y },
    crosshairVisible: false,
    // Callbacks the game wires up.
    onClick: null,
    onKey: null,
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('mousemove', (event) => {
    const point = canvasPoint(event);
    input.mouseX = point.x;
    input.mouseY = point.y;
    input.mouseInside = true;
  });

  canvas.addEventListener('mouseleave', () => {
    input.mouseInside = false;
  });

  canvas.addEventListener('click', (event) => {
    const point = canvasPoint(event);
    input.mouseX = point.x;
    input.mouseY = point.y;
    if (input.onClick) input.onClick(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (arrows.includes(key)) {
      event.preventDefault();
      input.crosshairVisible = true;
      if (key === 'ArrowLeft') input.crosshair.x -= CROSSHAIR_STEP;
      if (key === 'ArrowRight') input.crosshair.x += CROSSHAIR_STEP;
      if (key === 'ArrowUp') input.crosshair.y -= CROSSHAIR_STEP;
      if (key === 'ArrowDown') input.crosshair.y += CROSSHAIR_STEP;
      input.crosshair.x = Math.max(0, Math.min(PANEL_WIDTH, input.crosshair.x));
      input.crosshair.y = Math.max(0, Math.min(PANEL_HEIGHT, input.crosshair.y));
      if (input.onKey) input.onKey('move');
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      input.crosshairVisible = true;
      if (input.onKey) input.onKey('mark');
      return;
    }
    const lower = key.toLowerCase();
    if (['h', 'n', 'r', 'm', 'p'].includes(lower)) {
      if (input.onKey) input.onKey(lower);
    }
  });

  return input;
}
