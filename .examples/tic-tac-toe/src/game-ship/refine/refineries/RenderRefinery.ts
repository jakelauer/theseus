import { Refinery } from "theseus-js";

import type { Board, GameState } from "../../state/GameState";

export const RenderRefinery = Refinery.create("RenderRefinery", { noun: "GameState" })
	.toRefine<GameState>()
	.withForges({
		renderToString: ({ immutableGameState: { board } }) => 
		{
			const reducer = (acc: string[], row: Board[number]) => 
			{
				const rowString = row
					.map((v) => (v ? v : "⬛"))
					.join("")
					.replace(/X/g, "❌")
					.replace(/O/g, "⭕");
				acc.push(rowString);
				return acc;
			};

			return board.reduce<string[]>(reducer, []).join("\r\n");
		},
	});
