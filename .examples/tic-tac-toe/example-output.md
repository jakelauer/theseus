# Tic-tac-toe example output

Example output from running `pnpm start` in `.examples/tic-tac-toe`:

```log
fake-user@Jake-MacBook-M2-2 Tic-tac-toe % pnpm start

17:03:88:47.4747 verbose :: Creating refinery complex with refineries ⸨RefineryComplex⸩
|  {
|    "refineries": [ "GameBoardRefinery", "GameOutcomeRefinery" ]
|  }
17:03:88:47.4747 verbose :: Created evolver: GamePlayEvolver with mutators: ⸨Evolver⸩
|  {
|    "mutators": [ "playMove", "delayedSetSquare", "delayedClearSquares" ]
|  }
17:03:89:47.4747 verbose :: Created evolver: GameTurnEvolver with mutators: ⸨Evolver⸩
|  {
|    "mutators": [ "gameOver", "nextTurn" ]
|  }
17:03:89:47.4747 verbose :: Creating evolver complex with evolvers: ⸨EvolverComplex⸩
|  {
|    "evolvers": [ "GamePlayEvolver", "GameTurnEvolver" ]
|  }
17:03:89:47.4747 major :: Turn 0 ⸨GameTurnEvolver⸩
17:03:89:47.4747 info :: Unused squares: 9 ⸨GameBoardRefinery⸩
17:03:89:47.4747 info :: Getting random available square at 2,2 ⸨GameBoardRefinery⸩
17:03:89:47.4747 info :: Received request to set square at 2,2 to O ⸨GameStateEvolver⸩
17:03:89:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:89:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:89:47.4747 info :: Played square: 2,2 ⸨GameTurnEvolver⸩
17:03:89:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:89:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:89:47.4747 info :: Board state
⬛⬛⬛
⬛⬛⬛
⬛⬛⭕
 ⸨Observe⸩
17:03:89:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:89:47.4747 major :: Turn 1 ⸨GameTurnEvolver⸩
17:03:89:47.4747 info :: Unused squares: 8 ⸨GameBoardRefinery⸩
17:03:89:47.4747 info :: Getting random available square at 2,1 ⸨GameBoardRefinery⸩
17:03:89:47.4747 info :: Received request to set square at 2,1 to X ⸨GameStateEvolver⸩
17:03:89:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:89:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:89:47.4747 info :: Played square: 2,1 ⸨GameTurnEvolver⸩
17:03:89:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⬛⬛⬛
⬛⬛⬛
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 2 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 7 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 1,0 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 1,0 to O ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 1,0 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⬛⬛⬛
⭕⬛⬛
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 3 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 6 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 0,2 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 0,2 to X ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 0,2 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⬛⬛❌
⭕⬛⬛
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 4 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 5 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 0,0 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 0,0 to O ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 0,0 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⭕⬛❌
⭕⬛⬛
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 5 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 4 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 1,2 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 1,2 to X ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 1,2 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⭕⬛❌
⭕⬛❌
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 6 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 3 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 0,1 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 0,1 to O ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 0,1 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⭕⭕❌
⭕⬛❌
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 7 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 2 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 1,1 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 1,1 to X ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 1,1 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Checked 8 triples and found no winner ⸨GameOutcomeRefinery⸩
17:03:90:47.4747 info :: Board state
⭕⭕❌
⭕❌❌
⬛❌⭕
 ⸨Observe⸩
17:03:90:47.4747 major :: Move detected! Taking next turn... ⸨Observe⸩
17:03:90:47.4747 major :: Turn 8 ⸨GameTurnEvolver⸩
17:03:90:47.4747 info :: Unused squares: 1 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Getting random available square at 2,0 ⸨GameBoardRefinery⸩
17:03:90:47.4747 info :: Received request to set square at 2,0 to O ⸨GameStateEvolver⸩
17:03:90:47.4747 info :: [Proxy] [=== Chain end reached ===] via "finally" ⸨Queue⸩
17:03:90:47.4747 info :: [Proxy] .finally mode active, returning result of queued operations ⸨Queue⸩
17:03:90:47.4747 info :: Played square: 2,0 ⸨GameTurnEvolver⸩
17:03:91:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:91:47.4747 major :: Game over! winner ⸨GameTurnEvolver⸩
17:03:91:47.4747 info :: Board state
⭕⭕❌
⭕❌❌
⭕❌⭕
 ⸨Observe⸩
17:03:91:47.4747 info :: Checking for triples ⸨GameOutcomeRefinery⸩
17:03:91:47.4747 major :: We have a winner! Three Os down! ⸨Observe⸩
```
