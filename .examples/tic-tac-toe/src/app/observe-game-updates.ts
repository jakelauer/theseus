import { getTheseusLogger } from "../../../../dist";
import { GameShip } from "../game-ship/game-ship";
import type { MarkType } from "../game-ship/state/GameState";

const observeLog = getTheseusLogger("Observe");

export default function(onUpdate: () => void, onWinner: (winner: MarkType) => void)
{
	GameShip.observe((state) => 
	{
		onUpdate();
			
		switch (state.winner) 
		{
			case "stalemate":
				observeLog.major("Stalemate detected! Game over.");
				break;
			case "X":
			case "O":
				onWinner(state.winner);
				break;
			default:
				observeLog.major("Move detected! Taking next turn...");
				GameShip.mutate.Turn.nextTurn();
				break;
		}
	}, false);
}

