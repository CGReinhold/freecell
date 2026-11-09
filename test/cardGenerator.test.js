'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const generateCards = require('../src/utils/cardGenerator');
const { getAllCards, shuffle, divideInGroups } = generateCards;

const card = (rank, suit) => ({ rank, suit });

test('getAllCards returns the 52 cards of a deck', () => {
  const cards = getAllCards();

  assert.equal(cards.length, 52);
  assert.equal(new Set(cards.map(({ rank, suit }) => `${rank}${suit}`)).size, 52);
});

test('shuffle keeps all cards and accepts an injected random source', () => {
  const cards = getAllCards();
  const shuffled = shuffle([...cards], () => 0.5);

  assert.equal(shuffled.length, 52);
  assert.deepEqual(
    shuffled.map(({ rank, suit }) => `${rank}${suit}`).sort(),
    cards.map(({ rank, suit }) => `${rank}${suit}`).sort(),
  );
});

test('divideInGroups uses the Freecell 7/7/7/7/6/6/6/6 layout', () => {
  const columns = divideInGroups(getAllCards());

  assert.deepEqual(columns.map(column => column.length), [7, 7, 7, 7, 6, 6, 6, 6]);
});

test('divideInGroups rejects incomplete decks', () => {
  assert.throws(() => divideInGroups([card('A', '♠')]), /needs 52 cards/);
});

test('generateCards accepts a deterministic deck without touching the filesystem', () => {
  const deck = getAllCards();
  const columns = generateCards({ deck });

  assert.deepEqual(columns.flat(), deck);
  assert.deepEqual(columns.map(column => column.length), [7, 7, 7, 7, 6, 6, 6, 6]);
});
