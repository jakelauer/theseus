import theseus from "theseus-js";

import { GameRefineryComplex } from "./refine/GameRefineryComplex";
import { initialGameState } from "./state/GameState";
import { GameEvolverComplex } from "./evolve/GameEvolverComplex";

export const GameShip = theseus({
    initialData: initialGameState,
    evolvers: GameEvolverComplex,
    refineries: GameRefineryComplex,
});
