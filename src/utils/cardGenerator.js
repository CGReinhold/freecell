const suits = require('../constants/suits');
const ranks = require('../constants/ranks');

const generateCards = () => {
  const cards = getAllCards();
  const shuffledCards = shuffle(cards);
  return divideInGroups(shuffledCards);
};

const getAllCards = () => {
  return Object.keys(suits).map(suit => {
    return Object.keys(ranks).map(rank => {
      return { rank: ranks[rank], suit: suits[suit] };
    });
  }).flat();
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const divideInGroups = (cards) => {
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
}

module.exports = generateCards;