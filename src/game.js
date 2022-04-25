'use strict';
const React = require('react');
const { Box, Text } = require('ink');
const importJsx = require('import-jsx');
const Position = importJsx('./components/position');
const useTableau = require('./hooks/useTableau');

const Game = () => {
	const { row, column, selectedCell, cards, freeSpace, finalPile } = useTableau()

	const isSelected = (cardRow, cardColumn) => {
		if (cardRow === 0) {
			return selectedCell.row === 0 && selectedCell.column === cardColumn;
		}

		return selectedCell.column === cardColumn && selectedCell.row <= cardRow && selectedCell.row !== 0;
	}

	const isHovered = (cardRow, cardColumn) => {
		return row === cardRow && column === cardColumn;
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
			<Text>← ↑ → ↓ to move and [enter] to select the cards</Text>
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
