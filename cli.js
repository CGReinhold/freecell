#!/usr/bin/env node
'use strict';
const React = require('react');
const { render } = require('ink');

const Game = require('./src/game');
const { version } = require('./package.json');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  Usage
    $ freecell

  ← ↑ → ↓ to move and [enter] to select the cards
  Ctrl+Z to undo the last move

  Version ${version}
  `);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}

render(React.createElement(Game));
