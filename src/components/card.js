'use strict';
const React = require('react');
const { Box, Text } = require('ink');
const suits = require('../constants/suits');

const Card = ({ borderColor, rank, suit, marginTop, borderStyle }) => {
  const textColor = suit === suits.diamonds || suit === suits.hearts ? "red" : "gray";
  return (
    <Box
      width={10}
      height={7}
      borderStyle={borderStyle}
      flexDirection="column"
      borderColor={borderColor}
      marginTop={marginTop}
    >
      <Box>
        <Text color={textColor}>
          {rank}
          {suit}
          {"      "}
          {"      "}
          {"      "}
          {"      "}
          {"      "}
          {"      "}
        </Text>
      </Box>
      <Box justifyContent="flex-end">
        <Text color={textColor}>
          {suit}
          {rank}
        </Text>
      </Box>
    </Box>
  )
};

module.exports = Card;
