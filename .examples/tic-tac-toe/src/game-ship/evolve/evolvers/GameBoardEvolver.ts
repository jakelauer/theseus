import { Evolver } from "theseus-js";
import { GameState, MarkType } from "../../state/GameState";

export const { GameBoardEvolver } = Evolver.create("GameBoardEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setMark: ({ mutableGameState }, coords: [number, number], mark: MarkType): GameState => {
            const [row, col] = coords;
            mutableGameState.board[row][col] = mark;
            return mutableGameState;
        },
    });
