# Part II - Evolving State

Evolvers are specialized functions designed to manage the transformation of state within an application, following
predefined rules or logic. They play a crucial role in enabling dynamic state changes, ensuring that application states
evolve in a controlled, predictable manner based on user interactions or internal events.

## Table of Contents
- [Building an Evolver](#building-an-evolver)
	- [Name](#name)
	- [Noun](#noun)
	- [Mutators](#mutators)
- [Using Evolvers](#using-evolvers)
	- [Mutations (single change)](#mutations-single-change)
	- [Evolutions (multiple changes)](#evolutions-multiple-changes)
		- [Asynchronous Chains](#asynchronous-chains)
- [Tutorial: Tic-tac-toe Evolvers](#tutorial-tic-tac-toe-evolvers)
	- [GameTurnEvolver](#gameturnevolver)
	- [GameBoardEvolver](#gameboardevolver)
	- [GameMetaEvolver](#gamemetaevolver)

## Building an Evolver

All evolvers have 4 parts:

### Name

Evolvers are always named, and Theseus tries to enforce this because it makes working with higher-order components like
EvolverComplexes easy. When you create an evolver, you give it a name, and that determines the output:

```typescript
/**
 * GameMetaEvolver is the name of the resultant output because of the
 * value passed to Evolver.create()
 */

export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver" //...
```

### Noun

The `noun` for an evolver determines the name of the data argument passed to each `mutator`, for consistency. If you
don't specify a `noun`, it defaults to `"input"`. Each `mutator`'s first argument will be an object of the evolver's
data type, keyed by this noun.

```typescript
export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        updateLastPlayer: ({ gameState }, mark: MarkType): GameState => {
            gameState.lastPlayer = mark;
            return gameState;
        },
        //... other mutators
    });
```

### Mutators

Mutators are the heart of evolvers. They are functions which take in an object and return a modified version of
that object. To return any other type, use a `Refinery`.

Mutators can be synchronous or asynchronous. All mutations happen in a queued fashion, and can be chained.

The first argument of a mutator must always be the data object. Subsequent arguments can be added at the
developer's discretion, and only those will be required when calling the mutator functions.

Despite the name, the original data remains immutable. The mutator functions operate on a draft copy of the data via [immer](https://immerjs.github.io/immer/docs/introduction).

```typescript
export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        updateLastPlayer: ({ gameState }, mark: MarkType): GameState => {
            gameState.lastPlayer = mark;
            return gameState;
        },
        updateLastPlayedCoords: ({ gameState }, coords: [number, number]): GameState => {
            gameState.lastPlayedCoords = coords;
            return gameState;
        },
        iterateTurnCount: ({ gameState }): GameState => {
            gameState.turns++;
            return gameState;
        },
    });

// No need to pass data to these functions; only pass the other requisite arguments
const newGameState = GameMetaEvolver.evolve(gameState)
    .via.updateLastPlayer("X")
    .and.updateLastPlayedCoords([1, 2])
    .lastly.iterateTurnCount();
```

## Using Evolvers

All Evolvers are built from mutators, and all mutators can be used in two modes: to change data with one single step
(**mutations**), or using a series of chained steps (**evolutions**). Often, both are useful throughout an application.

### Mutations (single change)

Mutations cannot be chained, and always output the resultant data directly.

```typescript
// No more viable moves are available
const onMoveUnavailable = () => {
    // gameOver() returns the state because we used mutate()
    return GameTurnEvolver.mutate(gameState).via.gameOver("stalemate");
};
```

### Evolutions (multiple changes)

Evolutions allow for chaining many methods in a single call. Each method returns the other mutators. In order to get the
final resulting object, simply end the chain with `result` or `resultAsync` (depending on whether any item in the chain
is asynchronous).

All chained methods will be run in order, serially.

```typescript
// No more viable moves are available
const onTurnTaken = (previousGameState: GameState) => {
    return GameMetaEvolver.evolve(previousGameState).via.updateLastPlayer(mark).and.updateLastPlayedCoords(coords)
        .result;
};
```

When run from inside another mutator, it is not necessary (not still encouraged) to return the result from the chain,
because the data being evolved is mutable.

```typescript
	// ...inside an evolver
	.withMutators({
		onTurnTaken: ({ gameState }) => {
			GameMetaEvolver.evolve(gameState)
				.via.updateLastPlayer(mark)
				.and.updateLastPlayedCoords(coords);

			// gameState has been modified via the evolver
			return gameState;
		},
	});
```

#### Asynchronous Chains

A chain of mutations becomes asynchronous if _any part_ of the chain is asynchronous, regardless of where it is in the
chain. In that case, the chain must be awaited, or the returned data may not be fully modified at return time.

For this reason, it's advisable to use `result` and `resultAsync` even when it's unnecessary, as a visual reminder to
avoid asynchronous race conditions.

```typescript
	// Async/await
	.withMutators({
		onTurnTaken: async ({ gameState }) => {
			const result = await GameMetaEvolver.evolve(gameState)
				.via.asyncAddPlayer()
				.via.asyncUpdateLastPlayer(mark)
				.and.asyncUpdateLastPlayedCoords(coords)
				.resultAsync;

			console.log(result)

			return result;
		},
	});

	// Promise
	.withMutators({
		onTurnTaken: async ({ gameState }) => {
			GameMetaEvolver.evolve(gameState)
				.via.asyncAddPlayer()
				.via.asyncUpdateLastPlayer(mark)
				.and.asyncUpdateLastPlayedCoords(coords)
				.resultAsync
				.then(result => {
					console.log(result);

					return result;
				})
		}
	});
```

## Tutorial: Tic-tac-toe Evolvers

Evolvers are not opinionated about how they are used, but they are opinionated about how they are built. How you organize your evolvers is up to you, but here's a simple example of how you might use them in our tic-tac-toe game:

### GameTurnEvolver

This evolver manages the game state and the turn-taking logic.

```typescript
import { Evolver, getTheseusLogger } from "theseus-js";
import type { GameState } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GameBoardEvolver } from "./GameBoardEvolver";
import { GameMetaEvolver } from "./GameMetaEvolver";

const log = getTheseusLogger("GameTurnEvolver");

export const { GameTurnEvolver } = Evolver.create("GameTurnEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        /**
		 * Set the winner of the game.
		 */
        setWinner: ({ gameState }, reason: "stalemate" | "winner") => 
        {
            log.major(`Game over! ${reason}`);
            gameState.winner = reason === "winner" ? gameState.lastPlayer : "stalemate";
            return gameState;
        },
        /**
		 * Take the next turn at a random available square.
		 */
        nextTurn: ({ gameState }): GameState => 
        {
            const { turns, lastPlayer } = gameState;
            log.major(`Taking turn #${turns}`);

            const { getRandomAvailableCoords, getSquare } = GameBoardRefinery(gameState);

            // Determine the mark for the next player
            const mark = lastPlayer === "X" ? "O" : "X";
            const coords = getRandomAvailableCoords();
            if (!coords) 
            {
                return GameTurnEvolver.mutate(gameState).via.setWinner("stalemate");
            }

            // Check if the square is available
            const isAvailable = !getSquare(coords);
            if (!isAvailable) 
            {
                throw new Error(`Square at ${coords} is already taken`);
            }

            // Set the mark on the board
            GameBoardEvolver.mutate(gameState)
                .via.setMark(coords, mark);

            // Update the game metadata
            GameMetaEvolver.evolve(gameState)
                .via.iterateTurnCount()
                .and.updateLastPlayer(mark)
                .and.updateLastPlayedCoords(coords);

            return gameState;
        },
    });

```

### GameBoardEvolver

This evolver manages the game board state.

```typescript
import { Evolver } from "theseus-js";
import type { GameState, MarkType } from "../../state/GameState";

export const { GameBoardEvolver } = Evolver.create("GameBoardEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setMark: ({ gameState }, coords: [number, number], mark: MarkType): GameState => 
        {
            const [row, col] = coords;
            gameState.board[row][col] = mark;
            return gameState;
        },
    });

```

### GameMetaEvolver

This evolver manages the game metadata.

```typescript
import { Evolver } from "theseus-js";
import type { GameState, MarkType } from "../../state/GameState";

export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        /**
		 * Update the last player to make a move.
		 */
        updateLastPlayer: ({ gameState }, mark: MarkType): GameState => 
        {
            gameState.lastPlayer = mark;
            return gameState;
        },
        /**
		 * Update the last played coordinates.
		 */
        updateLastPlayedCoords: ({ gameState }, coords: [number, number]): GameState => 
        {
            gameState.lastPlayedCoords = coords;
            return gameState;
        },
        /**
		 * Iterate the turn count.
		 */
        iterateTurnCount: ({ gameState }): GameState => 
        {
            gameState.turns++;
            return gameState;
        },
    });
```
