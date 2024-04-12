
## Part I - Defining state

Before Theseus can do anything for you, you need to define the shape of the state object it'll use. Theseus
instances are built to work with one state object, and all of its evolvers and refineries must use that same
object type. It's very important that this type includes all potential states that Theseus could possibly
return from its mutators.

We're building a Tic-tac-toe game which will evolve over time, starting with a completely empty board, and
ending in a finished board with either a winner or a stalemate. Here are the TypeScript types for our game
state:

```typescript
/** The typical 3x3 Tic Tac Toe board. */
export type Board = [
	[Square, Square, Square], 
	[Square, Square, Square], 
	[Square, Square, Square]
];

/** The two possible marks that can be placed on the board. */
export type MarkType = "X" | "O";

/** A type representing a single square on the board. */
export type Square = MarkType | undefined;

/** The state of the game. */
export interface GameState {
    /** The number of turns that have been played so far. */
    turns: number;
    /** A 3x3 matrix containing player marks (or undefined/empty). */
    board: Board;
    /** The mark of the player who played the last turn. */
    lastPlayer: MarkType;
    /** The coordinates of the last played square. */
    lastPlayedCoords: [number, number];
    /** The winner of the game ("X" | "O" | "stalemate")*/
    winner?: MarkType | "stalemate";
}
```

We will also define the initial object for our Theseus instance to consume, which will be of type `GameState`.
Theseus will use this object as the starting point. This object must adhere to the type Theseus expects.

```typescript
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
```
