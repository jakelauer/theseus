import { GameBoardRefinery } from "refine/refineries/GameBoardRefinery";
import { GameState } from "state/GameState";
import { Refinery } from "theseus-js";

type TripleType = "row" | "column" | "diagonal";
type Triple = {
    type: TripleType;
    from: [number, number];
    to: [number, number];
};

export const { GameOutcomeRefinery } = Refinery.create("GameOutcomeRefinery", { noun: "GameState" })
    .toRefine<GameState>()
    .withForges({
        checkTriple: ({ immutableGameState }, triple: Triple) => {
            const [fromRow, fromCol] = triple.from;
            const [toRow, toCol] = triple.to;

            const markTypeAtCoords = GameBoardRefinery(immutableGameState).getSquare([fromRow, fromCol]);

            // Set this to true if the triple defined has the same mark in all three squares
            let tripleIsComplete = false;

            // Loop through the triple's coordinates and check if the mark is the same in all three squares,
            // ensuring that the triple type is respected (i.e. row, column, or diagonal)
            for (let i = 0; i < 3; i++) {
                let coordinate: [number, number];

                switch (triple.type) {
                    case "row":
                        coordinate = [fromRow, fromCol + i];
                        break;
                    case "column":
                        coordinate = [fromRow + i, fromCol];
                        break;
                    default:
                        coordinate = [fromRow + i, fromCol + i];
                        break;
                }

                const markType = GameBoardRefinery(immutableGameState).getSquare(coordinate);
                if (markType !== markTypeAtCoords) {
                    return;
                }
            }

            return tripleIsComplete;
        },
        checkForTriples: ({ immutableGameState }): Triple | undefined => {
            const board = immutableGameState.board;
            const triples: Triple[] = [];
            for (let i = 0; i < 3; i++) {
                triples.push({ type: "row", from: [i, 0], to: [i, 2] });
                triples.push({ type: "column", from: [0, i], to: [2, i] });
            }
            triples.push({ type: "diagonal", from: [0, 0], to: [2, 2] });
            triples.push({ type: "diagonal", from: [0, 2], to: [2, 0] });
            for (const triple of triples) {
                const winner = GameOutcomeRefinery(immutableGameState).checkTriple(triple);
                if (winner) {
                    return triple;
                }
            }
        },
        hasWinner: ({ immutableGameState }) => {
            const board = immutableGameState.board;
            const hasWinner = (mark: string) => {
                for (let i = 0; i < 3; i++) {
                    if (board[i][0] === mark && board[i][1] === mark && board[i][2] === mark) {
                        return true;
                    }
                    if (board[0][i] === mark && board[1][i] === mark && board[2][i] === mark) {
                        return true;
                    }
                }
                if (board[0][0] === mark && board[1][1] === mark && board[2][2] === mark) {
                    return true;
                }
                if (board[0][2] === mark && board[1][1] === mark && board[2][0] === mark) {
                    return true;
                }
                return false;
            };
            return hasWinner("X") || hasWinner("O");
        },
    });
