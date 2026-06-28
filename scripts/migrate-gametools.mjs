#!/usr/bin/env node
/**
 * Перенос content/tools/games → content/games/9-031-gametools.
 * Запуск из it-games: node scripts/migrate-gametools.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const toolsGamesDir = path.resolve(repoRoot, '../it-tools/content/tools/games');
const destDir = path.join(repoRoot, 'content/games/9-031-gametools');

const GAMETOOLS = '9-031-gametools';
const GAMES_PATH = `/games/${GAMETOOLS}`;
const GAMES_ORIGIN = 'https://games.spirzen.ru';

function transformText(text) {
  return text
    .replace(/slug: \/tools\/games\//g, `slug: ${GAMES_PATH}/`)
    .replace(/\]\(\/tools\/games\//g, `](${GAMES_PATH}/`)
    .replace(/https:\/\/tools\.spirzen\.ru\/tools\/games\//g, `${GAMES_ORIGIN}${GAMES_PATH}/`)
    .replace(/doc: tools\/games\//g, `doc: games/${GAMETOOLS}/`);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, {recursive: true});
  let count = 0;
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
      continue;
    }
    if (!/\.mdx?$/i.test(entry.name)) {
      if (entry.name === '_category_.json') {
        continue;
      }
      continue;
    }
    const raw = fs.readFileSync(srcPath, 'utf8');
    fs.writeFileSync(destPath, transformText(raw), 'utf8');
    count += 1;
  }
  return count;
}

function main() {
  if (!fs.existsSync(toolsGamesDir)) {
    console.error(`Source missing: ${toolsGamesDir}`);
    process.exit(1);
  }
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, {recursive: true, force: true});
  }
  fs.mkdirSync(destDir, {recursive: true});

  const count = copyDir(toolsGamesDir, destDir);

  fs.writeFileSync(
    path.join(destDir, '_category_.json'),
    `${JSON.stringify(
      {
        label: 'Полезные инструменты',
        position: 3,
        link: {
          type: 'generated-index',
          title: 'Полезные инструменты',
        },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`migrate-gametools: ${count} pages → content/games/${GAMETOOLS}`);
}

main();
