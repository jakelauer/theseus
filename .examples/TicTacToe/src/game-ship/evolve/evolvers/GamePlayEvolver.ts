import { Evolver, getTheseusLogger } from "theseus-js";

import { GameState, MarkType } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";

const log = getTheseusLogger("GameStateEvolver");

const { internal } = Evolver.create("internal", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setMark: ({ mutableGameState }, coords: [number, number], mark: MarkType): GameState => {
            const [row, col] = coords;
            mutableGameState.board[row][col] = mark;
            return mutableGameState;
        },
        updateLastPlayer: ({ mutableGameState }, mark: MarkType): GameState => {
            mutableGameState.lastPlayer = mark;
            return mutableGameState;
        },
        updateLastPlayedCoords: ({ mutableGameState }, coords: [number, number]): GameState => {
            mutableGameState.lastPlayedCoords = coords;
            return mutableGameState;
        },
    });

export const { GamePlayEvolver } = Evolver.create("GamePlayEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        playMove: ({ mutableGameState }, coords: [number, number], mark: MarkType) => {
            log.info(`Received request to set square at ${coords} to ${mark}`);

            const isAvailable = !GameBoardRefinery(mutableGameState).getSquare(coords);
            if (!isAvailable) {
                throw new Error(`Square at ${coords} is already taken`);
            }

            internal
                .evolve(mutableGameState)
                .via.setMark(coords, mark)
                .and.updateLastPlayer(mark)
                .and.updateLastPlayedCoords(coords);

            return mutableGameState;
        },
    });
