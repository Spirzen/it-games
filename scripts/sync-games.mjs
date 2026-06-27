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

const introPath = path.join(dest, 'intro.md');
if (!fs.existsSync(introPath)) {
  fs.writeFileSync(
    introPath,
    `---
title: Игры — о портале
description: Игровая индустрия, game studies и разработка игр — материалы энциклопедии Вселенная IT.
sidebar_label: О портале
---

# Игры

На этом портале собраны материалы spinoff-разделов **игровая индустрия** и **разработка игр** — теория, обзоры, практикумы и интерактивы.

<!-- DOC_CARD_LIST -->
`,
    'utf8',
  );
  count += 1;
}

console.log(`sync-games: ${count} files → content/games, ${assets} assets → public/doc-assets/games`);
