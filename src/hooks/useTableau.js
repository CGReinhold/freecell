'use strict';
const { useReducer } = require('react');
const { useInput } = require('ink');
const { tableauReducer, defaultState } = require('../reducers/tableauReducer');

const useTableau = () => {
  const [state, dispatch] = useReducer(tableauReducer, defaultState);
  
	useInput((input, key) => {
		if (key.return || input === ' ') {
      if (state.selectedCell.row === undefined) {
        dispatch({ type: 'select' });
      } else if (state.selectedCell.row === state.row && state.selectedCell.column === state.column) {
        dispatch({ type: 'unselect' });
      } else {
        dispatch({ type: 'move' });
      }
		}
		if (key.leftArrow) {
			dispatch({ type: 'left' });
		}
		if (key.rightArrow) {
			dispatch({ type: 'right' });
		}
		if (key.upArrow) {
			dispatch({ type: 'up' });
		}
		if (key.downArrow) {
			dispatch({ type: 'down' });
		}
	});

  return { ...state };
}

module.exports = useTableau;