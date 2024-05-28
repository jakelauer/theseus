import { EvolverComplex } from "theseus-js";
import type { GameState } from "../state/GameState";
import { TurnEvolver } from "./evolvers/TurnEvolver";
import { BoardEvolver } from "./evolvers/BoardEvolver";
import { MetaEvolver } from "./evolvers/MetaEvolver";

export const GameEvolverComplex = EvolverComplex.create<GameState>().withEvolvers(
	TurnEvolver,
	BoardEvolver,
	MetaEvolver,
);
