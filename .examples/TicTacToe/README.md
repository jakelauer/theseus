# TicTacToe Example

This TicTacToe example demonstrates a game of TicTacToe using Theseus. It is located in the
`.examples/TicTacToe` directory and includes a README.md with example output from running the game.

## How to Run the Example

1. Navigate to the `.examples/TicTacToe` directory.
2. Run the command `pnpm start` to start the game.

## Example Output

When the game is run, detailed log output showcases the game's progress, including the creation of refinery
complexes, evolvers, and the sequence of turns taken by the game. It details actions such as setting squares,
checking for game outcomes (like finding a winner), and the state of the game board after each move.

### Key Points in the Output:

-   Creation of refinery complexes with refineries like
    [`GameBoardRefinery`](./src/game-ship/refine/refineries/GameBoardRefinery.ts) and
    [`GameOutcomeRefinery`](./src/game-ship/refine/refineries/GameOutcomeRefinery.ts).
-   Creation of evolvers such as [`GamePlayEvolver`](./src/game-ship/evolve/evolvers/GamePlayEvolver.ts) and
    [`GameTurnEvolver`](./src/game-ship/evolve/evolvers/GameTurnEvolver.ts), with specific mutators/actions
    they can perform.
-   A log of each turn taken, including the unused squares, the action of setting squares with either X or O,
    and checking for winning conditions.
-   The final output shows the board state after each move, indicating moves with ⬛ for empty squares, ⭕ for
    O's, and ❌ for X's. The output concludes with the announcement of a game over, indicating a winner or a
    draw if applicable.

This example showcases Theseus's capabilities in managing and evolving game state, demonstrating complex state
manipulation through a familiar game of TicTacToe. It serves as a practical demonstration of Theseus's
capabilities and as a template for building more complex state-driven applications.

[See example output from running `pnpm start` in `.examples/TicTacToe`](./example-output.md)
