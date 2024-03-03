import { GameStateEvolver } from "evolve/GameStateEvolver";
import { initialGameState, MarkType } from "state/GameState";
import theseus from "theseus-js";

import { GameRefineryComplex } from "./refine/GameRefineryComplex";

const GameShip = theseus({
    initialData: initialGameState,
})
    .evolveWith({ GameStateEvolver })
    .refineWith(GameRefineryComplex);

GameShip.observe((_state) => {
    console.log("Game state changed");

    const hasWinner = GameShip.refine.GameOutcome.hasWinner();
    if (hasWinner) {
        console.log("We have a winner!");
    }
});

const playMove = (row: number, col: number, markType: MarkType) => {
    GameShip.evolve.GameState.setSquare([row, col], markType);

    console.log(`Move played at ${row}, ${col} with mark type ${markType}`);
};

let previousMarkType: MarkType = "X";
const nextTurn = () => {
    const nextMarkType = previousMarkType === "X" ? "O" : "X";
    playMove(0, 0, nextMarkType);
    previousMarkType = nextMarkType;

    nextTurn();
};
