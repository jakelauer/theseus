import { Evolver, getTheseusLogger } from "theseus-js";

import { GameState, MarkType } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GameMetaEvolver } from "./GameMetaEvolver";
import { GameBoardEvolver } from "./GameBoardEvolver";

const log = getTheseusLogger("GameStateEvolver");

export const { GamePlayEvolver } = Evolver.create("GamePlayEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        playMove: ({ mutableGameState }, coords: [number, number], mark: MarkType) => {
            log.info(`Received request to set square at ${coords} to ${mark}`);

            const isAvailable = !GameBoardRefinery(mutableGameState).getSquare(coords);
            if (!isAvailable) {
                throw new Error(`Square at ${coords} is already taken`);
            }

            GameMetaEvolver.evolve(mutableGameState)
                .via.updateLastPlayer(mark)
                .and.updateLastPlayedCoords(coords);

            GameBoardEvolver.evolve(mutableGameState).via.setMark(coords, mark);

            return mutableGameState;
        },
    });
