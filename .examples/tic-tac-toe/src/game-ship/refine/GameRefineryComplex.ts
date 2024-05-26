import type { GameState } from "game-ship/state/GameState";
import { RefineryComplex } from "theseus-js";

import { GameBoardRefinery } from "./refineries/GameBoardRefinery";
import { GameOutcomeRefinery } from "./refineries/GameOutcomeRefinery";

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries({
	GameBoardRefinery,
	GameOutcomeRefinery,
});
