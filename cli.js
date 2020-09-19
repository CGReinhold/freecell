#!/usr/bin/env node
'use strict';
const React = require('react');
const importJsx = require('import-jsx');
const {render} = require('ink');
const meow = require('meow');

const game = importJsx('./src/game');

const cli = meow(`
	Usage
	  $ freecell

	And enjoy the game
`);

render(React.createElement(game, cli.flags));
