import type { GameState } from "game-ship/state/GameState";
import { RefineryComplex } from "theseus-js";
import { SquaresRefinery } from "./refineries/SquaresRefinery";
import { OutcomeRefinery } from "./refineries/OutcomeRefinery";
import { RenderRefinery } from "./refineries/RenderRefinery";

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries(
	SquaresRefinery,
	OutcomeRefinery,
	RenderRefinery,
);
