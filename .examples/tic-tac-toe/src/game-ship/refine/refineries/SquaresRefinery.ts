import { getTheseusLogger, Refinery } from "theseus-js";

import type { CoordsArray, GameState } from "../../state/GameState.js";

const log = getTheseusLogger("SquaresRefinery");

export const SquaresRefinery = Refinery.create("SquaresRefinery", {
	noun: "gameState",
})
	.toRefine<GameState>()
	.withForges({
		getSquare: ({ gameState }, coords: [number, number]) => 
		{
			const [row, col] = coords;
			const square = gameState.board[row][col];

			return square;
		},
		getAvailableSquares: ({ gameState }): CoordsArray => 
		{
			return gameState.board
				.flatMap((row, rowIndex) => row.map((square, colIndex) => (!square ? [rowIndex, colIndex] : null)))
				.filter(Boolean) as CoordsArray;
		},
		getRandomAvailableSquare: ({ gameState }) => 
		{
			const availableSquares: CoordsArray = SquaresRefinery.refine(gameState).getAvailableSquares();
			const availableSquaresCount = availableSquares.length;

			let result = undefined;
			if (availableSquaresCount > 0) 
			{
				const unusedIndex = Math.floor(Math.random() * availableSquaresCount);
				const randomAvailableSquare = availableSquares[unusedIndex];

				log.info(`Got random available square at ${randomAvailableSquare}`);

				result = randomAvailableSquare;
			}
			else 
			{
				log.warn("No available squares left");
			}

			return result;
		},
	});
