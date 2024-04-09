/** A multi-dimensional array representing the typical 3x3 Tic Tac Toe board. */
export type Board = [[Square, Square, Square], [Square, Square, Square], [Square, Square, Square]];

/** A type representing the two possible marks that can be placed on the board. */
export type MarkType = "X" | "O";

/** A type representing a single square on the board. It can either be undefined (empty) or contain a mark. */
export type Square = MarkType | undefined;

/** The state of the game. */
export interface GameState {
    /** The number of turns that have been played so far. */
    turns: number;
    /**
     * The current state of the board. It is a 3x3 matrix where each element can either be undefined (empty)
     * or contain a mark.
     */
    board: Board;
    /** The mark of the player who played the last turn. */
    lastPlayer: MarkType;
    /**
     * The coordinates of the last played square. It is a tuple where the first element is the row index and
     * the second element is the column index.
     */
    lastPlayedCoords: [number, number];
    /**
     * The winner of the game. It can be either "X" or "O" if a player has won, "stalemate" if the game ended
     * in a draw, or undefined if the game is still ongoing.
     */
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
