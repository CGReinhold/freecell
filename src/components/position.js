'use strict';
const React = require('react');
const importJsx = require('import-jsx');
const { Box } = require('ink');
const Card = importJsx('./card');

const Position = ({ card, hovered, selected, marginTop }) => {
  const borderColor = selected ? 'green' : (hovered ? 'yellow' : 'gray');
  const borderStyle = hovered ? 'double' : 'round';

  if (card) {
    return (
      <Card
        rank={card.rank}
        suit={card.suit}
        borderStyle={borderStyle}
        borderColor={borderColor}
        marginTop={marginTop}
      />
    );
  }

  return (
    <Box
      width={10}
      height={7}
      paddingX={1}
      borderStyle={borderStyle}
      flexDirection="column"
      borderColor={borderColor}
      marginTop={marginTop}
    >
    </Box>
  )
};

module.exports = Position;
