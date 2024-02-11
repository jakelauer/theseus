# GameStateEvolver

## Table of Contents

-   [Introduction](#introduction)
-   [Usage](#usage)
-   [Chaining Methods](#chaining-methods)
-   [evolve vs. evolveMacro](#evolve-vs-evolvemacro)
-   [Special Notes](#special-notes)

## Introduction

Evolvers are a specialized component of the Theseus library designed for evolving game state objects. It leverages the
power of Evolver to mutate game states efficiently and intuitively.

### Creating an Evolver

#### Naming the Evolver

When creating an Evolver, it's important to give it a specific name. This name is used to reference the Evolver as it is
returned inside an object with the same name. For example:

```typescript
const { MyEvolver } = Evolver.create("MyEvolver");
```

In this code, `MyEvolver` is both the name given to the Evolver and the key used to retrieve it from the object returned
by `Evolver.create`.

#### Creating Mutators

Mutators are functions defined to evolve the data. They always take the data as the first argument. You can specify any
number of additional arguments for each mutator. When you use the mutator, only the additional arguments need to be
provided. Mutators always return the same data type they take in.

Example:

```typescript
const { MyEvolver } = Evolver.create("MyEvolver")
    .toEvolve<MyDataType>()
    .withMutators({
        mutator1: (mutableData, arg1, arg2) => {
            // Mutation logic here
            return mutableData;
        },
        mutator2: (mutableData, arg1) => {
            // Mutation logic here
            return mutableData;
        },
    });
```

Here, `mutator1` is a mutator for `MyEvolver` that takes `mutableData` along with additional arguments `arg1` and
`arg2`.

When we use `MyEvolver` later, we don't need to pass in the mutableData for every mutator; we only do that once:

```typescript
MyEvolver.evolveMacro(data).using.mutator1("first arg", "second arg").and.mutator2("just one arg");
```

## Usage

```typescript
import { Evolver } from "theseus-js";

// Assuming GameState structure
interface GameState {
    board: string[][];
    lastPlayer: string;
    lastPlayedCoords: [number, number];
}

// Initial game state
const initialGameState: GameState = {
    board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ],
    lastPlayer: "",
    lastPlayedCoords: [-1, -1],
};

// Create an instance of GameStateEvolver
const { GameStateEvolver } = Evolver.create("GameStateEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setSquare: ({ mutableGameState }, coords: [number, number], mark: string) => {
            const [row, col] = coords;
            mutableGameState.board[row][col] = mark;
            mutableGameState.lastPlayer = mark;
            mutableGameState.lastPlayedCoords = coords;

            return mutableGameState;
        },
    });

// Example usage: Setting a square on the board
GameStateEvolver.evolve(initialGameState).using.setSquare([0, 0], "X");

// The board after the move
console.log(initialGameState.board);
```

### Evolve vs. EvolveMacro

#### `evolve`

-   **Purpose**: Used for single, straightforward evolutions.
-   **Description**: The `evolve` method is ideal for simple, one-step mutations where only a single mutator is applied
    to the data.

#### `evolveMacro`

-   **Purpose**: Enables chained, multiple evolutions.
-   **Description**: The `evolveMacro` method is designed for more complex scenarios where multiple mutations need to be
    applied in sequence. This method provides a fluent interface to chain multiple mutators together.

        Example:

```typescript
MyEvolver.evolveMacro(initialState).using.mutator1().and.mutator2().and.mutator3(); // Continue chaining as needed
```

## Chaining Methods

-   **using**: This method applies specific mutations to the game state, allowing for concise and readable state
    transformations.

    ```typescript
    GameStateEvolver.evolve(initialGameState).using.setSquare([0, 0], "X");
    ```

-   **startingWith**: Begins a chain of transformations, allowing multiple operations to be applied in sequence.

    ```typescript
    GameStateEvolver.evolve(initialGameState)
        .startingWith.setSquare([0, 0], "X")
        .setSquare([1, 1], "O")
        .setSquare([2, 2], "X");
    ```

-   **and**: Utilized for chaining multiple operations in sequence within the game evolution process. It allows for
    sequential mutations to be applied to the game state.

    ```typescript
    GameStateEvolver.evolve(initialGameState)
        .startingWith.setSquare([0, 0], "X")
        .and.setSquare([1, 1], "O")
        .and.setSquare([0, 1], "X")
        .and.setSquare([1, 0], "O")
        .endingWith.setSquare([2, 2], "X");
    ```

-   **endingWith**: Concludes a chain of transformations with a specific operation or a set of operations, following the
    initial and intermediate operations.

    ```typescript
    GameStateEvolver.evolve(initialGameState)
        .startingWith.setSquare([0, 0], "O")
        .and.setSquare([1, 1], "X")
        .endingWith.setSquare([2, 2], "O");
    ```

-   **getFinalForm**: Finalizes a chain and returns the evolved value, particularly useful after asynchronous
    operations.

    ```typescript
    GameStateEvolver.evolve(initialGameState).startingWith.setSquare([0, 0], "X").setSquare([1, 1], "O").getFinalForm(); // Use after async operations
    ```
