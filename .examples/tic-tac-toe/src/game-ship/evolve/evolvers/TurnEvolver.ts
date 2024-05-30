import { Evolver, getTheseusLogger } from "theseus-js";
import type { GameState } from "../../state/GameState";
import { SquaresRefinery } from "../../refine/refineries/SquaresRefinery";
import { BoardEvolver } from "./BoardEvolver";
import { MetaEvolver } from "./MetaEvolver";

const log = getTheseusLogger("GameTurnEvolver");

export const TurnEvolver = Evolver.create("TurnEvolver", { noun: "gameState" })
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

			const { getRandomAvailableSquare, getSquare } = SquaresRefinery.refine(mutableGameState);

			// Determine the mark for the next player
			const mark = lastPlayer === "X" ? "O" : "X";
			const coords = getRandomAvailableSquare();
			if (!coords) 
			{
				return TurnEvolver.mutate(mutableGameState).via.setWinner("stalemate");
			}

			// Check if the square is available
			const isAvailable = !getSquare(coords);
			if (!isAvailable) 
			{
				throw new Error(`Square at ${coords} is already taken`);
			}

			// Set the mark on the board
			BoardEvolver.mutate(mutableGameState)
				.via.setMark(coords, mark);

			// Update the game metadata
			MetaEvolver.evolve(mutableGameState)
				.via.iterateTurnCount()
				.and.updateLastPlayer(mark)
				.and.updateLastPlayedCoords(coords);

			return mutableGameState;
		},
	});
