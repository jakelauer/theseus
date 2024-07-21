import { getTheseusLogger, Refinery } from "theseus-js";

import type { GameState } from "../../state/GameState.js";
import { SquaresRefinery } from "./SquaresRefinery.js";

type TripleType = "row" | "column" | "diagonalLR" | "diagonalRL";
export type Triple = {
    type: TripleType;
    from: [number, number];
    to: [number, number];
};

const log = getTheseusLogger("OutcomeRefinery");

/**
 * Refinery for checking the outcome of a game
 */
export const OutcomeRefinery = Refinery.create("OutcomeRefinery", {
	noun: "gameState",
})
	.toRefine<GameState>()
	.withForges({
		/**
         * Check if a triple is complete
         */
		checkTriple: ({ gameState }, triple: Triple): boolean => 
		{
			const [fromRow, fromCol] = triple.from;
			const markTypeAtCoords = SquaresRefinery.refine(gameState).getSquare([fromRow, fromCol]);

			// Immediately return if the first square is empty or undefined
			if (!markTypeAtCoords) return false;

			const offsets = {
				column: [1, 0],
				row: [0, 1],
				diagonalLR: [1, 1],
				diagonalRL: [1, -1],
			};

			const offset = offsets[triple.type];
			if (!offset) 
			{
				throw new Error(`Invalid triple type: ${triple.type}`);
			}

			// Assume the triple is complete initially
			let tripleIsComplete = true;

			for (let i = 0; i < 3; i++) 
			{
				const coordinate: [number, number] = [fromRow + offset[0] * i, fromCol + offset[1] * i];
				const markType = gameState.board[coordinate[0]][coordinate[1]];
				if (markType !== markTypeAtCoords) 
				{
					tripleIsComplete = false; // Set to false if any square doesn't match
					break; // No need to continue checking
				}
			}

			return tripleIsComplete;
		},
		/**
         * Check all possible triples for a winner
         */
		checkForTriples: ({ gameState }): Triple | undefined => 
		{
			log.info("Checking for triples");
			const triples: Triple[] = [];
			for (let i = 0; i < 3; i++) 
			{
				triples.push({
					type: "row",
					from: [i, 0],
					to: [i, 2],
				});
				triples.push({
					type: "column",
					from: [0, i],
					to: [2, i],
				});
			}
			triples.push({
				type: "diagonalLR",
				from: [0, 0],
				to: [2, 2],
			});
			triples.push({
				type: "diagonalRL",
				from: [0, 2],
				to: [2, 0],
			});
			for (const triple of triples) 
			{
				const winner = OutcomeRefinery.refine(gameState).checkTriple(triple);
				if (winner) 
				{
					return triple;
				}
			}

			log.info(`Checked ${triples.length} triples and found no winner`);

			return undefined;
		},
		/**
         * Get the type of a triple, e.g. "across" for a row, "down" for a column, etc.
         */
		getTripleType: ({ gameState }, triple: Triple) => 
		{
			const markType = gameState.board[triple.from[0]][triple.from[1]];
			const tripleTypePlainEnglish =
                triple.type === "row" ? "across"
                	: triple.type === "column" ? "down"
                		: "diagonal";

			return {
				markType,
				tripleTypePlainEnglish,
			};
		},
	});
