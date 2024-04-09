# Tic-tac-toe Game Development with Theseus: A Step-by-Step Tutorial

#### Code for this tutorial is available in the [.examples directory](../.examples)

## Part I - Defining state

Before Theseus can do anything for you, you need to define the shape of the state object it'll use. Theseus
instances are built to work with one state object, and all of its evolvers and refineries must use that same
object type. It's very important that this type includes all potential states that Theseus could possibly
return from its mutators.

We're building a Tic-tac-toe game which will evolve over time, starting with a completely empty board, and
ending in a finished board with either a winner or a stalemate. Here are the TypeScript types for our game
state:

```typescript
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

## Part II - Evolving

Evolvers are specialized functions designed to manage the transformation of state within an application, following predefined rules or logic. They play a crucial role in enabling dynamic state changes, ensuring that application states evolve in a controlled, predictable manner based on user interactions or internal events.

All evolvers have 4 parts:

#### Name
Evolvers are always named, and Theseus tries to enforce this because it makes working with higher-order components like EvolverComplexes easy. When you create an evolver, you give it a name, and that determines the output:

```typescript
// `MyStateEvolver` is enforced, and always matches the argument passed to `Evolver.create()`
const { MyStateEvolver } = Evolver.create("MyStateEvolver" ...
```

#### Mutable state
An evolver always mutates one type of state, and you must tell the evolver that type when you create it, using the `.toEvolve()` method.

```typescript
const { MyStateEvolver } = Evolver.create("MyStateEvolver", { noun: "myState" }).toEvolve<MyState>() //...
```

All mutators within the evolver must return this data type.

#### Noun
The `noun` for an evolver determines the name of the data argument passed to each `mutator`, for consistency. If you don't specify a `noun`, it defaults to `"input"`. Each `mutator`'s first argument will be an object of the evolver's data type, keyed by this noun, prefixed with `"mutable"` in camel-case:

```typescript
const { MyStateEvolver } = Evolver.create("MyStateEvolver", { noun: "myState" })
    .toEvolve<MyState>()
    .withMutators({
        foo: ({ mutableMyState })
		{
			// ...
		}
	//...
```
#### Mutators

Mutators are the heart of evolvers. They are functions which take in a mutable object and return a modified version of that object. To return any other type, use a `Refinery`.

Mutators can be synchronous or asynchronous. All mutations happen in a queued fashion, and can be chained. 

The first argument of a mutator must always be the mutable data object. Subsequent arguments can be added at the developer's discretion, and only those will be required when calling the mutator functions.

```typescript
const { MyStateEvolver } = Evolver.create("MyStateEvolver", { noun: "myState" })
    .toEvolve<MyState>()
    .withMutators({
		// `amount` is specified in the mutator arguments after mutableMyState...
        foo: ({ mutableMyState }, amount: number)
		{
			mutableMyState.iterations += amount;

			return mutableMyState;
		},
        bar: ({ mutableMyState })
		{
			mutableMyState.iterations -= 1;

			return mutableMyState;
		}
	});
	
const resultData = MyStateEvolver.evolve(someData)
	// ...and we only need to pass `amount` when we call foo()
	.using.foo(5)
	.and.foo(3)
	.finally.bar();
```
