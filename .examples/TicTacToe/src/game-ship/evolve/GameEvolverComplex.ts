import { EvolverComplex } from "theseus-js";
import { GameState } from "../state/GameState";
import { GamePlayEvolver } from "./evolvers/GamePlayEvolver";
import { GameTurnEvolver } from "./evolvers/GameTurnEvolver";

export const GameEvolverComplex = EvolverComplex.create<GameState>().withEvolvers({
    GamePlayEvolver,
    GameTurnEvolver,
});
