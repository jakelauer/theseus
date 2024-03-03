import { GameState } from "state/GameState";
import { RefineryComplex } from "theseus-js";

import * as Refineries from "./refineries";

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries(Refineries);
