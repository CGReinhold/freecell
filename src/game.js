'use strict';
const React = require('react');
const { Box, Text } = require('ink');
const Position = require('./components/position');
const useTableau = require('./hooks/useTableau');

const TableauColumn = React.memo(({ cards, hoveredRow, selectedRow }) => {
  const isSelected = cardRow => {
    return selectedRow > 0 && selectedRow <= cardRow;
  };

  if (cards.length === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column' },
      React.createElement(Position, {
        hovered: hoveredRow === 1,
        selected: isSelected(1),
      }),
    );
  }

  return React.createElement(
    Box,
    { flexDirection: 'column' },
    cards.map((card, index) => {
      const cardRow = index + 1;

      return React.createElement(Position, {
        key: `${card.rank}${card.suit}`,
        card,
        hovered: hoveredRow === cardRow,
        selected: isSelected(cardRow),
        marginTop: index ? -5 : 0,
      });
    }),
  );
});

const Game = () => {
  const { row, column, selectedCell, cards, freeSpace, finalPile } = useTableau();
  const selectedRow = selectedCell ? selectedCell.row : -1;
  const selectedColumn = selectedCell ? selectedCell.column : -1;

  const isHovered = (cardRow, cardColumn) => {
    return row === cardRow && column === cardColumn;
  };

  const isSelected = cardColumn => {
    return selectedRow === 0 && selectedColumn === cardColumn;
  };

  const renderTopRow = () => {
    const cells = [];

    freeSpace.forEach((card, index) => {
      cells.push(React.createElement(Position, {
        key: `free-${index}`,
        card,
        hovered: isHovered(0, index),
        selected: isSelected(index),
      }));
    });

    cells.push(React.createElement(Text, { key: 'separator' }, '  '));

    finalPile.forEach((card, index) => {
      const columnNumber = index + 4;

      cells.push(React.createElement(Position, {
        key: `foundation-${index}`,
        card,
        hovered: isHovered(0, columnNumber),
        selected: isSelected(columnNumber),
      }));
    });

    return cells;
  };

  const renderTableau = () => {
    return cards.map((cardChunk, index) => {
      return React.createElement(TableauColumn, {
        key: `column-${index}`,
        cards: cardChunk,
        hoveredRow: column === index && row > 0 ? row : 0,
        selectedRow: selectedColumn === index ? selectedRow : 0,
      });
    });
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Text, null, '← ↑ → ↓ to move and [enter] to select the cards'),
    React.createElement(
      Box,
      { marginX: 1, flexDirection: 'column' },
      React.createElement(Box, null, renderTopRow()),
      React.createElement(Box, { marginX: 1 }, renderTableau()),
    ),
  );
};

module.exports = Game;
