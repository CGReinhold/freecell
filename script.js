(function () {
  'use strict';

  const Game = window.FreecellGame;

  const CARD_WIDTH = 10;
  const CARD_CONTENT_WIDTH = CARD_WIDTH - 2;
  const FREE_CELLS = 4;
  const FOUNDATIONS = 4;
  const COLUMNS = 8;

  const ROUND_BORDER = {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
  };

  const DOUBLE_BORDER = {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
  };

  const SUIT_NAMES = {
    '♣': 'paus',
    '♦': 'ouros',
    '♥': 'copas',
    '♠': 'espadas',
  };

  const RANK_NAMES = {
    A: 'ás',
    2: 'dois',
    3: 'três',
    4: 'quatro',
    5: 'cinco',
    6: 'seis',
    7: 'sete',
    8: 'oito',
    9: 'nove',
    10: 'dez',
    J: 'valete',
    Q: 'dama',
    K: 'rei',
  };

  const dom = {};
  let state = Game.createInitialState();
  let moves = 0;
  let message = '';

  function byId(id) {
    return document.getElementById(id);
  }

  function isRed(card) {
    return card.suit === Game.suits.diamonds || card.suit === Game.suits.hearts;
  }

  function cardLabel(card) {
    return `${card.rank}${card.suit}`;
  }

  function cardDescription(card) {
    return `Carta ${RANK_NAMES[card.rank]} de ${SUIT_NAMES[card.suit]}`;
  }

  function line(content) {
    return `<span class="card__line">${content}</span>`;
  }

  function cardMarkup(card, doubleBorder) {
    const border = doubleBorder ? DOUBLE_BORDER : ROUND_BORDER;
    const top = border.topLeft + border.horizontal.repeat(CARD_CONTENT_WIDTH) + border.topRight;
    const bottom = border.bottomLeft + border.horizontal.repeat(CARD_CONTENT_WIDTH) + border.bottomRight;
    const blank = border.vertical + ' '.repeat(CARD_CONTENT_WIDTH) + border.vertical;

    if (!card || !card.rank) {
      return [top, blank, blank, blank, blank, blank, bottom].map(line).join('');
    }

    const label = cardLabel(card);
    const padding = ' '.repeat(Math.max(0, CARD_CONTENT_WIDTH - label.length));
    const labelClass = isRed(card) ? 'card__label card__label--red' : 'card__label';
    const topLine = border.vertical
      + `<span class="${labelClass}">${label}</span>`
      + padding
      + border.vertical;
    const bottomLine = border.vertical
      + padding
      + `<span class="${labelClass}">${label}</span>`
      + border.vertical;

    return [top, topLine, blank, blank, blank, bottomLine, bottom].map(line).join('');
  }

  function positionElement(options) {
    // Cards are pictures made of text: the ASCII art stays hidden from assistive
    // technology and the aria-label carries the readable description. Using an
    // image role (instead of a button) also keeps the visible text from being
    // announced twice by screen readers.
    const element = document.createElement('div');
    element.className = 'card';
    element.setAttribute('role', 'img');

    if (options.stacked) element.classList.add('card--stacked');
    if (options.empty) element.classList.add('card--empty');
    if (options.selected) element.classList.add('card--selected');
    if (options.cursor) element.classList.add('card--cursor');

    element.dataset.row = String(options.row);
    element.dataset.column = String(options.column);
    element.setAttribute('aria-label', options.label);
    element.innerHTML = `<span aria-hidden="true">${cardMarkup(options.card, options.cursor)}</span>`;

    return element;
  }

  function renderTopRow() {
    const top = document.createElement('div');
    top.className = 'board__top';

    const freeSpace = document.createElement('div');
    freeSpace.className = 'board__free';

    for (let index = 0; index < FREE_CELLS; index++) {
      const card = Game.isCard(state.freeSpace[index]) ? state.freeSpace[index] : null;
      const selected = Boolean(
        state.selectedCell
        && state.selectedCell.row === 0
        && state.selectedCell.column === index
      );

      freeSpace.appendChild(positionElement({
        card,
        row: 0,
        column: index,
        cursor: state.row === 0 && state.column === index,
        selected,
        label: card
          ? `${cardLabel(card)} — ${cardDescription(card)} na célula livre ${index + 1}`
          : `Célula livre ${index + 1} vazia`,
      }));
    }

    const separator = document.createElement('div');
    separator.className = 'board__separator';
    separator.setAttribute('aria-hidden', 'true');

    const foundations = document.createElement('div');
    foundations.className = 'board__foundations';

    for (let index = 0; index < FOUNDATIONS; index++) {
      const card = Game.isCard(state.finalPile[index]) ? state.finalPile[index] : null;
      const column = index + FREE_CELLS;
      const selected = Boolean(
        state.selectedCell
        && state.selectedCell.row === 0
        && state.selectedCell.column === column
      );

      foundations.appendChild(positionElement({
        card,
        row: 0,
        column,
        cursor: state.row === 0 && state.column === column,
        selected,
        label: card
          ? `${cardLabel(card)} — ${cardDescription(card)} na fundação ${index + 1}`
          : `Fundação ${index + 1} vazia`,
      }));
    }

    top.append(freeSpace, separator, foundations);

    return top;
  }

  function renderTableau() {
    const tableau = document.createElement('div');
    tableau.className = 'board__tableau';

    for (let column = 0; column < COLUMNS; column++) {
      const columnElement = document.createElement('div');
      columnElement.className = 'board__column';

      const cards = state.cards[column];

      if (!cards.length) {
        columnElement.appendChild(positionElement({
          card: null,
          row: 1,
          column,
          cursor: state.row === 1 && state.column === column,
          selected: false,
          empty: true,
          label: `Coluna ${column + 1} vazia`,
        }));
      } else {
        cards.forEach((card, index) => {
          const cardRow = index + 1;
          const selected = Boolean(
            state.selectedCell
            && state.selectedCell.row > 0
            && state.selectedCell.column === column
            && state.selectedCell.row <= cardRow
          );

          columnElement.appendChild(positionElement({
            card,
            row: cardRow,
            column,
            cursor: state.row === cardRow && state.column === column,
            selected,
            stacked: index > 0,
            label: `${cardLabel(card)} — ${cardDescription(card)} na coluna ${column + 1}, posição ${cardRow}`,
          }));
        });
      }

      tableau.appendChild(columnElement);
    }

    return tableau;
  }

  function setStatusText(text) {
    if (dom.status.textContent !== text) {
      dom.status.textContent = text;
    }
  }

  function updateStatus() {
    if (Game.isWin(state)) {
      setStatusText(`Você venceu em ${moves} ${moves === 1 ? 'movimento' : 'movimentos'}!`);
      dom.status.classList.add('game__status--win');
      return;
    }

    dom.status.classList.remove('game__status--win');

    if (message) {
      setStatusText(message);
      return;
    }

    const occupiedFreeCells = state.freeSpace.filter(Game.isCard).length;
    const freeCells = FREE_CELLS - occupiedFreeCells;
    const foundationCards = Game.foundationCount(state);

    setStatusText(`${moves} ${moves === 1 ? 'movimento' : 'movimentos'}`
      + ` · ${freeCells}/${FREE_CELLS} células livres`
      + ` · ${foundationCards}/52 nas fundações`);
  }

  function render() {
    const inner = document.createElement('div');
    inner.className = 'board__inner';
    inner.append(renderTopRow(), renderTableau());

    dom.board.replaceChildren(inner);

    if (dom.undo) {
      dom.undo.disabled = !state.history || state.history.length === 0;
    }

    updateStatus();
  }

  function apply(action) {
    const previous = state;
    const next = Game.tableauReducer(state, action);

    if (action.type === 'left' || action.type === 'right' || action.type === 'up' || action.type === 'down') {
      message = '';
    }

    if (action.type === 'select') {
      message = next === previous ? 'Essa carta não pode ser movida.' : '';
    }

    if (action.type === 'unselect') {
      message = '';
    }

    if (action.type === 'move') {
      if (next === previous) {
        message = 'Movimento inválido.';
      } else {
        moves += 1;
        message = '';
      }
    }

    if (action.type === 'undo') {
      if (next === previous) {
        message = 'Nada para desfazer.';
      } else {
        moves = Math.max(0, moves - 1);
        message = '';
      }
    }

    state = next;
    render();
  }

  function activateCursor() {
    if (!state.selectedCell) {
      apply({ type: 'select' });
      return;
    }

    if (state.selectedCell.row === state.row && state.selectedCell.column === state.column) {
      apply({ type: 'unselect' });
      return;
    }

    apply({ type: 'move' });
  }

  function handlePosition(row, column) {
    state = { ...state, row, column };

    if (!state.selectedCell) {
      apply({ type: 'select' });
      return;
    }

    if (state.selectedCell.row === row && state.selectedCell.column === column) {
      apply({ type: 'unselect' });
      return;
    }

    apply({ type: 'move' });
  }

  function focusBoard() {
    dom.board.focus({ preventScroll: true });
  }

  function onClick(event) {
    const target = event.target.closest('[data-row]');

    if (!target) return;

    handlePosition(Number(target.dataset.row), Number(target.dataset.column));
    focusBoard();
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      apply({ type: 'left' });
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      apply({ type: 'right' });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      apply({ type: 'up' });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      apply({ type: 'down' });
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateCursor();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();

      if (state.selectedCell) apply({ type: 'unselect' });
    }
  }

  function onUndoShortcut(event) {
    const key = event.key.toLowerCase();

    if (!(event.ctrlKey || event.metaKey) || key !== 'z') return;

    event.preventDefault();
    apply({ type: 'undo' });
    focusBoard();
  }

  function undoMove() {
    apply({ type: 'undo' });
    focusBoard();
  }

  function newGame() {
    state = Game.createInitialState();
    moves = 0;
    message = '';
    render();
    focusBoard();
  }

  function init() {
    dom.board = byId('board');
    dom.status = byId('game-status');
    dom.newGame = byId('new-game');
    dom.undo = byId('undo');

    dom.board.addEventListener('click', onClick);
    dom.board.addEventListener('keydown', onKeyDown);
    dom.newGame.addEventListener('click', newGame);
    dom.undo.addEventListener('click', undoMove);
    document.addEventListener('keydown', onUndoShortcut);

    const playLink = document.querySelector('a[href="#jogar"]');

    if (playLink) {
      playLink.addEventListener('click', () => {
        window.setTimeout(focusBoard, 0);
      });
    }

    if (window.location.hash === '#jogar') {
      window.setTimeout(focusBoard, 0);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
