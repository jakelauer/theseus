import { GameState } from 'src/state/GameState';
import { RefineryComplex } from 'theseus-js';

import { GameBoardRefinery } from '../refine/refineries/GameBoardRefinery.js';
import { GameOutcomeRefinery } from '../refine/refineries/GameOutcomeRefinery.js';

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries({
    GameBoardRefinery,
    GameOutcomeRefinery,
});
