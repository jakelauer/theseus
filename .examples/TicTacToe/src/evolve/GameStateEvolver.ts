import { Evolver } from "theseus-js";

import { GameState } from "../GameState";

export const { GameStateEvolver } = Evolver.create("GameStateEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setSquare: ({ mutableGameState }) => {
            console.log(mutableGameState);
            return 0;
        },
    });
