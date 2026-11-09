'use strict';

const CARD_WIDTH = 10;
const CONTENT_WIDTH = CARD_WIDTH - 2;

const cardLines = (rank, suit) => {
  const label = `${rank}${suit}`;
  const padding = ' '.repeat(Math.max(0, CONTENT_WIDTH - label.length));
  const blank = ' '.repeat(CONTENT_WIDTH);

  return {
    top: `${label}${padding}`,
    blank,
    bottom: `${padding}${label}`,
  };
};

module.exports = {
  CARD_WIDTH,
  CONTENT_WIDTH,
  cardLines,
};
