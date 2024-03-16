import { GameStateEvolver } from 'src/evolve/GameStateEvolver';
import { GameRefineryComplex } from 'src/refine/GameRefineryComplex';
import theseus from 'theseus-js';

import { initialGameState } from './state/GameState.js';

const x = "Asdf";

export const GameShip = theseus({
    initialData: initialGameState,
}).with({
    evolvers: { GameStateEvolver },
    refineries: GameRefineryComplex,
});
