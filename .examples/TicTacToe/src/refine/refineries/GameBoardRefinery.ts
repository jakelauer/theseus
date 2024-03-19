import { getTheseusLogger, Refinery } from "theseus-js";

import { Board, GameState } from "../../state/GameState";

const log = getTheseusLogger("GameBoardRefinery");

export const { GameBoardRefinery } = Refinery.create("GameBoardRefinery", { noun: "GameState" })
    .toRefine<GameState>()
    .withForges({
        getSquare: ({ immutableGameState }, coords: [number, number]) => {
            const [row, col] = coords;
            const square = immutableGameState.board[row][col];

            return square;
        },
        getRandomAvailableSquare: ({ immutableGameState }) => {
            type CoordsArray = [number, number][];

            const unusedSquares = immutableGameState.board.reduce((acc, row, rowIndex) => {
                row.forEach((square, colIndex) => {
                    if (!square) {
                        acc.push([rowIndex, colIndex]);
                    }
                });

                return acc;
            }, [] as CoordsArray);

            log.info(`Unused squares: ${unusedSquares.length}`);

            if (unusedSquares.length === 0) {
                return undefined;
            }

            const randomAvailableSquare = unusedSquares[Math.floor(Math.random() * unusedSquares.length)];

            log.info(`Getting random available square at ${randomAvailableSquare}`);

            return randomAvailableSquare;
        },
        renderToString: ({ immutableGameState: { board } }) => {
            const reducer = (acc: string[], row: Board[number]) => {
                const rowString = row
                    .map((v) => (v ? v : "⬛"))
                    .join("")
                    .replace(/X/g, "❌")
                    .replace(/O/g, "⭕");
                acc.push(rowString);
                return acc;
            };

            return board.reduce<string[]>(reducer, []).join("\r\n");
        },
    });
