import { getTheseusLogger, Refinery } from "theseus-js";

import type { CoordsArray, GameState } from "../../state/GameState";

const log = getTheseusLogger("SquaresRefinery");

export const SquaresRefinery = Refinery.create("SquaresRefinery", { noun: "GameState" })
	.toRefine<GameState>()
	.withForges({
		getSquare: ({ immutableGameState }, coords: [number, number]) => 
		{
			const [row, col] = coords;
			const square = immutableGameState.board[row][col];

			return square;
		},
		getAvailableSquares: ({ immutableGameState }): CoordsArray => 
		{
			return immutableGameState.board.flatMap((row, rowIndex) => 
            	row.map((square, colIndex) => !square ? [rowIndex, colIndex] : null),
			).filter(Boolean) as CoordsArray;
		},
		getRandomAvailableSquare: ({ immutableGameState }) => 
		{
			const availableSquares: CoordsArray = SquaresRefinery.refine(immutableGameState).getAvailableSquares();
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
