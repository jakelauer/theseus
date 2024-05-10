import { Evolver } from "theseus-js";
import type { GameState, MarkType } from "../../state/GameState";

export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        /**
		 * Update the last player to make a move.
		 */
        updateLastPlayer: ({ mutableGameState }, mark: MarkType): GameState => 
        {
            mutableGameState.lastPlayer = mark;
            return mutableGameState;
        },
        /**
		 * Update the last played coordinates.
		 */
        updateLastPlayedCoords: ({ mutableGameState }, coords: [number, number]): GameState => 
        {
            mutableGameState.lastPlayedCoords = coords;
            return mutableGameState;
        },
        /**
		 * Iterate the turn count.
		 */
        iterateTurnCount: ({ mutableGameState }): GameState => 
        {
            mutableGameState.turns++;
            return mutableGameState;
        },
    });
