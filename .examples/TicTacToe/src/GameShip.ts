import theseus from "theseus-js";

import { GameStateEvolver } from "./evolve/GameStateEvolver.js";
import { GameRefineryComplex } from "./refine/GameRefineryComplex.js";
import { initialGameState } from "./state/GameState.js";

export const GameShip = theseus({
    initialData: initialGameState,
    evolvers: { GameStateEvolver },
    refineries: GameRefineryComplex,
});
