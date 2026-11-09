'use strict';
const ranks = require('../constants/ranks');
const suits = require('../constants/suits');

const rankKeys = Object.values(ranks);

const isNextRank = (card, next) => {
  if (!card || !next || !card.rank || !next.rank) return false;

  return rankKeys.indexOf(card.rank) + 1 === rankKeys.indexOf(next.rank);
};

const isOpositeSuite = (card, next) => {
  if (!card || !next || !card.suit || !next.suit) return false;

  const cardIsBlack = card.suit === suits.clubs || card.suit === suits.spades;
  const nextIsBlack = next.suit === suits.clubs || next.suit === suits.spades;

  return cardIsBlack !== nextIsBlack;
};

module.exports = {
  isNextRank,
  isOpositeSuite,
};
