# Evolvers and EvolverComplexes

## Overview

The Theseus library introduces Evolvers and EvolverComplexes as foundational tools for state management.
Evolvers facilitate data transformations through both singular mutations and sequential, chained
transformations. EvolverComplexes enable grouping of these Evolvers for more complex and organized state
evolution scenarios.

## Evolvers

Evolvers are designed to encapsulate specific transformations on data, offering a modular approach to state
management.

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
    preTurnCondition: string | null;
    position: number;
    lastAction: string | null;
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
    .using.setPreTurnCondition("Stealth Mode")
    .then.move(3)
    .finally.takeAction("Attack");

/**
 * # ================
 *
 * Using mutate:
 */

// Set a pre-turn condition
gameState = PlayerTurnEvolver.mutate(gameState).using.setPreTurnCondition("Stealth Mode");

// Move the player by 3 units
gameState = PlayerTurnEvolver.mutate(gameState).using.move(3);

// Take an action, e.g., "Attack"
gameState = PlayerTurnEvolver.mutate(gameState).using.takeAction("Attack");

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
    .PlayerTurn.using.setPreTurnCondition("Stealth Mode")
    .then.move(3)
    .finally.takeAction("Attack");
```
