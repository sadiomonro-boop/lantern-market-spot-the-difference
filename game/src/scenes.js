// scenes.js — the three night-market scenes and their differences.
// Every picture is drawn in code: no images, no assets. Each scene has one
// draw(ctx, applied) function that paints the base picture, then applies the
// differences whose ids are in `applied` (the right panel). The left panel
// is always drawn with an empty set, so the two panels match except for the
// differences. Each difference is data: an id, a panel position, a click
// radius and a plain-English label shown when it is found.

import { mulberry32, range } from './random.js';

const W = 600;
const H = 540;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width || 2;
  ctx.stroke();
}

function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * rad;
    const py = y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(ctx, str, x, y, size, fill, align, weight) {
  ctx.font = `${weight || 'bold'} ${size}px system-ui, sans-serif`;
  ctx.fillStyle = fill;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// A round paper lantern with a glow, a top cap and a tassel.
function paperLantern(ctx, x, y, r, color, opts) {
  const o = opts || {};
  const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.9);
  glow.addColorStop(0, color);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  ctx.globalAlpha = 1;
  ellipse(ctx, x, y, r, r * 1.12, color);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * Math.abs(Math.cos((i * Math.PI) / 6)) * 0.92, r * 1.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  rect(ctx, x - r * 0.35, y - r * 1.22, r * 0.7, 7, '#3a2a1a');
  if (!o.noTassel) {
    line(ctx, x, y + r * 1.12, x, y + r * 1.55, '#f2b544', 3);
    circle(ctx, x, y + r * 1.62, 4, '#f2b544');
  }
  if (o.stripe) {
    ctx.strokeStyle = '#1d1428';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.55, r * 1.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// A steaming bowl of noodles on a counter.
function noodleBowl(ctx, x, y, steam) {
  ellipse(ctx, x, y, 34, 12, '#b8452c');
  ellipse(ctx, x, y - 6, 30, 10, '#f7ead0');
  ctx.strokeStyle = '#e8a13c';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 20 + i * 14, y - 8);
    ctx.quadraticCurveTo(x - 14 + i * 14, y - 16, x - 6 + i * 14, y - 8);
    ctx.stroke();
  }
  circle(ctx, x + 18, y - 10, 5, '#3d7a3a');
  circle(ctx, x - 18, y - 9, 4, '#e4572e');
  if (steam) {
    ctx.strokeStyle = 'rgba(247,234,208,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 22);
    ctx.quadraticCurveTo(x - 16, y - 36, x - 8, y - 48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 22);
    ctx.quadraticCurveTo(x + 16, y - 36, x + 8, y - 50);
    ctx.stroke();
  }
}

// A sitting cat, tail up or curled down.
function sittingCat(ctx, x, y, tailUp) {
  ellipse(ctx, x, y, 26, 20, '#2b2b3a');
  circle(ctx, x + 14, y - 22, 15, '#2b2b3a');
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 32);
  ctx.lineTo(x + 8, y - 44);
  ctx.lineTo(x + 13, y - 32);
  ctx.closePath();
  ctx.fillStyle = '#2b2b3a';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 16, y - 34);
  ctx.lineTo(x + 21, y - 45);
  ctx.lineTo(x + 25, y - 33);
  ctx.closePath();
  ctx.fill();
  circle(ctx, x + 19, y - 24, 2.5, '#f2b544');
  circle(ctx, x + 9, y - 24, 2.5, '#f2b544');
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tailUp) {
    ctx.moveTo(x - 24, y + 8);
    ctx.quadraticCurveTo(x - 38, y - 6, x - 30, y - 26);
  } else {
    ctx.moveTo(x - 24, y + 8);
    ctx.quadraticCurveTo(x - 36, y + 18, x - 20, y + 20);
  }
  ctx.stroke();
}

