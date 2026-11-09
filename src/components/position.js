'use strict';
const React = require('react');
const { Box } = require('ink');
const Card = require('./card');

const Position = ({ card, hovered, selected, marginTop }) => {
  const borderColor = selected ? 'green' : (hovered ? 'yellow' : 'gray');
  const borderStyle = hovered ? 'double' : 'round';

  if (card && card.rank) {
    return React.createElement(Card, {
      rank: card.rank,
      suit: card.suit,
      borderStyle,
      borderColor,
      marginTop,
    });
  }

  return React.createElement(Box, {
    width: 10,
    height: 7,
    paddingX: 1,
    borderStyle,
    flexDirection: 'column',
    borderColor,
    marginTop,
  });
};

module.exports = React.memo(Position);
