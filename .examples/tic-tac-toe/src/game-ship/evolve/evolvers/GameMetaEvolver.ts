import { Evolver } from "theseus-js";
import { GameState, MarkType } from "../../state/GameState";

export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        updateLastPlayer: ({ mutableGameState }, mark: MarkType): GameState => {
            mutableGameState.lastPlayer = mark;
            return mutableGameState;
        },
        updateLastPlayedCoords: ({ mutableGameState }, coords: [number, number]): GameState => {
            mutableGameState.lastPlayedCoords = coords;
            return mutableGameState;
        },
        iterateTurnCount: ({ mutableGameState }): GameState => {
            mutableGameState.turns++;
            return mutableGameState;
        },
    });