// A market vendor: apron, head and a wide hat.
function vendor(ctx, x, y, hatColor) {
  rect(ctx, x - 26, y + 10, 52, 74, '#3d5a80');
  ellipse(ctx, x, y + 84, 30, 10, '#2c4260');
  circle(ctx, x, y - 12, 20, '#e8b98a');
  ctx.beginPath();
  ctx.arc(x, y - 30, 30, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = hatColor;
  ctx.fill();
  ellipse(ctx, x, y - 28, 34, 6, hatColor);
  circle(ctx, x - 7, y - 14, 2.5, '#1d1428');
  circle(ctx, x + 7, y - 14, 2.5, '#1d1428');
  ctx.beginPath();
  ctx.arc(x, y - 6, 6, 0, Math.PI);
  ctx.strokeStyle = '#1d1428';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ---------------------------------------------------------------- scene 1
function drawLanternLane(ctx, applied) {
  const rng = mulberry32(11);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2a1b4d');
  sky.addColorStop(0.55, '#6b3a6e');
  sky.addColorStop(1, '#c96f3f');
  rect(ctx, 0, 0, W, H, sky);
  for (let i = 0; i < 42; i++) {
    circle(ctx, range(rng, 0, W), range(rng, 0, 190), range(rng, 1, 2.6), 'rgba(247,234,208,0.9)');
  }
  // Moon, top right — difference: it vanishes on the right panel.
  if (!applied.has('moon')) {
    circle(ctx, 520, 62, 30, '#f7ead0');
    circle(ctx, 512, 54, 7, '#e0cda8');
    circle(ctx, 530, 70, 5, '#e0cda8');
  }
  // String of bulbs sagging across the top.
  ctx.strokeStyle = '#1d1428';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(300, 96, 600, 30);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bx = t * 600;
    const by = 34 + Math.sin(t * Math.PI) * 44;
    if (applied.has('bulb') && i === 6) continue; // difference: one bulb missing
    circle(ctx, bx, by + 8, 7, ['#f2b544', '#e4572e', '#2ec4b6'][i % 3]);
    line(ctx, bx, by, bx, by + 4, '#1d1428', 2);
  }
  // Row of hanging lanterns.
  const lanternXs = [60, 170, 280, 390, 500];
  const lanternColors = ['#e4572e', '#f2b544', '#e4572e', '#2ec4b6', '#e4572e'];
  if (applied.has('lantern-color')) lanternColors[2] = '#2ec4b6'; // difference: red turns teal
  lanternXs.forEach((lx, i) => {
    line(ctx, lx, 40, lx, 96, '#1d1428', 2);
    paperLantern(ctx, lx, 122, 24, lanternColors[i], {});
  });
  // Street.
  rect(ctx, 0, 420, W, 120, '#4a3550');
  rect(ctx, 0, 420, W, 6, '#5d4468');
  for (let i = 0; i < 8; i++) {
    ellipse(ctx, 40 + i * 74, 500, 26, 5, 'rgba(0,0,0,0.25)');
  }
  // Left stall: tea.
  rect(ctx, 44, 300, 190, 16, '#7a4a2b');
  rect(ctx, 52, 316, 10, 104, '#5d3a22');
  rect(ctx, 216, 316, 10, 104, '#5d3a22');
  rect(ctx, 44, 316, 190, 104, '#8a5a35');
  rect(ctx, 44, 316, 190, 10, '#a06a3e');
  roundRect(ctx, 92, 226, 96, 56, 8, '#f7ead0');
  text(ctx, 'TEA', 140, 250, 26, '#3d2f5b', 'center', 'bold');
  if (!applied.has('sign-star')) star(ctx, 140, 208, 11, '#f2b544'); // difference: star above the sign
  circle(ctx, 90, 300, 12, '#3d7a3a');
  circle(ctx, 120, 302, 12, '#e4572e');
  circle(ctx, 150, 300, 12, '#f2b544');
  // Right stall: fruit baskets.
  rect(ctx, 380, 300, 190, 16, '#7a4a2b');
  rect(ctx, 388, 316, 10, 104, '#5d3a22');
  rect(ctx, 552, 316, 10, 104, '#5d3a22');
  rect(ctx, 380, 316, 190, 104, '#8a5a35');
  rect(ctx, 380, 316, 190, 10, '#a06a3e');
  const basketXs = [420, 480, 540];
  basketXs.forEach((bx, i) => {
    if (applied.has('basket') && i === 1) return; // difference: middle basket gone
    ellipse(ctx, bx, 302, 24, 12, '#5d3a22');
    circle(ctx, bx - 8, 292, 7, ['#e4572e', '#f2b544', '#e4572e'][i]);
    circle(ctx, bx + 6, 290, 7, '#3d7a3a');
    circle(ctx, bx, 284, 6, '#f2b544');
  });
  // Vendor in the middle.
  vendor(ctx, 300, 330, applied.has('hat') ? '#2ec4b6' : '#e4572e'); // difference: hat changes colour
  // Cat on a crate, bottom left.
  rect(ctx, 74, 452, 84, 44, '#6b4a2f');
  rect(ctx, 74, 452, 84, 8, '#8a5a35');
  sittingCat(ctx, 116, 448, !applied.has('tail')); // difference: tail drops
}

// ---------------------------------------------------------------- scene 2
function drawNoodleStall(ctx, applied) {
  const rng = mulberry32(23);
  rect(ctx, 0, 0, W, H, '#5b3a2e');
  rect(ctx, 0, 0, W, 210, '#6e4636');
  for (let i = 0; i < 12; i++) {
    circle(ctx, range(rng, 0, W), range(rng, 20, 180), range(rng, 1.5, 3), 'rgba(247,234,208,0.25)');
  }
  // Awning with stripes across the top.
  for (let i = 0; i < 8; i++) {
    let stripe = i % 2 === 0 ? '#e4572e' : '#f7ead0';
    if (applied.has('awning') && i === 3) stripe = '#2ec4b6'; // difference: one stripe turns teal
    ctx.beginPath();
    ctx.moveTo(i * 75, 0);
    ctx.lineTo((i + 1) * 75, 0);
    ctx.lineTo((i + 1) * 75 + 12, 74);
    ctx.lineTo(i * 75 + 12, 74);
    ctx.closePath();
    ctx.fillStyle = stripe;
    ctx.fill();
  }
  rect(ctx, 0, 74, W, 8, '#3a2a1a');
  // Hanging lantern, left.
  line(ctx, 90, 82, 90, 96, '#1d1428', 2);
  paperLantern(ctx, 90, 124, 26, '#e4572e', { stripe: !applied.has('lantern-stripe') }); // difference: painted ring gone
  // Menu board, right.
  roundRect(ctx, 452, 140, 128, 150, 10, '#2b2118');
  rect(ctx, 462, 150, 108, 130, '#f7ead0');
  text(ctx, 'NOODLES', 516, 172, 17, '#3d2f5b', 'center', 'bold');
  text(ctx, 'Dumplings', 516, 202, 14, '#5b3a2e', 'center', 'normal');
  text(ctx, 'Tea', 516, 226, 14, '#5b3a2e', 'center', 'normal');
  text(ctx, applied.has('price') ? '8 coins' : '5 coins', 516, 258, 16, '#e4572e', 'center', 'bold'); // difference: price 5 -> 8
  // Garlic string hanging on the right.
  line(ctx, 566, 90, 566, 130, '#1d1428', 2);
  const garlicCount = applied.has('garlic') ? 3 : 4; // difference: one garlic bulb gone
  for (let i = 0; i < garlicCount; i++) {
    ellipse(ctx, 566, 142 + i * 22, 9, 12, '#f7ead0');
    line(ctx, 566, 130 + i * 22, 566, 136 + i * 22, '#3d7a3a', 2);
  }
  // Counter and bowls.
  rect(ctx, 0, 400, W, 26, '#8a5a35');
  rect(ctx, 0, 426, W, 114, '#6b4226');
  rect(ctx, 0, 400, W, 6, '#a06a3e');
  const bowlXs = [150, 250, 350, 450];
  bowlXs.forEach((bx, i) => {
    if (applied.has('bowl') && i === 2) return; // difference: third bowl gone
    noodleBowl(ctx, bx, 412, i === 1 && !applied.has('steam')); // difference: steam over bowl 2 gone
  });
  // Chopstick holder.
  roundRect(ctx, 168, 448, 30, 34, 5, '#3a2a1a');
  if (applied.has('chopsticks')) {
    line(ctx, 176, 452, 176, 486, '#e8a13c', 3);
    line(ctx, 190, 452, 190, 486, '#e8a13c', 3);
  } else {
    line(ctx, 172, 452, 184, 486, '#e8a13c', 3);
    line(ctx, 190, 452, 180, 486, '#e8a13c', 3);
  }
  // A sleepy cat under the counter.
  ellipse(ctx, 520, 512, 34, 16, '#2b2b3a');
  circle(ctx, 552, 502, 13, '#2b2b3a');
}

// ---------------------------------------------------------------- scene 3
function drawLanternWorkshop(ctx, applied) {
  const rng = mulberry32(37);
  rect(ctx, 0, 0, W, H, '#3a2f4d');
  rect(ctx, 0, 0, W, 200, '#463a5e');
  // Window with night sky, top right.
  roundRect(ctx, 452, 44, 120, 110, 8, '#1d1428');
  rect(ctx, 462, 54, 100, 90, '#241c38');
  for (let i = 0; i < 8; i++) {
    if (applied.has('window-star') && i === 3) continue; // difference: one window star gone
    const [sx, sy] = [[480, 72], [505, 110], [530, 66], [548, 120], [495, 135], [520, 88], [560, 95], [472, 100]][i];
    star(ctx, sx, sy, 4, '#f7ead0');
  }
  circle(ctx, 540, 78, 14, '#f7ead0');
  line(ctx, 512, 54, 512, 144, '#1d1428', 4);
  line(ctx, 462, 99, 562, 99, '#1d1428', 4);
  // Wall clock.
  circle(ctx, 300, 110, 34, '#f7ead0');
  ctx.strokeStyle = '#3d2f5b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 110, 34, 0, Math.PI * 2);
  ctx.stroke();
  if (applied.has('clock')) {
    line(ctx, 300, 110, 300, 86, '#1d1428', 3);
    line(ctx, 300, 110, 318, 118, '#1d1428', 3);
  } else {
    line(ctx, 300, 110, 300, 86, '#1d1428', 3);
    line(ctx, 300, 110, 322, 110, '#1d1428', 3);
  }
  circle(ctx, 300, 110, 3, '#e4572e');
  // Kite: diamond with a tail.
  ctx.beginPath();
  ctx.moveTo(110, 180);
  ctx.lineTo(140, 220);
  ctx.lineTo(110, 260);
  ctx.lineTo(80, 220);
  ctx.closePath();
  ctx.fillStyle = '#e4572e';
  ctx.fill();
  ctx.strokeStyle = '#f7ead0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 180);
  ctx.lineTo(110, 260);
  ctx.moveTo(80, 220);
  ctx.lineTo(140, 220);
  ctx.stroke();
  const tailLong = !applied.has('kite-tail'); // difference: kite tail is shorter
  line(ctx, 110, 260, 110, tailLong ? 330 : 292, '#f7ead0', 2);
  circle(ctx, 110, 282, 5, '#f2b544');
  if (tailLong) circle(ctx, 110, 310, 5, '#2ec4b6');
  // Shelves with finished lanterns.
  rect(ctx, 30, 330, 540, 12, '#6b4a2f');
  rect(ctx, 30, 200, 540, 12, '#6b4a2f');
  const shelfLanterns = [
    { x: 120, y: 178, color: '#f2b544', tilt: applied.has('shelf-tilt') },
    { x: 240, y: 178, color: '#e4572e', tilt: false },
    { x: 360, y: 178, color: '#2ec4b6', tilt: false },
    { x: 480, y: 178, color: '#e4572e', tilt: false },
  ];
  shelfLanterns.forEach((item) => {
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.tilt) ctx.rotate(0.16); // difference: first shelf lantern leans
    ctx.translate(-item.x, -item.y);
    paperLantern(ctx, item.x, item.y, 20, item.color, { noTassel: true });
    ctx.restore();
  });
  // Big lantern on the lower shelf with a tassel.
  paperLantern(ctx, 450, 300, 24, '#f2b544', { noTassel: applied.has('tassel') }); // difference: tassel gone
  paperLantern(ctx, 120, 300, 22, '#e4572e', {});
  paperLantern(ctx, 250, 300, 22, '#2ec4b6', {});
  // Workbench along the bottom.
  rect(ctx, 0, 420, W, 120, '#5d3a22');
  rect(ctx, 0, 420, W, 8, '#7a4a2b');
  // Paint jars on the bench.
  const jarColors = ['#e4572e', '#2ec4b6', '#f2b544'];
  if (applied.has('paint')) jarColors[0] = '#2ec4b6'; // difference: red paint jar turns teal
  jarColors.forEach((color, i) => {
    const jx = 170 + i * 46;
    roundRect(ctx, jx, 470, 30, 40, 5, color);
    rect(ctx, jx + 4, 462, 22, 8, '#3a2a1a');
  });
  // Brush cup.
  roundRect(ctx, 330, 466, 34, 44, 5, '#3a2a1a');
  const brushCount = applied.has('brushes') ? 2 : 3; // difference: one brush gone
  for (let i = 0; i < brushCount; i++) {
    line(ctx, 338 + i * 10, 470, 336 + i * 10, 440, '#e8a13c', 3);
    circle(ctx, 336 + i * 10, 436, 4, '#e4572e');
  }
  // A half-painted lantern on the bench.
  ellipse(ctx, 480, 492, 34, 22, '#f7ead0');
  ctx.strokeStyle = '#e4572e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(480, 492, 20, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
}

