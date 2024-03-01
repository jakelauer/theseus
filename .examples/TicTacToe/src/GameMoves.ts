import { GameStateEvolver } from "./evolve/GameStateEvolver";
import { getCurrentGameState, MarkType } from "./state/GameState";

export const GameMoves = {
    setSquare: (coords: [number, number], mark: MarkType) => {
        const gameState = getCurrentGameState();
        GameStateEvolver.evolve(gameState).using.setSquare(coords, mark);
    },
};
