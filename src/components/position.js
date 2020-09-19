'use strict';
const React = require('react');
const importJsx = require('import-jsx');
const { Box } = require('ink');
const Card = importJsx('./card');

const Position = ({ card, hovered, selected, marginTop }) => {
  const borderColor = selected ? 'green' : (hovered ? 'yellow' : 'gray');

  if (card) {
    return <Card rank={card.rank} suit={card.suit} borderColor={borderColor} marginTop={marginTop} />;
  }

  return (
    <Box
      width={10}
      height={7}
      paddingX={1}
      borderStyle="single"
      borderStyle="round"
      flexDirection="column"
      borderColor={borderColor}
      marginTop={marginTop}
    >
    </Box>
  )
};

module.exports = Position;
