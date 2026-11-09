'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  tableauReducer,
  createInitialState,
  defaultState,
  canMove,
  getSelectedCards,
  isSelectable,
  isSequence,
  maxMovableCards,
} = require('../src/reducers/tableauReducer');
const { getAllCards, shuffle, divideInGroups } = require('../src/utils/cardGenerator');
const rankKeys = Object.values(require('../src/constants/ranks'));

const createSeededRandom = seed => {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

const createSeededState = seed => {
  const deck = shuffle(getAllCards(), createSeededRandom(seed));

  return createInitialState(divideInGroups(deck));
};

const card = (rank, suit) => ({ rank, suit });

const filler = index => [card(['K', 'Q', 'J', '10', '9', '8'][index % 6], '♣')];

const columns = firstColumns => {
  const result = [...firstColumns];

  while (result.length < 8) {
    result.push(filler(result.length));
  }

  return result;
};

const stateWith = (cards, overrides = {}) => {
  return { ...createInitialState(cards), ...overrides };
};

const occupiedFreeCells = () => [
  card('A', '♣'),
  card('A', '♦'),
  card('A', '♥'),
  card('A', '♠'),
];

const freeCellsWith = emptyCount => {
  const cards = occupiedFreeCells();

  for (let index = 0; index < emptyCount; index++) {
    cards[index] = {};
  }

  return cards;
};

const pair = () => [card('7', '♣'), card('6', '♦')];

test('deck generation creates eight columns with all 52 unique cards', () => {
  const { cards } = defaultState;
  const allCards = cards.flat();

  assert.equal(allCards.length, 52);
  assert.deepEqual(cards.map(column => column.length), [7, 7, 7, 7, 6, 6, 6, 6]);
  assert.equal(new Set(allCards.map(({ rank, suit }) => `${rank}${suit}`)).size, 52);
});

test('navigation enters a column at its bottom card and wraps between columns', () => {
  let state = stateWith([[card('5', '♣'), card('4', '♦')], [], [], [], [], [], [], []]);

  state = tableauReducer(state, { type: 'down' });
  assert.equal(state.row, 1);

  state = tableauReducer(state, { type: 'up' });
  assert.equal(state.row, 0);

  state = tableauReducer(state, { type: 'up' });
  assert.equal(state.row, 2);

  state = tableauReducer(state, { type: 'right' });
  assert.equal(state.column, 1);
  assert.equal(state.row, 1);

  state = tableauReducer(state, { type: 'left' });
  assert.equal(state.column, 0);
  assert.equal(state.row, 1);
});

test('horizontal navigation clamps the row to the largest card in the target column', () => {
  let state = stateWith([
    [card('5', '♣'), card('4', '♦'), card('3', '♥')],
    [card('9', '♠')],
    [],
    [],
    [],
    [],
    [],
    [],
  ], { row: 3, column: 0 });

  state = tableauReducer(state, { type: 'right' });
  assert.equal(state.column, 1);
  assert.equal(state.row, 1);
});

test('empty cells and invalid sequences cannot be selected', () => {
  let state = stateWith([[], [], [], [], [], [], [], []]);
  state = tableauReducer(state, { type: 'select' });
  assert.equal(state.selectedCell, null);

  state = stateWith([
    [card('7', '♣'), card('5', '♦')],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ], { row: 1, column: 0 });

  assert.equal(isSelectable(state), false);
  state = tableauReducer(state, { type: 'select' });
  assert.equal(state.selectedCell, null);
});

test('a valid sequence can be selected from any card until the bottom', () => {
  const state = stateWith([
    [card('7', '♣'), card('6', '♦'), card('5', '♠')],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ], { row: 2, column: 0 });

  assert.equal(isSelectable(state), true);
  assert.deepEqual(getSelectedCards({ ...state, selectedCell: { row: 2, column: 0 } }), [
    card('6', '♦'),
    card('5', '♠'),
  ]);
});

test('moving the last card to a free cell updates both cells without mutating the source', () => {
  const original = stateWith([
    [card('5', '♣'), card('4', '♦')],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ], {
    row: 0,
    column: 1,
    selectedCell: { row: 2, column: 0 },
  });
  const snapshot = JSON.parse(JSON.stringify(original));

  const moved = tableauReducer(original, { type: 'move' });

  assert.deepEqual(moved.cards[0], [card('5', '♣')]);
  assert.deepEqual(moved.freeSpace[1], card('4', '♦'));
  assert.equal(moved.selectedCell, null);
  assert.deepEqual(original, snapshot);
});

test('moving a card from a free cell to a tableau clears the free cell', () => {
  const state = stateWith([
    [card('8', '♥')],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ], {
    row: 2,
    column: 0,
    freeSpace: [card('7', '♣'), {}, {}, {}],
    selectedCell: { row: 0, column: 0 },
  });

  const moved = tableauReducer(state, { type: 'move' });

  assert.deepEqual(moved.cards[0], [card('8', '♥'), card('7', '♣')]);
  assert.deepEqual(moved.freeSpace[0], {});
});

test('foundations accept only an ace first and then the same suit in order', () => {
  let state = stateWith([
    [card('A', '♠')],
    [card('2', '♠')],
    [card('2', '♥')],
    [],
    [],
    [],
    [],
    [],
  ], {
    row: 1,
    column: 0,
    selectedCell: { row: 1, column: 0 },
  });

  state = { ...state, row: 0, column: 4 };
  let moved = tableauReducer(state, { type: 'move' });
  assert.deepEqual(moved.finalPile[0], card('A', '♠'));
  assert.deepEqual(moved.cards[0], []);

  state = {
    ...moved,
    row: 1,
    column: 1,
    selectedCell: { row: 1, column: 1 },
  };
  state = { ...state, row: 0, column: 4 };
  moved = tableauReducer(state, { type: 'move' });
  assert.deepEqual(moved.finalPile[0], card('2', '♠'));

  state = {
    ...moved,
    row: 1,
    column: 2,
    selectedCell: { row: 1, column: 2 },
  };
  state = { ...state, row: 0, column: 4 };
  const rejected = tableauReducer(state, { type: 'move' });
  assert.equal(rejected, state);
});

test('cards on the foundations cannot be selected or moved back into play', () => {
  const state = stateWith([
    [card('8', '♥')],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ], {
    row: 0,
    column: 4,
    finalPile: [card('2', '♠'), {}, {}, {}],
  });

  assert.equal(isSelectable(state), false);
  assert.equal(tableauReducer(state, { type: 'select' }), state);

  const attempt = {
    ...state,
    row: 1,
    column: 0,
    selectedCell: { row: 0, column: 4 },
  };

  assert.equal(canMove(attempt), false);
  assert.equal(tableauReducer(attempt, { type: 'move' }), attempt);
});

test('groups cannot be moved to a free cell or a foundation', () => {
  const state = stateWith([
    [card('7', '♣'), card('6', '♦')],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ], {
    row: 0,
    column: 1,
    selectedCell: { row: 1, column: 0 },
  });

  assert.equal(canMove(state), false);
});

test('supermove limit uses empty free cells and empty tableau columns', () => {
  const threeCards = stateWith(columns([
    [card('7', '♣'), card('6', '♦'), card('5', '♠')],
    [card('8', '♥')],
  ]), {
    row: 2,
    column: 1,
    freeSpace: freeCellsWith(1),
    selectedCell: { row: 1, column: 0 },
  });

  assert.equal(maxMovableCards(threeCards, false), 2);
  assert.equal(canMove(threeCards), false);

  const twoCards = stateWith(columns([
    pair(),
    [card('8', '♥')],
  ]), {
    row: 2,
    column: 1,
    freeSpace: freeCellsWith(1),
    selectedCell: { row: 1, column: 0 },
  });

  assert.equal(canMove(twoCards), true);

  const moved = tableauReducer(twoCards, { type: 'move' });
  assert.deepEqual(moved.cards[1], [card('8', '♥'), ...pair()]);
  assert.deepEqual(moved.cards[0], []);
});

test('moving to an empty column does not count the destination as a buffer', () => {
  const rejected = stateWith(columns([pair(), []]), {
    row: 1,
    column: 1,
    freeSpace: freeCellsWith(0),
    selectedCell: { row: 1, column: 0 },
  });

  assert.equal(maxMovableCards(rejected, true), 1);
  assert.equal(canMove(rejected), false);

  const allowed = stateWith(columns([pair(), []]), {
    row: 1,
    column: 1,
    freeSpace: freeCellsWith(1),
    selectedCell: { row: 1, column: 0 },
  });

  assert.equal(maxMovableCards(allowed, true), 2);
  assert.equal(canMove(allowed), true);
});

test('an empty free cell cannot be selected or moved into a tableau column', () => {
  const state = stateWith([[], [], [], [], [], [], [], []]);
  const withSelection = { ...state, selectedCell: { row: 0, column: 0 } };

  assert.equal(isSelectable(state), false);
  assert.deepEqual(getSelectedCards(withSelection), []);
  assert.equal(canMove({ ...withSelection, row: 1, column: 1 }), false);
});

test('a whole column move leaves the source column empty', () => {
  const state = stateWith(columns([pair(), [card('8', '♥')]]), {
    row: 1,
    column: 1,
    freeSpace: freeCellsWith(1),
    selectedCell: { row: 1, column: 0 },
  });

  const moved = tableauReducer(state, { type: 'move' });

  assert.deepEqual(moved.cards[0], []);
  assert.deepEqual(moved.cards[1], [card('8', '♥'), ...pair()]);
});

test('isSequence rejects mismatched ranks and same-color cards', () => {
  assert.equal(isSequence([card('7', '♣'), card('6', '♦')]), true);
  assert.equal(isSequence([card('7', '♣'), card('5', '♦')]), false);
  assert.equal(isSequence([card('7', '♣'), card('6', '♠')]), false);
});

const assertValidState = (state, initialCards) => {
  assert.ok(state.column >= 0 && state.column <= 7);
  assert.ok(state.row >= 0);
  assert.ok(state.row <= (state.cards[state.column].length || 1));

  for (const column of state.cards) {
    for (const cardInColumn of column) {
      assert.equal(typeof cardInColumn.rank, 'string');
      assert.equal(typeof cardInColumn.suit, 'string');
    }
  }

  const locations = [
    ...state.cards.flat(),
    ...state.freeSpace.filter(card => card.rank),
  ];

  for (const card of state.finalPile.filter(card => card.rank)) {
    const topRankIndex = rankKeys.indexOf(card.rank);

    assert.ok(topRankIndex >= 0);

    for (let index = 0; index <= topRankIndex; index++) {
      locations.push({ rank: rankKeys[index], suit: card.suit });
    }
  }

  const locationKeys = locations.map(({ rank, suit }) => `${rank}${suit}`);

  assert.equal(locationKeys.length, 52);
  assert.equal(new Set(locationKeys).size, 52);
  assert.deepEqual([...locationKeys].sort(), [...initialCards].sort());

  if (state.selectedCell) {
    const selectedCards = getSelectedCards(state);
    assert.ok(selectedCards.length > 0);
    assert.equal(isSequence(selectedCards), true);
  }
};

const getSelectablePositions = state => {
  const positions = [];

  for (let column = 0; column < 4; column++) {
    if (state.freeSpace[column].rank) positions.push({ row: 0, column });
  }

  for (let column = 0; column < 8; column++) {
    const cards = state.cards[column];

    for (let row = 1; row <= cards.length; row++) {
      if (isSequence(cards.slice(row - 1))) positions.push({ row, column });
    }
  }

  return positions;
};

test('random actions keep every card in exactly one valid location', () => {
  const random = createSeededRandom(12345);
  const actions = ['up', 'down', 'left', 'right', 'select', 'unselect', 'move'];
  let state = createSeededState(12345);
  const initialCards = state.cards.flat().map(({ rank, suit }) => `${rank}${suit}`);
  let selections = 0;

  for (let iteration = 0; iteration < 3000; iteration++) {
    const action = actions[Math.floor(random() * actions.length)];
    state = tableauReducer(state, { type: action });

    if (action === 'select' && state.selectedCell) selections++;
    assertValidState(state, initialCards);
  }

  assert.ok(selections > 0);
});

test('random legal moves preserve the deck and valid sequences', () => {
  const initialCards = getAllCards().map(({ rank, suit }) => `${rank}${suit}`);

  for (let trial = 0; trial < 10; trial++) {
    const random = createSeededRandom(987654 + trial * 104729);
    let state = createSeededState(7919 + trial);
    let moves = 0;

    for (let iteration = 0; iteration < 1500; iteration++) {
      const positions = getSelectablePositions(state);
      const source = positions[Math.floor(random() * positions.length)];
      const destinationColumn = Math.floor(random() * 8);
      const destinationLength = state.cards[destinationColumn].length;
      const destinationRow = random() < 0.5
        ? 0
        : (destinationLength ? 1 + Math.floor(random() * destinationLength) : 1);

      const attempt = {
        ...state,
        row: destinationRow,
        column: destinationColumn,
        selectedCell: source,
      };
      const moved = tableauReducer(attempt, { type: 'move' });

      if (moved !== attempt) moves++;
      assertValidState(moved, initialCards);
      state = moved;
    }

    assert.ok(moves > 0);
  }
});
