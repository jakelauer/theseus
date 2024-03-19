import { GameState } from "state/GameState";
import { RefineryComplex } from "theseus-js";

import { GameBoardRefinery } from "../refine/refineries/GameBoardRefinery";
import { GameOutcomeRefinery } from "../refine/refineries/GameOutcomeRefinery";

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries({
    GameBoardRefinery,
    GameOutcomeRefinery,
});
