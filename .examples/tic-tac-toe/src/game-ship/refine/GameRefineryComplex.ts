import type { GameState } from "game-ship/state/GameState";
import { RefineryComplex } from "theseus-js";
import { SquaresRefinery } from "./refineries/SquaresRefinery.js";
import { OutcomeRefinery } from "./refineries/OutcomeRefinery.js";
import { RenderRefinery } from "./refineries/RenderRefinery.js";

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries(
	SquaresRefinery,
	OutcomeRefinery,
	RenderRefinery,
);
