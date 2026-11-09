'use strict';
const generateCards = require('../utils/cardGenerator');
const { isNextRank, isOpositeSuite } = require('../utils/cardUtils');
const ranks = require('../constants/ranks');

const isCard = card => Boolean(card && card.rank && card.suit);

const emptySlots = () => [{}, {}, {}, {}];

const createInitialState = (cards = generateCards()) => ({
  row: 0,
  column: 0,
  selectedCell: null,
  cards,
  freeSpace: emptySlots(),
  finalPile: emptySlots(),
});

const defaultState = createInitialState();

const isSequence = cards => {
  if (!cards.length) return false;

  for (let index = 1; index < cards.length; index++) {
    const previous = cards[index - 1];
    const current = cards[index];

    if (!isCard(previous) || !isCard(current)) return false;
    if (!isNextRank(current, previous) || !isOpositeSuite(current, previous)) return false;
  }

  return true;
};

const getSelectedCards = ({ selectedCell, cards, freeSpace, finalPile }) => {
  if (!selectedCell) return [];

  if (selectedCell.row === 0) {
    if (selectedCell.column < 4) {
      const card = freeSpace[selectedCell.column];
      return isCard(card) ? [card] : [];
    }

    const card = finalPile[selectedCell.column - 4];
    return isCard(card) ? [card] : [];
  }

  const column = cards[selectedCell.column];

  if (!column || selectedCell.row < 1 || selectedCell.row > column.length) return [];

  return column.slice(selectedCell.row - 1);
};

const isSelectable = state => {
  const { row, column, cards, freeSpace } = state;

  if (row === 0) {
    if (column < 4) return isCard(freeSpace[column]);

    return false;
  }

  const columnCards = cards[column];

  if (!columnCards || row < 1 || row > columnCards.length) return false;

  return isSequence(columnCards.slice(row - 1));
};

const canPlaceOnFoundation = (foundationCard, card) => {
  if (!isCard(foundationCard)) return card.rank === ranks.ace;

  return foundationCard.suit === card.suit && isNextRank(foundationCard, card);
};

const maxMovableCards = (state, movingToEmptyColumn) => {
  const { cards, freeSpace } = state;
  const emptyFreeCells = freeSpace.filter(cell => !isCard(cell)).length;

  let emptyColumns = cards.filter(column => column.length === 0).length;

  if (movingToEmptyColumn) emptyColumns--;

  emptyColumns = Math.max(0, emptyColumns);

  return (emptyFreeCells + 1) * (2 ** emptyColumns);
};

const canMove = state => {
  const { row, column, selectedCell, cards, freeSpace, finalPile } = state;

  if (!selectedCell) return false;
  if (selectedCell.row === 0 && selectedCell.column >= 4) return false;
  if (selectedCell.row === row && selectedCell.column === column) return false;

  const selectedCards = getSelectedCards(state);

  if (!selectedCards.length || !selectedCards.every(isCard)) return false;
  if (!isSequence(selectedCards)) return false;

  const isMovingGroup = selectedCards.length > 1;

  if (row === 0) {
    if (isMovingGroup) return false;

    if (column < 4) return !isCard(freeSpace[column]);

    return canPlaceOnFoundation(finalPile[column - 4], selectedCards[0]);
  }

  if (selectedCell.row > 0 && selectedCell.column === column) return false;

  const destination = cards[column] || [];

  if (destination.length === 0) {
    return selectedCards.length <= maxMovableCards(state, true);
  }

  const destinationCard = destination[destination.length - 1];

  return (
    isNextRank(selectedCards[0], destinationCard) &&
    isOpositeSuite(selectedCards[0], destinationCard) &&
    selectedCards.length <= maxMovableCards(state, false)
  );
};

const moveCards = state => {
  const { selectedCell, cards, freeSpace, finalPile } = state;
  const selectedCards = getSelectedCards(state);

  const sourceIsTopRow = selectedCell.row === 0;
  const destinationIsTopRow = state.row === 0;

  let nextCards = cards;
  let nextFreeSpace = freeSpace;
  let nextFinalPile = finalPile;

  if (!sourceIsTopRow) {
    nextCards = nextCards.map((column, index) => {
      if (index !== selectedCell.column) return column;

      return column.slice(0, column.length - selectedCards.length);
    });
  }

  if (!destinationIsTopRow) {
    nextCards = nextCards.map((column, index) => {
      if (index !== state.column) return column;

      return [...column, ...selectedCards];
    });
  }

  if (sourceIsTopRow) {
    nextFreeSpace = nextFreeSpace.map((cell, index) => {
      return index === selectedCell.column ? {} : cell;
    });
  }

  if (destinationIsTopRow) {
    if (state.column < 4) {
      nextFreeSpace = nextFreeSpace.map((cell, index) => {
        return index === state.column ? selectedCards[0] : cell;
      });
    } else {
      nextFinalPile = nextFinalPile.map((cell, index) => {
        return index === state.column - 4 ? selectedCards[0] : cell;
      });
    }
  }

  return {
    ...state,
    selectedCell: null,
    cards: nextCards,
    freeSpace: nextFreeSpace,
    finalPile: nextFinalPile,
  };
};

const tableauReducer = (state, action) => {
  const columnLength = state.cards[state.column].length;

  switch (action.type) {
    case 'up': {
      const newRow = state.row === 0 ? columnLength || 1 : Math.max(0, state.row - 1);
      return { ...state, row: newRow };
    }

    case 'down': {
      const newRow = state.row >= (columnLength || 1) ? 0 : state.row + 1;
      return { ...state, row: newRow };
    }

    case 'right': {
      const newColumn = state.column === 7 ? 0 : state.column + 1;
      const maxRow = state.cards[newColumn].length || 1;
      return { ...state, column: newColumn, row: Math.min(state.row, maxRow) };
    }

    case 'left': {
      const newColumn = state.column === 0 ? 7 : state.column - 1;
      const maxRow = state.cards[newColumn].length || 1;
      return { ...state, column: newColumn, row: Math.min(state.row, maxRow) };
    }

    case 'select': {
      if (!isSelectable(state)) return state;

      return { ...state, selectedCell: { row: state.row, column: state.column } };
    }

    case 'unselect': {
      if (!state.selectedCell) return state;

      return { ...state, selectedCell: null };
    }

    case 'move': {
      if (!canMove(state)) return state;

      return moveCards(state);
    }

    default: {
      throw new Error(`Invalid action: ${action.type}`);
    }
  }
};

module.exports = {
  tableauReducer,
  defaultState,
  createInitialState,
  canMove,
  getSelectedCards,
  isSelectable,
  isSequence,
  maxMovableCards,
};
