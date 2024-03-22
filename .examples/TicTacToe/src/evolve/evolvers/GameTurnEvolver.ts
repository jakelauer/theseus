import { Evolver, getTheseusLogger } from "theseus-js";
import { GameState } from "../../state/GameState";
import { GameBoardRefinery } from "../../refine/refineries/GameBoardRefinery";
import { GamePlayEvolver } from "./GamePlayEvolver";

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

            const nextMarkType = lastPlayer === "X" ? "O" : "X";
            const randomSquare = GameBoardRefinery(mutableGameState).getRandomAvailableSquare();
            if (!randomSquare) {
                return GameTurnEvolver.mutate(mutableGameState).using.gameOver("stalemate");
            }

            GamePlayEvolver.evolve(mutableGameState).using.playMove(randomSquare, nextMarkType);

            log.info(`Played square: ${randomSquare}`);

            mutableGameState.turns++;
            mutableGameState.lastPlayer = nextMarkType;

            return mutableGameState;
        },
    });
