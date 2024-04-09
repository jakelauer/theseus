import { Evolver, getTheseusLogger } from "theseus-js";
import { GameState } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GamePlayEvolver } from "./GamePlayEvolver";
import { GameMetaEvolver } from "./GameMetaEvolver";

const log = getTheseusLogger("GameTurnEvolver");

export const { GameTurnEvolver } = Evolver.create("GameTurnEvolver", { noun: "gameState" })
    .toEvolve<GameState>()
    .withMutators({
        gameOver: ({ mutableGameState }, reason: "stalemate" | "winner") => {
            log.major(`Game over! ${reason}`);
            mutableGameState.winner = reason === "winner" ? mutableGameState.lastPlayer : "stalemate";
            return mutableGameState;
        },
        nextTurn: ({ mutableGameState }): GameState => {
            const { turns, lastPlayer } = mutableGameState;
            log.major(`Turn ${turns}`);

            const currentPlayer = lastPlayer === "X" ? "O" : "X";
            const coordsForTurn = GameBoardRefinery(mutableGameState).getRandomAvailableCoords();
            if (!coordsForTurn) {
                return GameTurnEvolver.mutate(mutableGameState).via.gameOver("stalemate");
            }

            GamePlayEvolver.evolve(mutableGameState).via.playMove(coordsForTurn, currentPlayer);

            GameMetaEvolver.evolve(mutableGameState)
                .via.iterateTurnCount()
                .and.updateLastPlayer(currentPlayer);

            return mutableGameState;
        },
    });
