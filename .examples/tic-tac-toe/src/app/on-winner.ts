import { getTheseusLogger } from "theseus-logger";
import { GameShip } from "../game-ship/game-ship";

const log = getTheseusLogger("OnWinner");

export const onWinner = () => 
{
	const foundTriple = GameShip.refine.Outcome.checkForTriples();
	if (foundTriple) 
	{
		const { markType, tripleTypePlainEnglish } = GameShip.refine.Outcome.getTripleType(foundTriple);
		log.major(`We have a winner! Three ${markType}s ${tripleTypePlainEnglish}!`);
	}
};
