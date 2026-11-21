// config.js — every tuning number for Lantern Market in one place.
// The game is a spot-the-difference hunt: 3 night-market scenes, 7 fair
// differences each, drawn procedurally on canvas. No network, no assets.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

// One picture panel (both panels share these dimensions).
export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 540;
export const PANEL_TOP = 108;
export const LEFT_PANEL_X = 20;
export const RIGHT_PANEL_X = 660;
export const PANEL_GAP = 40;

export const HUD_HEIGHT = 96;
export const FOOTER_TOP = 668;

export const DIFFERENCES_PER_SCENE = 7;
export const HINTS_PER_SCENE = 3;
export const HINT_PULSE_MS = 2200;
export const HINT_COST = 25;

export const POINTS_PER_FIND = 100;
export const SCENE_TIME_BONUS_BASE = 200;
export const SCENE_TIME_BONUS_PER_SECOND = 5;
export const WRONG_CLICK_SHAKE_MS = 160;

export const CROSSHAIR_STEP = 14;
export const CROSSHAIR_START = { x: 300, y: 270 };

// Marker ring drawn around a found difference on both panels.
export const MARKER_RING_WIDTH = 4;
export const MARKER_NUMBER_FONT = 'bold 20px system-ui, sans-serif';

// Colours for the night-market look.
export const COLORS = {
  page: '#171224',
  hudPanel: '#241c38',
  hudBorder: '#4a3a6b',
  cream: '#f7ead0',
  gold: '#f2b544',
  teal: '#2ec4b6',
  coral: '#e4572e',
  muted: '#b8a8d8',
  panelFrame: '#3d2f5b',
  foundRing: '#ffd166',
  foundNumber: '#1d1428',
  hintRing: '#7ef0e2',
  wrongFlash: '#ff5d5d',
};

export const SCENE_NAMES = ['Lantern Lane', 'Noodle Stall', 'Lantern Workshop'];
export const SCENE_SUBTITLES = [
  'Evening on the market street — find 7 changes',
  'The busiest stall in the market — find 7 changes',
  'Where the lanterns are made — find 7 changes, smaller and slyer',
];
