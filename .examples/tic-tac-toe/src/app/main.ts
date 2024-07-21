import "../set-log-level.js";
import { GameShip } from "../game-ship/game-ship.js";
import observeGameUpdates from "./observe-game-updates.js";

observeGameUpdates();

GameShip.mutate.Turn.nextTurn().catch(console.error);
