# Part IV: EvolverComplex & RefineryComplex

In this part, we will introduce two new classes: `EvolverComplex` and `RefineryComplex`. These classes are both used to group together multiple instances which operate on the same datatype. The `EvolverComplex` class is used to group together multiple `Evolver` instances, while the `RefineryComplex` class is used to group together multiple `Refinery` instances. 

It is not necessary to use these classes, but they can be useful to help you encapsulate or organize your code, rather than forcing you to put all of your code in a single file, or arbitrarily splitting it up into multiple files without rhyme or reason.

## EvolverComplex

In the previous parts, we have seen how to use the `Evolver` class to mutate state. For our tic-tac-toe game, we created three instances:
- [BoardEvolver](../../.examples/tic-tac-toe/src/game-ship/evolve/evolvers/BoardEvolver.ts)
- [MetaEvolver](../../.examples/tic-tac-toe/src/game-ship/evolve/evolvers/MetaEvolver.ts)
- [TurnEvolver](../../.examples/tic-tac-toe/src/game-ship/evolve/evolvers/TurnEvolver.ts)

We can use these instances separately if we want, but we can also group them together in an `EvolverComplex` instance. This is useful if we want to use them together in a single place.

Here is an example of how we can create an `EvolverComplex` instance:

```typescript
import { EvolverComplex } from "theseus-js";
import type { GameState } from "../state/GameState";
import { TurnEvolver } from "./evolvers/TurnEvolver";
import { BoardEvolver } from "./evolvers/BoardEvolver";
import { MetaEvolver } from "./evolvers/MetaEvolver";

export const GameEvolverComplex = EvolverComplex.create<GameState>().withEvolvers(
	TurnEvolver,
	BoardEvolver,
	MetaEvolver,
);
```

Where before we would have to use the evolvers like this:

```typescript
BoardEvolver.evolve(myGameState)
	.via.setMark([0,0],"X");

TurnEvolver.evolve(myGameState)
	.via.nextTurn();

MetaEvolver.evolve(myGameState)
	.via.updateLastPlayer("X")
	.and.updateLastPlayedCoords([0,0]);
```

Now we can use the `GameEvolverComplex` instance to access the evolvers more succintly:

```typescript

const {
	Board,
	Turn,
	Meta
} = GameEvolverComplex.evolve(myGameState);

Board.setMark([0,0],"X");
Turn.nextTurn();

Meta.updateLastPlayer("X").and.updateLastPlayedCoords([0,0]);
```

You may notice that the `GameEvolverComplex.evolve(myGameState)` method returns an object with properties `Board`, `Turn`, and `Meta`, even though their names originally were `BoardEvolver`, `TurnEvolver`, and `MetaEvolver`. This is because the `EvolverComplex` class automatically renames the evolvers to remove the `Evolver` suffix. This is done to make the code more readable and to avoid redundancy.

## RefineryComplex

RefineryComplex is similar to EvolverComplex, but it is used to group together multiple `Refinery` instances. We can use it to group together multiple refineries that operate on the same datatype.

It mirrors the `EvolverComplex` class in usage:

```typescript
import type { GameState } from "game-ship/state/GameState";
import { RefineryComplex } from "theseus-js";
import { SquaresRefinery } from "./refineries/SquaresRefinery";
import { OutcomeRefinery } from "./refineries/OutcomeRefinery";
import { RenderRefinery } from "./refineries/RenderRefinery";

export const GameRefineryComplex = RefineryComplex.create<GameState>().withRefineries(
	SquaresRefinery,
	OutcomeRefinery,
	RenderRefinery,
);
```

And we can use it like this:

```typescript
const {
	Squares,
	Outcome,
	Render
} = GameRefineryComplex.refine(myGameState);

Squares.getRandomAvailableSquare();
Render.renderToString();
```
