import { getTheseusLogger } from "theseus-js";
import { GameShip } from "../game-ship/game-ship";

const log = getTheseusLogger("OnGameUpdated");

export const onGameUpdated = () => 
{
	const foundTriple = GameShip.refine.Outcome.checkForTriples();
	if (foundTriple) 
	{
		GameShip.evolve.Turn.setWinner("winner");
	}

	const rendered = GameShip.refine.Render.renderToString();

	log.major("Board state\r\n%s\r\n", rendered);
};
