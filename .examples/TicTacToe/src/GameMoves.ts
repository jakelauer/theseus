import { GameStateEvolver } from "./evolve/GameStateEvolver";
import { getCurrentGameState, MarkType } from "./GameState";

export const GameMoves = {
    setSquare: (coords: [number, number], mark: MarkType) => {
        const gameState = getCurrentGameState();
        GameStateEvolver.evolve(gameState).using.setSquare(coords, mark);
    },
    test: async () => {
        const gameState = getCurrentGameState();
        await GameStateEvolver.evolve(gameState)
            .using.delayedClearSquares()
            .finally.delayedSetSquare([0, 0], "X");
    },
};
