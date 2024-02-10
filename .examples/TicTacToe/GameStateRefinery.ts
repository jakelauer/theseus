import { Refinery } from "theseus-js";

import { GameState } from "./GameState";

export const GameStateRefinery = Refinery.create({ name: "GameStateRefinery", dataNoun: "GameState" })
    .toRefine<GameState>()
    .withForges({
        squareAvailable: ({ immutableGameState }, coords: [number, number]) => {
            const [row, col] = coords;
            return immutableGameState.board[row][col] === undefined;
        },
    });
