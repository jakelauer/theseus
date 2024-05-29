# Part V: Theseus

Having introduced the `EvolverComplex` and `RefineryComplex` classes in the previous part, we will now introduce the `Theseus` class. The `Theseus` class is used to group together all of the evolvers, refineries, and their complexes together with the state they operate on.

Creating a Theseus instance requires, at a minimum, data for the state, and evolvers to mutate it. You can also include refineries to transform the state.

You may use the `EvolverComplex` and `RefineryComplex` classes to group your evolvers and refineries together, or you can provide them to the `Theseus` instance directly and it will group them for you.

```typescript
import theseus from "theseus-js";

import { GameRefineryComplex } from "./refine/GameRefineryComplex";
import { initialGameState } from "./state/GameState";
import { GameEvolverComplex } from "./evolve/GameEvolverComplex";

// Provide EvolverComplex and RefineryComplex instances
export const GameShip = theseus(initialGameState).maintainWith({
	evolvers: GameEvolverComplex,
	refineries: GameRefineryComplex,
});

// Or provide evolvers and refineries directly
export const GameShip = theseus(initialGameState).maintainWith({
	evolvers: [
		TurnEvolver,
		BoardEvolver,
		MetaEvolver,
	],
	refineries: [
		SquaresRefinery,
		OutcomeRefinery,
		RenderRefinery,
	],
});

```

Your `Theseus` instance will now allow you to:
- Access the state
- Modify the state using evolvers
- Transform the state using refineries
- Subscribe to changes in the state

All of this is done in accordance with [FIRM encapsulation](./part-0--FIRM-encapsulation.md), which, as you may remember, I invented for this tutorial. 
