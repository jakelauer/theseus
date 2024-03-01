import { Refinery } from "theseus-js";

import { GameState } from "../../state/GameState";

export const { GameBoardRefinery } = Refinery.create("GameBoardRefinery", { noun: "GameState" })
    .toRefine<GameState>()
    .withForges({
        getSquare: ({ immutableGameState }, coords: [number, number]) => {
            const [row, col] = coords;
            return immutableGameState.board[row][col];
        },
        squareAvailable: ({ immutableGameState }, coords: [number, number]): boolean => {
            return !!GameBoardRefinery(immutableGameState).getSquare(coords);
        },
    });
