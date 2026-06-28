#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {mirrorMarkdownDir, repoRoot, resolveKnowledgeBaseRoot} from './lib.mjs';
import {mirrorAssetsDir} from './mirror-assets.mjs';

const kb = resolveKnowledgeBaseRoot();
const spinoff = path.join(kb, 'docs/encyclopedia/9-spinoff');
const dest = path.join(repoRoot, 'content/games');
const assetsDest = path.join(repoRoot, 'public/doc-assets/games');

const SOURCES = [
  '9-03-igrovaya-industriya',
  '9-04-razrabotka-igr',
];

const introPath = path.join(dest, 'intro.md');
const gametoolsDir = path.join(dest, '9-031-gametools');
let introBackup = null;
if (fs.existsSync(introPath)) {
  introBackup = fs.readFileSync(introPath, 'utf8');
}
const gametoolsBackupDir = path.join(repoRoot, '.sync-gametools-backup');
if (fs.existsSync(gametoolsDir)) {
  fs.rmSync(gametoolsBackupDir, {recursive: true, force: true});
  fs.cpSync(gametoolsDir, gametoolsBackupDir, {recursive: true});
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, {recursive: true, force: true});
}
if (fs.existsSync(assetsDest)) {
  fs.rmSync(assetsDest, {recursive: true, force: true});
}
fs.mkdirSync(dest, {recursive: true});

let count = 0;
let assets = 0;
for (const folder of SOURCES) {
  const src = path.join(spinoff, folder);
  const target = path.join(dest, folder);
  count += mirrorMarkdownDir(src, target, {copyCategory: true});
  assets += mirrorAssetsDir(src, path.join(assetsDest, folder));
}

const introPathAfter = path.join(dest, 'intro.md');
if (introBackup) {
  fs.writeFileSync(introPathAfter, introBackup, 'utf8');
} else if (!fs.existsSync(introPathAfter)) {
  fs.writeFileSync(
    introPathAfter,
    `---
title: Игры — о портале
description: Игровая индустрия, game studies и разработка игр — материалы, интерактивы и практикумы энциклопедии Вселенная IT.
sidebar_label: О портале
---

## Карта портала

<!-- DOC_CARD_LIST -->
`,
    'utf8',
  );
  count += 1;
}

if (fs.existsSync(gametoolsBackupDir)) {
  fs.cpSync(gametoolsBackupDir, path.join(dest, '9-031-gametools'), {recursive: true});
  fs.rmSync(gametoolsBackupDir, {recursive: true, force: true});
}

console.log(`sync-games: ${count} files → content/games, ${assets} assets → public/doc-assets/games`);
