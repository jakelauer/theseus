import { getTheseusLogger } from "theseus-js";
import "../set-log-level";
import { GameShip } from "../game-ship/game-ship";

const observeLog = getTheseusLogger("Observe");

GameShip.observe((state) => 
{
	onGameUpdated();

	switch (state.winner) 
	{
		case "stalemate":
			observeLog.major("Stalemate detected! Game over.");
			break;
		case "X":
		case "O":
			onWinner();
			break;
		default:
			observeLog.major("Move detected! Taking next turn...");
			GameShip.mutate.Turn.nextTurn();
			break;
	}
}, false);

const onWinner = () => 
{
	const foundTriple = GameShip.refine.Outcome.checkForTriples();
	if (foundTriple) 
	{
		const { markType, tripleTypePlainEnglish } = GameShip.refine.Outcome.getTripleType(foundTriple);
		observeLog.major(`We have a winner! Three ${markType}s ${tripleTypePlainEnglish}!`);
	}
};

const onGameUpdated = () => 
{
	const foundTriple = GameShip.refine.Outcome.checkForTriples();
	if (foundTriple) 
	{
		GameShip.evolve.Turn.setWinner("winner");
	}

	const rendered = GameShip.refine.Render.renderToString();

	observeLog.info("Board state\r\n%s\r\n", rendered);
};

GameShip.mutate.Turn.nextTurn();
