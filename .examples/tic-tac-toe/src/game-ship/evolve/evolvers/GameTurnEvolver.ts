import { Evolver, getTheseusLogger } from "theseus-js";
import type { GameState } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GameBoardEvolver } from "./GameBoardEvolver";
import { GameMetaEvolver } from "./GameMetaEvolver";

const log = getTheseusLogger("GameTurnEvolver");

export const GameTurnEvolver = Evolver.create("GameTurn", { noun: "gameState" })
	.toEvolve<GameState>()
	.withMutators({
		/**
		 * Set the winner of the game.
		 */
		setWinner: ({ gameState }, reason: "stalemate" | "winner") => 
		{
			log.major(`Game over! ${reason}`);
			gameState.winner = reason === "winner" ? gameState.lastPlayer : "stalemate";
			return gameState;
		},
		/**
		 * Take the next turn at a random available square.
		 */
		nextTurn: ({ gameState }): GameState => 
		{
			const { turns, lastPlayer } = gameState;
			log.major(`Taking turn #${turns}`);

			const { getRandomAvailableCoords, getSquare } = GameBoardRefinery(gameState);

			// Determine the mark for the next player
			const mark = lastPlayer === "X" ? "O" : "X";
			const coords = getRandomAvailableCoords();
			if (!coords) 
			{
				return GameTurnEvolver.mutate(gameState).via.setWinner("stalemate");
			}

			// Check if the square is available
			const isAvailable = !getSquare(coords);
			if (!isAvailable) 
			{
				throw new Error(`Square at ${coords} is already taken`);
			}

			// Set the mark on the board
			GameBoardEvolver.mutate(gameState)
				.via.setMark(coords, mark);

			// Update the game metadata
			GameMetaEvolver.evolve(gameState)
				.via.iterateTurnCount()
				.and.updateLastPlayer(mark)
				.and.updateLastPlayedCoords(coords);

			return gameState;
		},
	});
