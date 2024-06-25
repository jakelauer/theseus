import { Evolver } from "theseus-js";
import type { GameState, MarkType } from "../../state/GameState";

export const MetaEvolver = Evolver.create("MetaEvolver", {
	noun: "gameState", 
})
	.toEvolve<GameState>()
	.withMutators({
		/**
		 * Update the last player to make a move.
		 */
		updateLastPlayer: ({ gameState }, mark: MarkType): GameState => 
		{
			gameState.lastPlayer = mark;
			return gameState;
		},
		/**
		 * Update the last played coordinates.
		 */
		updateLastPlayedCoords: ({ gameState }, coords: [number, number]): GameState => 
		{
			gameState.lastPlayedCoords = coords;
			return gameState;
		},
		/**
		 * Iterate the turn count.
		 */
		iterateTurnCount: ({ gameState }): GameState => 
		{
			gameState.turns++;
			return gameState;
		},
	});
