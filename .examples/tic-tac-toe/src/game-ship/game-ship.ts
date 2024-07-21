import { theseus } from "theseus-js";

import { GameRefineryComplex } from "./refine/GameRefineryComplex.js";
import { initialGameState } from "./state/GameState.js";
import { GameEvolverComplex } from "./evolve/GameEvolverComplex.js";

export const GameShip = theseus(initialGameState).maintainWith({
	evolvers: GameEvolverComplex,
	refineries: GameRefineryComplex,
});
