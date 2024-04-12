import { Evolver, getTheseusLogger } from "theseus-js";
import type { GameState } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GameEvolverComplex } from "../GameEvolverComplex";

const log = getTheseusLogger("GameTurnEvolver");

export const { GameTurnEvolver } = Evolver.create("GameTurnEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        setWinner: ({ mutableGameState }, reason: "stalemate" | "winner") => 
        {
            log.major(`Game over! ${reason}`);
            mutableGameState.winner = reason === "winner" ? mutableGameState.lastPlayer : "stalemate";
            return mutableGameState;
        },
        nextTurn: ({ mutableGameState }): GameState => 
        {
            const { turns, lastPlayer } = mutableGameState;
            log.major(`Taking turn #${turns}`);

            const { GameBoard, GameMeta } = GameEvolverComplex.evolve(mutableGameState);
            const { getRandomAvailableCoords, getSquare } = GameBoardRefinery(mutableGameState);

            const mark = lastPlayer === "X" ? "O" : "X";
            const coords = getRandomAvailableCoords();
            if (!coords) 
            {
                return GameTurnEvolver.mutate(mutableGameState).via.setWinner("stalemate");
            }

            const isAvailable = !getSquare(coords);
            if (!isAvailable) 
            {
                throw new Error(`Square at ${coords} is already taken`);
            }

            GameBoard.setMark(coords, mark);

            GameMeta.iterateTurnCount().and.updateLastPlayer(mark).and.updateLastPlayedCoords(coords);

            return mutableGameState;
        },
    });
