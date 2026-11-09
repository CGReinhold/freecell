'use strict';
const React = require('react');
const { Box, Text } = require('ink');
const suits = require('../constants/suits');
const { CARD_WIDTH, cardLines } = require('../utils/cardLines');

const Card = ({ borderColor, rank, suit, marginTop, borderStyle }) => {
  const textColor = suit === suits.diamonds || suit === suits.hearts ? 'red' : 'gray';
  const { top, blank, bottom } = cardLines(rank, suit);

  return React.createElement(
    Box,
    {
      width: CARD_WIDTH,
      height: 7,
      borderStyle,
      flexDirection: 'column',
      borderColor,
      marginTop,
    },
    React.createElement(Text, { color: textColor }, top),
    React.createElement(Text, null, blank),
    React.createElement(Text, null, blank),
    React.createElement(Text, null, blank),
    React.createElement(Text, { color: textColor }, bottom),
  );
};

module.exports = React.memo(Card);
