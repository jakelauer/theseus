import { Evolver } from "theseus-js";

import { GameState, MarkType } from "../GameState";

export const { GameStateEvolver } = Evolver.create("GameStateEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setSquare: ({ mutableGameState }, coords: [number, number], mark: MarkType) => {
            const [row, col] = coords;
            mutableGameState.board[row][col] = mark;
            mutableGameState.lastPlayer = mark;
            mutableGameState.lastPlayedCoords = coords;

            return mutableGameState;
        },
        delayedSetSquare: async (
            { mutableGameState },
            coords: [number, number],
            mark: MarkType,
        ) => {
            const [row, col] = coords;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            mutableGameState.board[row][col] = mark;
            mutableGameState.lastPlayer = mark;
            mutableGameState.lastPlayedCoords = coords;

            return mutableGameState;
        },
        delayedClearSquares: async ({ mutableGameState }) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            mutableGameState.board = [
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
            ];

            return mutableGameState;
        },
    });