export const SCENES = [
  {
    id: 'lantern-lane',
    name: 'Lantern Lane',
    subtitle: 'Evening on the market street',
    seed: 11,
    draw: drawLanternLane,
    differences: [
      { id: 'lantern-color', x: 280, y: 122, r: 26, label: 'Lantern turned teal' },
      { id: 'moon', x: 520, y: 62, r: 30, label: 'Moon vanished' },
      { id: 'tail', x: 96, y: 448, r: 22, label: "Cat's tail dropped" },
      { id: 'sign-star', x: 140, y: 208, r: 20, label: 'Star left the tea sign' },
      { id: 'basket', x: 480, y: 292, r: 26, label: 'A fruit basket is gone' },
      { id: 'bulb', x: 450, y: 73, r: 16, label: 'A string bulb went dark' },
      { id: 'hat', x: 300, y: 300, r: 24, label: "Vendor's hat changed colour" },
    ],
  },
  {
    id: 'noodle-stall',
    name: 'Noodle Stall',
    subtitle: 'The busiest stall in the market',
    seed: 23,
    draw: drawNoodleStall,
    differences: [
      { id: 'awning', x: 262, y: 38, r: 24, label: 'An awning stripe turned teal' },
      { id: 'lantern-stripe', x: 90, y: 124, r: 24, label: 'Lantern lost its painted ring' },
      { id: 'bowl', x: 350, y: 415, r: 26, label: 'A bowl of noodles is gone' },
      { id: 'steam', x: 250, y: 378, r: 24, label: 'The steam faded away' },
      { id: 'price', x: 516, y: 258, r: 22, label: 'Noodles now cost 8 coins' },
      { id: 'chopsticks', x: 183, y: 465, r: 20, label: 'Chopsticks stand parallel' },
      { id: 'garlic', x: 566, y: 208, r: 22, label: 'A garlic bulb is missing' },
    ],
  },
  {
    id: 'lantern-workshop',
    name: 'Lantern Workshop',
    subtitle: 'Where the lanterns are made',
    seed: 37,
    draw: drawLanternWorkshop,
    differences: [
      { id: 'paint', x: 185, y: 490, r: 16, label: 'Paint jar turned teal' },
      { id: 'kite-tail', x: 110, y: 300, r: 16, label: "Kite's tail is shorter" },
      { id: 'brushes', x: 347, y: 455, r: 16, label: 'A brush is missing' },
      { id: 'window-star', x: 548, y: 120, r: 14, label: 'A star left the window' },
      { id: 'clock', x: 300, y: 110, r: 18, label: 'The clock hands moved' },
      { id: 'tassel', x: 450, y: 340, r: 15, label: 'A lantern lost its tassel' },
      { id: 'shelf-tilt', x: 120, y: 178, r: 16, label: 'A shelf lantern leans' },
    ],
  },
];

// Draw one scene into a panel: `applied` holds the difference ids to apply.
export function drawScenePanel(ctx, scene, applied) {
  ctx.save();
  scene.draw(ctx, applied);
  ctx.restore();
}
