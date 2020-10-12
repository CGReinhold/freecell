'use strict';
const React = require('react');
const { useState } = require('react');
const { Box, Text, useInput } = require('ink');
const importJsx = require('import-jsx');
const Position = importJsx('./components/position');
const suits = require('./constants/suits');
const ranks = require('./constants/ranks');
const generateCards = require('./utils/cardGenerator');

const Game = () => {
	const [row, setRow] = useState(0);
	const [column, setColumn] = useState(0);
	const [selectedCell, setSelectedCell] = useState({});
	const [cards, setCards] = useState(generateCards());
	const [freeSpace, setFreeSpace] = useState([{}, {}, {}, {}]);
	const [finalPile, setFinalPile] = useState([{}, {}, {}, {}]);

	useInput((_, key) => {
		if (key.return) {
			onSelect();
		}
		if (key.leftArrow) {
			onMoveLeft();
		}
		if (key.rightArrow) {
			onMoveRight();
		}
		if (key.upArrow) {
			onMoveUp();
		}
		if (key.downArrow) {
			onMoveDown();
		}
	});

	const onSelect = () => {
		if (selectedCell.row === undefined) {
			if (selectedLastFromColumn() || selectedFreeSpaceCard() || selectedFinalPileCard() || selectedLastSelectableFromColumn()) {
				setSelectedCell({ row, column });
			}
		} else if (selectedCell.row === row && selectedCell.column === column) {
			setSelectedCell({});
		} else {
			if (selectedFreeSpace() && canUpdateFreeSpace()) {
				const newFreeSpace = [...freeSpace];
				newFreeSpace[column] = popSelectedCard();
				setFreeSpace(newFreeSpace);
			} else if (selectedFinalPile() && canUpdateFinalFile()) {
				const newFinalPile = [...finalPile];
				newFinalPile[column-4] = popSelectedCard();
				setFinalPile(newFinalPile);
			} else if (selectedLastFromColumn() && canAddToFinalOfColumn()) {
				const updatedCards = [...cards];
				updatedCards[column].push(...popSelectedGroup());
			}
			setSelectedCell({});
		}
	}

	const onMoveUp = () => {
		if (row > 0) {
			setRow(row - 1);
		} else if (row === 0) {
			setRow(cards[column].length);
		}
	}

	const onMoveDown = () => {
		if (row < cards[column].length) {
			setRow(row + 1);
		} else if (row === cards[column].length) {
			setRow(0);
		}
	}

	const onMoveRight = () => {
		if (column === 7) {
			setColumn(0);
			if (cards[0].length < row) {
				setRow(cards[0].length);
			}
		} else {
			setColumn(column + 1);
			if (cards[column + 1].length < row) {
				setRow(cards[column + 1].length);
			}
		}
	}

	const onMoveLeft = () => {
		if (column === 0) {
			setColumn(7);
			if (cards[7].length < row) {
				setRow(cards[7].length);
			}
		} else {
			setColumn(column - 1);
			if (cards[column - 1].length < row) {
				setRow(cards[column - 1].length);
			}
		}
	}

	const selectedFreeSpace = () => row === 0 && column < 4;
	const selectedFreeSpaceCard = () => selectedFreeSpace() && freeSpace[column].rank !== undefined;
	const canUpdateFreeSpace = () => {
		const isNotMiddleCardSelected = selectedCell.row === 0 || selectedCell.row === cards[selectedCell.column].length;
		return freeSpace[column].rank === undefined && isNotMiddleCardSelected;
	}

	const selectedFinalPile = () => row === 0 && column > 3;
	const selectedFinalPileCard = () => selectedFinalPile() && finalPile[column - 4].rank !== undefined;
	const canUpdateFinalFile = () => {
		const currentCardOnFinalPile = finalPile[column-4];
		const selectedCard = getSelectedCard();
		if (currentCardOnFinalPile.rank === undefined) {
			return selectedCard.rank === ranks.ace;
		} else {
			const isSameSuit = selectedCard.suit === currentCardOnFinalPile.suit;
			return isNextRank(currentCardOnFinalPile, selectedCard) && isSameSuit;
		}
	}

	const getLastCardOfColumn = col => cards[col][cards[col].length -1];
	const selectedLastFromColumn = () => row === cards[column].length;
	const selectedLastSelectableFromColumn = () => {
		if (selectedLastFromColumn()) {
			return true;
		}

		for(let i = row; i < cards[column].length; i++) {
			if (!isNextRank(cards[column][i], cards[column][i -1])) {
				return false;
			}
		}

		return true;
	};
	const canAddToFinalOfColumn = () => {
		const lastCardOfColumn = getLastCardOfColumn(column);
		if (lastCardOfColumn.rank === undefined) {
			return true;
		}

		const selectedCard = getSelectedCard();
		const nextRank = isNextRank(selectedCard, lastCardOfColumn);
		const oppositSuit = isOpositeSuite(lastCardOfColumn, selectedCard);
		return nextRank && oppositSuit;
	}

	const popSelectedCard = () => {
		const card = getSelectedCard();
		if (selectedCell.row === 0) {
			if (selectedCell.column < 4) {
				const newFreeSpace = [...freeSpace];
				newFreeSpace[selectedCell.column] = {};
				setFreeSpace(newFreeSpace);
			} else {
				const newFinalPile = [...finalPile];
				newFinalPile[selectedCell.column-4] = {};
				setFinalPile(newFinalPile);
			}
		} else {
			const newCards = [...cards];
			newCards[selectedCell.column] = newCards[selectedCell.column].splice(0, newCards[selectedCell.column].length - 1)
			setCards(newCards);
		}
		return card;
	}

	const popSelectedGroup = () => {
		const newCards = [...cards];
		const group = newCards[selectedCell.column].slice(selectedCell.row - 1, newCards[selectedCell.column].length);
		newCards[selectedCell.column] = newCards[selectedCell.column].splice(0, selectedCell.row - 1);
		setCards(newCards);
		return group;
	}

	const getSelectedCard = () => {
		if (selectedCell.row === 0) {
			if (selectedCell.column < 4) {
				return freeSpace[selectedCell.column];
			} else {
				return finalPile[selectedCell.column - 4];
			}
		}
		return cards[selectedCell.column][selectedCell.row-1];
	}

	const isSelected = (cardRow, cardColumn) => {
		return selectedCell.row === cardRow && selectedCell.column === cardColumn;
	}

	const isHovered = (cardRow, cardColumn) => {
		return row === cardRow && column === cardColumn;
	}

	const isNextRank = (card, next) => {
		const rankKeys = Object.values(ranks);
		return rankKeys.findIndex(x => x === card.rank) + 1 === rankKeys.findIndex(x => x === next.rank);
	}

	const isOpositeSuite = (card, next) => {
		if (card.suit === suits.clubs || card.suit === suits.spades) {
			return next.suit === suits.diamonds || next.suit === suits.hearts;
		} else {
			return next.suit === suits.clubs || next.suit === suits.spades;
		}
	}

	const renderTableau = () => {
		return cards.map((chunk, index) => renderCardColumn(chunk, index));
	}

	const renderCardColumn = (cardChunk, columnNumber) => {
		return (
			<Box key={`column${columnNumber}`} flexDirection="column">
				{cardChunk.length > 0 ? 
					cardChunk.map((card, index) => {
						const { rank, suit } = card;
						const marginTop = index ? -5 : 0;

						return (
							<Position
								key={`${rank}${suit}`}
								card={{ rank, suit }}
								hovered={isHovered(index + 1, columnNumber)}
								selected={isSelected(index + 1, columnNumber)}
								marginTop={marginTop}
							/>
						)}) : (
						<Position
							key={`empty`}
							hovered={isHovered(1, columnNumber)}
							selected={isSelected(1, columnNumber)}
						/>
					)}
			</Box>
		);
	}

	return (
		<>
			<Text>← ↑ → ↓ to move and [space] to select the cards</Text>
			<Box marginX={1} flexDirection="column" >
				<Box>
					<Position hovered={isHovered(0, 0)} selected={isSelected(0, 0)} card={{...freeSpace[0]}} />
					<Position hovered={isHovered(0, 1)} selected={isSelected(0, 1)} card={{...freeSpace[1]}} />
					<Position hovered={isHovered(0, 2)} selected={isSelected(0, 2)} card={{...freeSpace[2]}} />
					<Position hovered={isHovered(0, 3)} selected={isSelected(0, 3)} card={{...freeSpace[3]}} />
					<Text>  </Text>
					<Position hovered={isHovered(0, 4)} selected={isSelected(0, 4)} card={{...finalPile[0]}} />
					<Position hovered={isHovered(0, 5)} selected={isSelected(0, 5)} card={{...finalPile[1]}} />
					<Position hovered={isHovered(0, 6)} selected={isSelected(0, 6)} card={{...finalPile[2]}} />
					<Position hovered={isHovered(0, 7)} selected={isSelected(0, 7)} card={{...finalPile[3]}} />
				</Box>
				<Box marginX={1}>
					{renderTableau()}
				</Box>
			</Box>
		</>
	);
}

module.exports = Game;
