import { getTheseusLogger, setTheseusLogLevel } from "theseus-js";

import { GameShip } from "./GameShip.js";
import { MarkType } from "./state/GameState.js";

setTheseusLogLevel("major");
const gameLog = getTheseusLogger("Game");
const observeLog = getTheseusLogger("Observe");

GameShip.observe((state) => {
    const rowsAsStrings = state.board.reduce((acc, row, index) => {
        acc[`row${index + 1}`] = row.join(" ");
        return acc;
    }, {} as any);
    observeLog.info("Board state", rowsAsStrings);

    const foundTriple = GameShip.refine.GameOutcome.checkForTriples();
    if (foundTriple) {
        const markType = state.board[foundTriple.from[0]][foundTriple.from[1]];
        const tripleTypePlainEnglish =
            foundTriple.type === "row" ? "across"
            : foundTriple.type === "column" ? "down"
            : "diagonally";
        observeLog.major(`We have a winner! Three ${markType}s ${tripleTypePlainEnglish}!`);
    } else {
        observeLog.info("Move detected!");
        nextTurn();
    }
}, false);

const playMove = ([row, col]: [number, number], markType: MarkType) => {
    gameLog.info(`Playing move at [${row}, ${col}] with mark type ${markType}`);
    try {
        GameShip.mutate.GameState.setSquare([row, col], markType);
    } catch (e) {
        gameLog.error(e);
    }
};

let previousMarkType: MarkType = "X";
let turns = 0;
const nextTurn = () => {
    gameLog.info(`Turn ${turns}`);
    const nextMarkType = previousMarkType === "X" ? "O" : "X";
    const randomSquare = GameShip.refine.GameBoard.getRandomAvailableSquare();
    if (!randomSquare) {
        gameLog.major("Stalemate! No more moves available!");
        return;
    }

    playMove(randomSquare, nextMarkType);
    gameLog.info(`Played square: ${randomSquare}`);

    previousMarkType = nextMarkType;
    turns++;
};

nextTurn();
