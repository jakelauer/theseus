# Evolvers and EvolverComplexes

## Overview

Theseus introduces Evolvers and EvolverComplexes as foundational tools for state management. Evolvers
facilitate data transformations through both singular mutations and sequential, chained transformations.
EvolverComplexes enable grouping of these Evolvers for more complex and organized state evolution scenarios.

### Chaining behavior, queueing, and asynchrony

Evolvers use a deterministic
[queue](./MutatorSets/ChainableMutatorSetBuilder/operations/ChainableMutatorQueue.ts) to execute chained
mutators. This is achieved using a
[proxy inside the evolver](./MutatorSets/ChainableMutatorSetBuilder/operations/createChainingProxy.ts), which
intercepts calls to the mutators.

Because of this, asynchronous mutators can still run as chained operations, thanks to the proxy detecting
whether each mutator in the chain returns a Promise instance. It _also_ means that mutators which are
asynchronous and chained **cannot run in parallel**.

In order to run mutations in parallel, you can run the mutations as single operations and merge the result:

```typescript
const { asyncFoo, asyncBar } = MyEvolver.mutate(myState).getMutators();

const [stateFoo, stateBar] = Promise.all([asyncFoo(), asyncBar()]);

return {
    ...myState,
    ...stateFoo,
    ...stateBar,
};
```

## Evolvers

Evolvers are designed to encapsulate specific transformations on data, offering a modular approach to state
management.

### Mutators

Within an Evolver, individual methods responsible for applying specific mutations to the state are called
**Mutators**.

-   **Mutable data**: Every Mutator receives a first argument that is a data object with a single key.

    This key is named `mutable` concatenated with the value of `noun` provided to the `Evolver.create` method.
    If no `noun` is provided, the default noun is `input`. Thus, if a `noun` of "state" is provided, the data
    will be called `mutableState`. Mutations to this object are retained across the Evolver's execution
    because mutators return the resulting object.

-   **TypeScript Inference**: Mutators can reference their own Evolver without losing TypeScript's type
    inference capabilities.
-   **Usage in EvolverComplexes**: When Evolvers are included in an `EvolverComplex`, their names are used
    directly but with the term "Evolver" removed from either the beginning or the end for simplicity.

    For example, if an EvolverComplex includes `OddNumberEvolver`, it will be accessible at
    `MyEvolverComplex.evolve(myData).OddNumber`.

### Example: Dungeons & Dragons Player Actions

In a D&D game, managing a player's turn involves several steps, including pre-turn conditions, movement,
actions, and reactions. An `Evolver` can manage these aspects efficiently:

```typescript
const { PlayerTurnEvolver } = Evolver.create("PlayerTurnEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setPreTurnCondition: ({ mutableGameState }, condition) => {
            mutableGameState.preTurnCondition = condition;
            return mutableGameState;
        },
        move: ({ mutableGameState }, movement) => {
            mutableGameState.position += movement;
            return mutableGameState;
        },
        takeAction: ({ mutableGameState }, action) => {
            mutableGameState.lastAction = action;
            return mutableGameState;
        },
    });
```

In this example, each mutator function receives an object containing `mutableGameState`, which is then updated
with the new state resulting from the mutator's logic. This pattern is consistent with the correct usage of
Evolvers in Theseus, focusing on the mutability and chainability of state transformations.

To then use the Evolver (outside of Theseus), the code might look like this:

```typescript
interface GameState {
    preTurnCondition: string ` null;
    position: number;
    lastAction: string ` null;
}

let gameState: GameState = {
    preTurnCondition: null,
    position: 0,
    lastAction: null,
};

/**
 * # ================
 *
 * Using evolve:
 */

// Set a pre-turn condition
gameState = PlayerTurnEvolver.evolve(gameState)
    .via.setPreTurnCondition("Stealth Mode")
    .and.move(3)
    .lastly.takeAction("Attack");

/**
 * # ================
 *
 * Using mutate:
 */

// Set a pre-turn condition
gameState = PlayerTurnEvolver.mutate(gameState).via.setPreTurnCondition("Stealth Mode");

// Move the player by 3 units
gameState = PlayerTurnEvolver.mutate(gameState).via.move(3);

// Take an action, e.g., "Attack"
gameState = PlayerTurnEvolver.mutate(gameState).via.takeAction("Attack");

/**
 * # ================
 *
 * Using deconstructed mutators:
 */

const { setPreTurnCondition, move, takeAction } = PlayerTurnEvolver.mutate(gameState).getMutators();

// Set a pre-turn condition
gameState = setPreTurnCondition("Stealth Mode");

// Move the player by 3 units
gameState = move(3);

// Take an action, e.g., "Attack"
gameState = takeAction("Attack");
```

## EvolverComplexes

EvolverComplexes organize multiple related Evolvers, facilitating complex state evolution in a structured
manner.

### Example: Dungeons & Dragons Game Phases

A game of D&D progresses through various phases, such as character creation, exploration, and combat. An
`EvolverComplex` could blend multiple Evolvers to manage transitions between these phases:

```typescript
const PhaseEvolverComplex = EvolverComplex.create().withEvolvers({
    PlayerTurnEvolver,
    CharacterCreationEvolver,
    ExplorationEvolver,
    CombatEvolver,
    // Additional phase-specific Evolvers as needed
});
```

...and using the complex looks like this:

```typescript
const result = PhaseEvolverComplex.evolve(gameState)
    .PlayerTurn.via.setPreTurnCondition("Stealth Mode")
    .and.move(3)
    .lastly.takeAction("Attack");
```

## Async Mutators

Mutators can be asynchronous, and
