// main.ts — the entrypoint for this make.fun entry (Node 22, stdlib only).
// It hands the game in: it copies this repository's game/ and screenshots/
// into the output directory and writes /output/dossier.json with the kit's
// buildDossier library (vendor/makefun-game.ts, copied unchanged).
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs it with /output as the target; MAKEFUN_OUTPUT_DIR stands
// in for /output outside the grader. Both runs must write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

// Caps from the competition gate: at most 4 screenshots of 256 KiB, the
// game tree at most 993 entries / 48 MiB, paths at most 1000 bytes, and the
// dossier text at most 160 KiB. Passing them makes this program refuse an
// entry the scorer would refuse, instead of handing in bad bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
