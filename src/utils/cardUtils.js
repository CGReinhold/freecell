const ranks = require('../constants/ranks');
const suits = require('../constants/suits');

const isNextRank = (card, next) => {
  if (!card || !next) return false;

  const rankKeys = Object.values(ranks);
  return rankKeys.findIndex(x => x === card.rank) + 1 === rankKeys.findIndex(x => x === next.rank);
};

const isOpositeSuite = (card, next) => {
  if (card.suit === suits.clubs || card.suit === suits.spades) {
    return next.suit === suits.diamonds || next.suit === suits.hearts;
  } else {
    return next.suit === suits.clubs || next.suit === suits.spades;
  }
};

module.exports = {
  isNextRank,
  isOpositeSuite
};
