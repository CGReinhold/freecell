'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const browserGame = require('../browser-game');
const original = require('../src/reducers/tableauReducer');
const { getAllCards, shuffle, divideInGroups } = require('../src/utils/cardGenerator');

const createSeededRandom = seed => {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

const createSeededDeck = seed => {
  return divideInGroups(shuffle(getAllCards(), createSeededRandom(seed)));
};

const clone = value => JSON.parse(JSON.stringify(value));

const card = (rank, suit) => ({ rank, suit });

test('the browser game builds the same 7/7/7/7/6/6/6/6 deal', () => {
  const deck = getAllCards();
  const columns = browserGame.generateCards({ deck });

  assert.deepEqual(columns.flat(), deck);
  assert.deepEqual(columns.map(column => column.length), [7, 7, 7, 7, 6, 6, 6, 6]);
});

test('the browser game rejects incomplete decks', () => {
  assert.throws(
    () => browserGame.divideInGroups([card('A', '♠')]),
    /needs 52 cards/,
  );
});

test('the browser reducer matches the terminal reducer for random actions', () => {
  const random = createSeededRandom(24681357);
  const actions = ['up', 'down', 'left', 'right', 'select', 'unselect', 'move', 'undo'];
  const deck = createSeededDeck(424242);
  let browserState = browserGame.createInitialState(clone(deck));
  let terminalState = original.createInitialState(clone(deck));

  for (let iteration = 0; iteration < 4000; iteration++) {
    const action = actions[Math.floor(random() * actions.length)];

    browserState = browserGame.tableauReducer(browserState, { type: action });
    terminalState = original.tableauReducer(terminalState, { type: action });

    assert.deepEqual(browserState, terminalState, `states diverged after action "${action}"`);
  }
});

test('the browser game detects a completed board and counts foundation cards', () => {
  const state = browserGame.createInitialState(createSeededDeck(1));

  assert.equal(browserGame.isWin(state), false);
  assert.equal(browserGame.foundationCount(state), 0);

  const almostWon = {
    ...state,
    finalPile: [card('K', '♠'), card('K', '♥'), card('K', '♦'), card('K', '♣')],
  };

  assert.equal(browserGame.isWin(almostWon), true);
  assert.equal(browserGame.foundationCount(almostWon), 52);
});
