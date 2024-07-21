import { EvolverComplex } from "theseus-js";
import type { GameState } from "../state/GameState.js";
import { TurnEvolver } from "./evolvers/TurnEvolver.js";
import { BoardEvolver } from "./evolvers/BoardEvolver.js";
import { MetaEvolver } from "./evolvers/MetaEvolver.js";

export const GameEvolverComplex = EvolverComplex.create<GameState>().withEvolvers(
	TurnEvolver,
	BoardEvolver,
	MetaEvolver,
);
