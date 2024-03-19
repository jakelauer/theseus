import { Evolver, getTheseusLogger } from "theseus-js";

import { GameState, MarkType } from "../state/GameState.js";
import { GameBoardRefinery } from "../refine/refineries/GameBoardRefinery.js";

const log = getTheseusLogger("GameStateEvolver");

export const { GameStateEvolver } = Evolver.create("GameStateEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setSquare: ({ mutableGameState }, coords: [number, number], mark: MarkType) => {
            log.info(`Received request to set square at ${coords} to ${mark}`);

            const isAvailable = !GameBoardRefinery(mutableGameState).getSquare(coords);
            if (!isAvailable) {
                throw new Error(`Square at ${coords} is already taken`);
            }

            const [row, col] = coords;
            mutableGameState.board[row][col] = mark;
            mutableGameState.lastPlayer = mark;
            mutableGameState.lastPlayedCoords = coords;

            return mutableGameState;
        },
        delayedSetSquare: async ({ mutableGameState }, coords: [number, number], mark: MarkType) => {
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
