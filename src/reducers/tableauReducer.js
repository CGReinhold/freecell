
'use strict';
const generateCards = require('../utils/cardGenerator');
const { isNextRank, isOpositeSuite } = require('../utils/cardUtils');
const suits = require('../constants/suits');
const ranks = require('../constants/ranks');

// TODO:
// - implementar ctrl-z
// - implementar função para jogar todas cartas validas para o final pile
// - adicionar typescript
// - adicionar testes
// - mover para uma coluna expecífica utilizando apenas números
// - retirar cartas do finalPile
// - colocar mensagem de vitória caso conclua o jogo

const defaultState = {
  row: 0,
  column: 0,
  selectedCell: {},
  cards: generateCards(),
  freeSpace: [{}, {}, {}, {}],
  finalPile: [{}, {}, {}, {}],
}

const tableauReducer = (state, action) => {
  const columnLength = state.cards[state.column].length;
  const isFreeSpace = state.row === 0 && state.column < 4;
  const isFreeSpaceCard = isFreeSpace && Boolean(state.freeSpace[state.column].rank);
  const isFinalPile = state.row === 0 && state.column > 3;
  const isFinalPileCard = isFinalPile && Boolean(state.finalPile[state.column - 4].rank);
  const hasSequenceBelow = isOnSequency(state.row, state.cards[state.column]);

  switch (action.type) {
    case 'up': {
      const newRow = state.row === 0 ? columnLength || 1 : state.row - 1;
      return { ...state, row: newRow };
    }
    case 'down': {
      const newRow = state.row === (columnLength || 1) ? 0 : state.row + 1;
      return { ...state, row: newRow };
    }
    case 'right': {
      const newColumn = state.column === 7 ? 0 : state.column + 1;
      const newRow = state.cards[newColumn].length < state.row ? state.cards[newColumn].length || 1 : state.row;
      return { ...state, column: newColumn, row: newRow };
    }
    case 'left': {
      const newColumn = state.column === 0 ? 7 : state.column - 1;
      const newRow = state.cards[newColumn].length < state.row ? state.cards[newColumn].length || 1 : state.row;
      return { ...state, column: newColumn, row: newRow }
    }
    case 'select': {
      if (!isFreeSpaceCard && !isFinalPileCard && !hasSequenceBelow) {
        return { ...state, selectedCell: {} };
      }

      return { ...state, selectedCell: { row: state.row, column: state.column } };
    }
    case 'unselect': {
      return { ...state, selectedCell: {} };
    }
    case 'move': {
      if (!canMove(state)) return state;
      
      const { selectedCell, freeSpace, finalPile, cards } = state;

      if (selectedCell.row === undefined) return state;

      const selectedCards = getAllSelectedCards(state);

      const newFreeSpace = freeSpace.map((current, index) => {
        if (selectedCell.row !== 0 && state.row !== 0) return current;
        if (selectedCell.row === 0 && selectedCell.column === index) return {};

        if (state.row === 0 && state.column === index && !current.rank) return selectedCards[0] || {};

        return current;
      });

      const newFinalPile = finalPile.map((current, index) => {
        if (selectedCell.row !== 0 && state.row !== 0) return current;
        if (selectedCell.row === 0 && selectedCell.column - 4 === index) return {};

        if (state.row === 0 && state.column - 4 === index) return selectedCards[0] || {};

        return current;
      });

      const newCards = cards.map((column, columnIndex) => {
        if (selectedCell.column !== columnIndex && state.column !== columnIndex) return column;

        if (selectedCell.column === columnIndex && selectedCell.row !== 0) return column.splice(0, column.length - selectedCards.length);

        if (state.row === 0) return column;

        if (state.column === columnIndex) return [...column, ...selectedCards];

        return column;
      });

      return {
        ...state,
        selectedCell: {},
        freeSpace: newFreeSpace,
        finalPile: newFinalPile,
        cards: newCards,
      };
    }
    default: {
      throw new Error('Invalid');
    }
  }
}

const isOnSequency = (rowIndex, column) => {
  if (column.length < rowIndex) return false;
  if (column.length === rowIndex) return true;

  let currentCard = column[rowIndex - 1];

  for (let i = rowIndex; i < column.length; i++) {
    if (!isNextRank(column[i], currentCard) || !isOpositeSuite(currentCard, column[i])) {
      return false;
    }

    currentCard = column[i];
  }

  return true;
};

const getAllSelectedCards = ({ selectedCell, cards, freeSpace, finalPile }) => {
  if (selectedCell.row === 0 && selectedCell.column < 4) return [freeSpace[selectedCell.column]];

  if (selectedCell.row === 0 && selectedCell.column > 3) return [finalPile[selectedCell.column - 4]];

  return cards[selectedCell.column].slice(selectedCell.row - 1);
}


const canMove = (state) => {
  const { row, column, selectedCell, cards, freeSpace, finalPile } = state;

  if (selectedCell.row === undefined) return false;
  
  const currentColumnLength = cards[column].length;
  const lastCardOnColumn = currentColumnLength === 0 ? null : cards[column][currentColumnLength - 1]
  const isMovingGroup = selectedCell.row > 0 && cards[selectedCell.column].length > selectedCell.row;
  const selectedCards = getAllSelectedCards(state);
  const selectedCard = selectedCards[0];

  if (row === 0) {
    if (isMovingGroup) return false;

    if (column < 4) return !freeSpace[column].rank;
    if (!finalPile[column - 4].rank) return selectedCard.rank === ranks.ace;
    
    return selectedCard.suit === finalPile[column - 4].suit && isNextRank(finalPile[column - 4], selectedCard);
  }

  const freeSpaceCount = freeSpace.reduce((acc, space) => space.rank ? acc + 1 : acc, 0);
  let emptyColumnCount = cards.reduce((acc, column) => column.length === 0 ? acc + 1 : acc , 0);
  if (!lastCardOnColumn) emptyColumnCount--;

  let maxAllowedGroupMovement = (freeSpaceCount + emptyColumnCount) * (emptyColumnCount + 1)

  if (selectedCard.length > maxAllowedGroupMovement) return false;

  return !lastCardOnColumn || (isNextRank(selectedCard, lastCardOnColumn) && isOpositeSuite(selectedCard, lastCardOnColumn));
}

module.exports = {
  tableauReducer,
  defaultState
};
