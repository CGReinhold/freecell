'use strict';
const suits = require('../constants/suits');
const ranks = require('../constants/ranks');

const getAllCards = () => {
  return Object.values(suits).flatMap(suit => {
    return Object.values(ranks).map(rank => ({ rank, suit }));
  });
};

const shuffle = (cards, random = Math.random) => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};

const divideInGroups = cards => {
  if (cards.length !== 52) {
    throw new Error(`A Freecell deal needs 52 cards, received ${cards.length}`);
  }

  return [
    cards.slice(0, 7),
    cards.slice(7, 14),
    cards.slice(14, 21),
    cards.slice(21, 28),
    cards.slice(28, 34),
    cards.slice(34, 40),
    cards.slice(40, 46),
    cards.slice(46, 52),
  ];
};

const generateCards = (options = {}) => {
  const { deck, random } = options;

  if (deck) {
    return divideInGroups(deck.map(card => ({ ...card })));
  }

  return divideInGroups(shuffle(getAllCards(), random));
};

module.exports = generateCards;
module.exports.getAllCards = getAllCards;
module.exports.shuffle = shuffle;
module.exports.divideInGroups = divideInGroups;
