import { getTheseusLogger, setTheseusLogLevel } from "theseus-js";

import { GameShip } from "./game-ship/game-ship";

setTheseusLogLevel("major");

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
            GameShip.mutate.GameTurn.nextTurn();
            break;
    }
}, false);

const onWinner = () => 
{
    const foundTriple = GameShip.refine.GameOutcome.checkForTriples();
    if (foundTriple) 
    {
        const { markType, tripleTypePlainEnglish } = GameShip.refine.GameOutcome.getTripleType(foundTriple);
        observeLog.major(`We have a winner! Three ${markType}s ${tripleTypePlainEnglish}!`);
    }
};

const onGameUpdated = () => 
{
    const foundTriple = GameShip.refine.GameOutcome.checkForTriples();
    if (foundTriple) 
    {
        GameShip.evolve.GameTurn.setWinner("winner");
    }

    const rendered = GameShip.refine.GameBoard.renderToString();

    observeLog.info("Board state\r\n%s\r\n", rendered);
};

GameShip.mutate.GameTurn.nextTurn();
