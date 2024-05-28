# Part III - Refining State

Refineries in Theseus are objects that define how to transform a piece of state into another. They are built using a fluent API that allows you to specify the operations to be performed on the state. Refineries can be simple or complex, depending on the requirements of your application.

## Building Refineries

To build a refinery, you need to define the operations that will transform the state. Refineries should never modify the state directly; instead, they should return a new state object with the desired changes. In fact, refineries freeze the state object to prevent accidental modifications.

If you do need to mutate the state object, you should use an evolver (covered in [Part II](./part-ii--evolving-state.md)) instead.

### Name

Just like evolvers, Refineries are always named, which makes working with higher-order components like [RefineryComplexes](./extended/refinery-complex.md) easy.

The `noun` for a refinery determines the name of the data argument passed to each `forge`. If you
don't specify a `noun`, it defaults to `"input"`. Each `forge`'s first argument will be an object of the refinery's data type, keyed by this noun, prefixed with `"immutable"` in camel-case:


```typescript
import { Refinery } from "theseus-js";
import type { Board, GameState } from "../../state/GameState";

export const RenderRefinery = Refinery.create("RenderRefinery", { noun: "GameState" })
	// .toRefine<GameState>()
	// .withForges({
	 	renderToString: ({ immutableGameState: { board } }) => 
	// 	{
	// 		const reducer = (acc: string[], row: Board[number]) => 
	// 		{
	// 			const rowString = row
	// 				.map((v) => (v ? v : "⬛"))
	// 				.join("")
	// 				.replace(/X/g, "❌")
	// 				.replace(/O/g, "⭕");
	// 			acc.push(rowString);
	// 			return acc;
	// 		};

	// 		return board.reduce<string[]>(reducer, []).join("\r\n");
	// 	},
	// });
```

### Immutable state

A refinery always uses one type of state as input, and you must tell the refinery that type when you create it, using the
`.toRefine()` method.

```typescript
import { Refinery } from "theseus-js";
import type { Board, GameState } from "../../state/GameState";

export const RenderRefinery = Refinery.create("RenderRefinery", { noun: "GameState" })
	// .toRefine<GameState>()
	// .withForges({
	 	renderToString: ({ immutableGameState: { board } }) => 
	// 	{
	// 		const reducer = (acc: string[], row: Board[number]) => 
	// 		{
	// 			const rowString = row
	// 				.map((v) => (v ? v : "⬛"))
	// 				.join("")
	// 				.replace(/X/g, "❌")
	// 				.replace(/O/g, "⭕");
	// 			acc.push(rowString);
	// 			return acc;
	// 		};

	// 		return board.reduce<string[]>(reducer, []).join("\r\n");
	// 	},
	// });
```

### Forges

Forges are the heart of evolvers. They are functions which take in an immutable object and return a modified version of that object. To return any other type, use an evolver instead.

The first argument of a forge must always be the immutable data object. Subsequent arguments can be added at the developer's discretion, and only those will be required when calling the mutator functions. The immutable data cannot be modified, because it is frozen when the refinery is created.

```typescript
import { Refinery } from "theseus-js";
import type { Board, GameState } from "../../state/GameState";

export const RenderRefinery = Refinery.create("RenderRefinery", { noun: "GameState" })
	.toRefine<GameState>()
	.withForges({
		/**
		 * Render the game board to a string
		 */
	 	renderToString: ({ immutableGameState: { board } }) => 
		{
			const reducer = (acc: string[], row: Board[number]) => 
			{
				const rowString = row
					.map((v) => (v ? v : "⬛"))
					.join("")
					.replace(/X/g, "❌")
					.replace(/O/g, "⭕");
				acc.push(rowString);
				return acc;
			};

			return board.reduce<string[]>(reducer, []).join("\r\n");
		},
	});
```

