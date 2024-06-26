import { getTheseusLogger } from "theseus-js";
import { GameShip } from "../game-ship/game-ship";
import { onWinner } from "./on-winner";
import { onGameUpdated } from "./on-game-updated";

const log = getTheseusLogger("Observe");

export default function()
{
	GameShip.observe(async (state) => 
	{		
		switch (state.winner) 
		{
			case "stalemate":
				log.major("Stalemate detected! Game over.");
				break;
			case "X":
			case "O":
				onWinner();
				break;
			default:
				log.major("Move detected! Taking next turn...");
				await onGameUpdated();
				break;
		}
	}, false);
}

