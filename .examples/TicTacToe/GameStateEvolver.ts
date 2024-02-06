import { Evolver } from "@bad-cards/theseus";

import { GameState, MarkType } from "./GameState";

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
    });
