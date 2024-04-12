# Part II - Evolving State

Evolvers are specialized functions designed to manage the transformation of state within an application, following
predefined rules or logic. They play a crucial role in enabling dynamic state changes, ensuring that application states
evolve in a controlled, predictable manner based on user interactions or internal events.

## What makes an Evolvers?

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

### Mutable state

An evolver always mutates one type of state, and you must tell the evolver that type when you create it, using the
`.toEvolve()` method.

```typescript
export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
		// ...
```

All mutators within the evolver must return this data type.

### Noun

The `noun` for an evolver determines the name of the data argument passed to each `mutator`, for consistency. If you
don't specify a `noun`, it defaults to `"input"`. Each `mutator`'s first argument will be an object of the evolver's
data type, keyed by this noun, prefixed with `"mutable"` in camel-case:

```typescript
export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        updateLastPlayer: ({ mutableGameState }, mark: MarkType): GameState => {
            mutableGameState.lastPlayer = mark;
            return mutableGameState;
        },
        //... other mutators
    });
```

### Mutators

Mutators are the heart of evolvers. They are functions which take in a mutable object and return a modified version of
that object. To return any other type, use a `Refinery`.

Mutators can be synchronous or asynchronous. All mutations happen in a queued fashion, and can be chained.

The first argument of a mutator must always be the mutable data object. Subsequent arguments can be added at the
developer's discretion, and only those will be required when calling the mutator functions.

```typescript
export const { GameMetaEvolver } = Evolver.create("GameMetaEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        updateLastPlayer: ({ mutableGameState }, mark: MarkType): GameState => {
            mutableGameState.lastPlayer = mark;
            return mutableGameState;
        },
        updateLastPlayedCoords: ({ mutableGameState }, coords: [number, number]): GameState => {
            mutableGameState.lastPlayedCoords = coords;
            return mutableGameState;
        },
        iterateTurnCount: ({ mutableGameState }): GameState => {
            mutableGameState.turns++;
            return mutableGameState;
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
    return GameTurnEvolver.mutate(mutableGameState).via.gameOver("stalemate");
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
		onTurnTaken: ({ mutableGameState }) => {
			GameMetaEvolver.evolve(mutableGameState)
				.via.updateLastPlayer(mark)
				.and.updateLastPlayedCoords(coords);

			// mutableGameState has been modified via the evolver
			return mutableGameState;
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
		onTurnTaken: async ({ mutableGameState }) => {
			const result = await GameMetaEvolver.evolve(mutableGameState)
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
		onTurnTaken: async ({ mutableGameState }) => {
			GameMetaEvolver.evolve(mutableGameState)
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
