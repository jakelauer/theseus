import { Evolver } from "theseus-js";
import type { GameState, MarkType } from "../../state/GameState.js";

export const BoardEvolver = Evolver.create("BoardEvolver", {
	noun: "gameState",
})
	.toEvolve<GameState>()
	.withMutators({
		/**
         * Set the mark at the given coordinates.
         */
		setMark: ({ gameState }, coords: [number, number], mark: MarkType): GameState => 
		{
			const [row, col] = coords;
			gameState.board[row][col] = mark;
			return gameState;
		},
	});
