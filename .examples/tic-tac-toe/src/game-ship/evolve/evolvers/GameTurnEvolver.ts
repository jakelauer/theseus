import { Evolver, getTheseusLogger } from "theseus-js";
import type { GameState } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GameBoardEvolver } from "./GameBoardEvolver";
import { GameMetaEvolver } from "./GameMetaEvolver";

const log = getTheseusLogger("GameTurnEvolver");

export const { GameTurnEvolver } = Evolver.create("GameTurnEvolver", { noun: "gameState" })
	.toEvolve<GameState>()
	.withMutators({
		/**
		 * Set the winner of the game.
		 */
		setWinner: ({ mutableGameState }, reason: "stalemate" | "winner") => 
		{
			log.major(`Game over! ${reason}`);
			mutableGameState.winner = reason === "winner" ? mutableGameState.lastPlayer : "stalemate";
			return mutableGameState;
		},
		/**
		 * Take the next turn at a random available square.
		 */
		nextTurn: ({ mutableGameState }): GameState => 
		{
			const { turns, lastPlayer } = mutableGameState;
			log.major(`Taking turn #${turns}`);

			const { getRandomAvailableCoords, getSquare } = GameBoardRefinery(mutableGameState);

			// Determine the mark for the next player
			const mark = lastPlayer === "X" ? "O" : "X";
			const coords = getRandomAvailableCoords();
			if (!coords) 
			{
				return GameTurnEvolver.mutate(mutableGameState).via.setWinner("stalemate");
			}

			// Check if the square is available
			const isAvailable = !getSquare(coords);
			if (!isAvailable) 
			{
				throw new Error(`Square at ${coords} is already taken`);
			}

			// Set the mark on the board
			GameBoardEvolver.mutate(mutableGameState)
				.via.setMark(coords, mark);

			// Update the game metadata
			GameMetaEvolver.evolve(mutableGameState)
				.via.iterateTurnCount()
				.and.updateLastPlayer(mark)
				.and.updateLastPlayedCoords(coords);

			return mutableGameState;
		},
	});
