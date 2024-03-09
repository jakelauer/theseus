import { getTheseusLogger, Refinery } from "theseus-js";

import { GameShip } from "../../GameShip.js";
import { GameState } from "../../state/GameState.js";

type TripleType = "row" | "column" | "diagonalLR" | "diagonalRL";
type Triple = {
    type: TripleType;
    from: [number, number];
    to: [number, number];
};

const log = getTheseusLogger("GameOutcomeRefinery");

export const { GameOutcomeRefinery } = Refinery.create("GameOutcomeRefinery", { noun: "GameState" })
    .toRefine<GameState>()
    .withForges({
        checkTriple: ({ immutableGameState }, triple: Triple) => {
            const [fromRow, fromCol] = triple.from;
            const markTypeAtCoords = GameShip.refine.GameBoard.getSquare([fromRow, fromCol]);

            // Immediately return if the first square is empty or undefined
            if (!markTypeAtCoords) return false;

            const offsets = {
                column: [1, 0],
                row: [0, 1],
                diagonalLR: [1, 1],
                diagonalRL: [1, -1],
            };

            const offset = offsets[triple.type];
            if (!offset) {
                throw new Error(`Invalid triple type: ${triple.type}`);
            }

            // Assume the triple is complete initially
            let tripleIsComplete = true;

            for (let i = 0; i < 3; i++) {
                let coordinate: [number, number] = [fromRow + offset[0] * i, fromCol + offset[1] * i];
                const markType = immutableGameState.board[coordinate[0]][coordinate[1]];
                if (markType !== markTypeAtCoords) {
                    tripleIsComplete = false; // Set to false if any square doesn't match
                    break; // No need to continue checking
                }
            }

            return tripleIsComplete;
        },
        checkForTriples: ({ immutableGameState }): Triple | undefined => {
            log.info("Checking for triples");
            const triples: Triple[] = [];
            for (let i = 0; i < 3; i++) {
                triples.push({ type: "row", from: [i, 0], to: [i, 2] });
                triples.push({ type: "column", from: [0, i], to: [2, i] });
            }
            triples.push({ type: "diagonalLR", from: [0, 0], to: [2, 2] });
            triples.push({ type: "diagonalRL", from: [0, 2], to: [2, 0] });
            for (const triple of triples) {
                const winner = GameShip.refine.GameOutcome.checkTriple(triple);
                if (winner) {
                    return triple;
                }
            }

            log.info(`Checked ${triples.length} triples and found no winner`);

            return undefined;
        },
    });
