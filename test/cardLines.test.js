'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const { CARD_WIDTH, CONTENT_WIDTH, cardLines } = require('../src/utils/cardLines');

test('card width leaves an eight column interior', () => {
  assert.equal(CARD_WIDTH, 10);
  assert.equal(CONTENT_WIDTH, 8);
});

test('every card line fills the whole interior so cards are opaque', () => {
  const lines = cardLines('K', '♠');

  assert.deepEqual(Object.keys(lines), ['top', 'blank', 'bottom']);

  for (const line of Object.values(lines)) {
    assert.equal(line.length, CONTENT_WIDTH);
  }

  assert.equal(lines.blank, ' '.repeat(CONTENT_WIDTH));
});

test('the same rank and suit are shown on the top left and bottom right', () => {
  const lines = cardLines('10', '♦');

  assert.equal(lines.top, '10♦     ');
  assert.equal(lines.bottom, '     10♦');
  assert.equal(lines.top.trim(), lines.bottom.trim());
});

test('cards keep the two corner labels free of a mirrored copy', () => {
  const lines = cardLines('A', '♣');

  assert.equal(lines.top.trim(), 'A♣');
  assert.equal(lines.bottom.trim(), 'A♣');
  assert.ok(!lines.bottom.includes('♣A'));
});
