export type Board = [[Square, Square, Square], [Square, Square, Square], [Square, Square, Square]];

export type MarkType = "X" | "O";

export type Square = MarkType | undefined;

export interface GameState {
    turns: number;
    board: Board;
    lastPlayer: MarkType;
    lastPlayedCoords: [number, number]; // Row index, column index
    winner?: MarkType | "stalemate";
}

export const initialGameState: GameState = {
    turns: 0,
    board: [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
    ],
    lastPlayer: "X",
    lastPlayedCoords: [-1, -1],
};

let currentGameState: GameState = initialGameState;

export const getCurrentGameState = () => currentGameState;
export const setCurrentGameState = (newGameState: GameState) => (currentGameState = newGameState);
