import { EvolverComplex } from "theseus-js";
import type { GameState } from "../state/GameState";
import { GameTurnEvolver } from "./evolvers/GameTurnEvolver";
import { GameBoardEvolver } from "./evolvers/GameBoardEvolver";
import { GameMetaEvolver } from "./evolvers/GameMetaEvolver";

export const GameEvolverComplex = EvolverComplex.create<GameState>().withEvolvers(
	GameTurnEvolver,
	GameBoardEvolver,
	GameMetaEvolver,
);
