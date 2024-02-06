export type Board = [[Square, Square, Square], [Square, Square, Square], [Square, Square, Square]];

export type MarkType = "X" | "O";

export type Square = MarkType | undefined;

export interface GameState {
    board: Board;
    lastPlayer: MarkType;
    lastPlayedCoords: [number, number]; // Row index, column index
}
