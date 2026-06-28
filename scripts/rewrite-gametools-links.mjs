#!/usr/bin/env node
/**
 * Замена ссылок tools/games → games/9-031-gametools по workspace.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(__dirname, '../..');

const GAMETOOLS = '9-031-gametools';
const GAMES_PATH = `/games/${GAMETOOLS}`;
const GAMES_ORIGIN = 'https://games.spirzen.ru';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.astro',
  'agent-transcripts',
]);

const EXT = new Set([
  '.md',
  '.mdx',
  '.json',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.astro',
  '.mjs',
  '.css',
]);

const REPLACEMENTS = [
  [/https:\/\/tools\.spirzen\.ru\/tools\/games\//g, `${GAMES_ORIGIN}${GAMES_PATH}/`],
  [/\]\(\/tools\/games\//g, `](${GAMES_PATH}/`],
  [/doc: tools\/games\//g, `doc: games/${GAMETOOLS}/`],
  [/"tools\/games\//g, `"games/${GAMETOOLS}/`],
  [/tools\/games\/4"/g, `games/${GAMETOOLS}/4"`],
  [/tools\/games\/intro"/g, `games/${GAMETOOLS}/intro"`],
  [/tools\/games\/1"/g, `games/${GAMETOOLS}/1"`],
  [/tools\/games\/2"/g, `games/${GAMETOOLS}/2"`],
  [/tools\/games\/3"/g, `games/${GAMETOOLS}/3"`],
  [/tools\/games\/1111"/g, `games/${GAMETOOLS}/1111"`],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXT.has(ext)) {
      continue;
    }
    files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(workspace)) {
  if (file.includes(`${path.sep}9-031-gametools${path.sep}`)) {
    continue;
  }
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.includes('tools/games')) {
    continue;
  }
  let next = raw;
  for (const [pattern, replacement] of REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  if (next !== raw) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
    console.log(path.relative(workspace, file));
  }
}

console.log(`rewrite-gametools-links: ${changed} files updated`);
