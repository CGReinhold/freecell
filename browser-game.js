(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FreecellGame = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ranks = {
    ace: 'A',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    ten: '10',
    jack: 'J',
    queen: 'Q',
    king: 'K',
  };

  const suits = {
    clubs: '♣',
    diamonds: '♦',
    hearts: '♥',
    spades: '♠',
  };

  const rankKeys = Object.values(ranks);

  const isCard = card => Boolean(card && card.rank && card.suit);

  const isNextRank = (card, next) => {
    if (!card || !next || !card.rank || !next.rank) return false;

    return rankKeys.indexOf(card.rank) + 1 === rankKeys.indexOf(next.rank);
  };

  const isOpositeSuite = (card, next) => {
    if (!card || !next || !card.suit || !next.suit) return false;

    const cardIsBlack = card.suit === suits.clubs || card.suit === suits.spades;
    const nextIsBlack = next.suit === suits.clubs || next.suit === suits.spades;

    return cardIsBlack !== nextIsBlack;
  };

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

  const emptySlots = () => [{}, {}, {}, {}];

  const createInitialState = (cards = generateCards()) => ({
    row: 0,
    column: 0,
    selectedCell: null,
    cards,
    freeSpace: emptySlots(),
    finalPile: emptySlots(),
    history: [],
  });

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

  const createHistoryEntry = state => ({
    cards: state.cards,
    freeSpace: state.freeSpace,
    finalPile: state.finalPile,
    row: state.selectedCell ? state.selectedCell.row : state.row,
    column: state.selectedCell ? state.selectedCell.column : state.column,
  });

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

        const moved = moveCards(state);

        return {
          ...moved,
          history: [...(state.history || []), createHistoryEntry(state)],
        };
      }

      case 'undo': {
        const history = state.history || [];

        if (!history.length) return state;

        const previous = history[history.length - 1];

        return {
          ...state,
          row: previous.row,
          column: previous.column,
          selectedCell: null,
          cards: previous.cards,
          freeSpace: previous.freeSpace,
          finalPile: previous.finalPile,
          history: history.slice(0, -1),
        };
      }

      default: {
        throw new Error(`Invalid action: ${action.type}`);
      }
    }
  };

  const isWin = state => {
    return state.finalPile.every(card => isCard(card) && card.rank === ranks.king);
  };

  const foundationCount = state => {
    return state.finalPile.reduce((total, card) => {
      if (!isCard(card)) return total;

      return total + rankKeys.indexOf(card.rank) + 1;
    }, 0);
  };

  return {
    ranks,
    suits,
    rankKeys,
    isCard,
    isNextRank,
    isOpositeSuite,
    isSequence,
    getAllCards,
    shuffle,
    divideInGroups,
    generateCards,
    createInitialState,
    getSelectedCards,
    isSelectable,
    maxMovableCards,
    canMove,
    tableauReducer,
    isWin,
    foundationCount,
  };
});
