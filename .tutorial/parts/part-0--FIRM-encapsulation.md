# Part 0: FIRM Encapsulation, or "Why does Theseus exist?"

## What is FIRM?

I have a confession to make: I made up the term "FIRM" for this tutorial. 

|  |      |                        |
|--------|-----------|-----------------------------------|
| `F`     | **Fluent**    | Natural, expressive, readable.    |
| `I`     | **Immutable** | Predictable, safe, unchanging.    |
| `R`     | **Reliable**  | Consistent, dependable, testable. |
| `M`     | **Modular**   | Composable, reusable, extensible. |


The idea is to encapsulate the state of your application in a way that is easy to work with, easy to reason about, and easy to test. Theseus exists to help you achieve this goal.

State management is as critical as it is complex. It's the backbone of your application, and it's the source of many bugs and headaches. Theseus is designed to help you manage state the way you think about it: as a series of transformations.

In this tutorial, we'll build a simple Tic-tac-toe game. Think about how you would manage the state of this game. You'd need to keep track of the board, the players, the current turn, and the winner. You'd need to update the board when a player makes a move, and you'd need to check for a winner after each move. You'd need to handle the end of the game and reset the board for a new game. Each of these steps results in a new state of the game, and each step may involve multiple transformations. Managing this complexity is where Theseus shines, because it allows you to define these transformations in a clear, concise way.

## Why "Theseus"?

The name "Theseus" comes from a thought experiment called the [Ship of Theseus](https://en.wikipedia.org/wiki/Ship_of_Theseus). It poses a question: if you replace one part of a ship, and then another, and then another, until every part has been replaced, is it still the same ship? 

This library won't answer that question 🙂 But it's a useful metaphor for complex state transformations, and Theseus helps manage those complex transformations by breaking them down into discrete, targeted actions that can be grouped together.

## Analogy: Dominoes, Bingo, or something in between?

When managing state, it is tempting to think of it as either a series of steps to follow in order (like playing a game of dominoes), or as a series of actions which are performed completely independently (like filling in numbers on a Bingo card). In many cases, the reality is somewhere in between.

Consider a jigsaw puzzle. You wouldn't start by finding the top-left corner piece and then work your way across the top row:
```typescript
// Find the piece for each position in the puzzle
function solvePuzzle(puzzle: Puzzle): Puzzle {
	let lastSolvedIndex = 0;
	while(remainingPieces > 0){
		for(let i = 0; i < remainingPieces.length; i++) {
			const piece = remainingPieces[i];
			if(pieceFits(puzzle, piece, lastSolvedIndex)) {
				// Hey, we found a piece that fits! It only took forever.
				puzzle = placePiece(puzzle, piece, lastSolvedIndex);
				lastSolvedIndex++;
			}
		}
		// Don't worry, only 999,999 more iterations to go!
	}
}
```


Neither would you take random pieces and try to find their place on the empty board:

```typescript
function solvePuzzleRandomly(puzzle: Puzzle): Puzzle {
	while (remainingPieces.length > 0) {
		// Let's randomly pick a piece and hope it fits somewhere!
		const randomIndex = Math.floor(Math.random() * remainingPieces.length);
		const piece = remainingPieces[randomIndex];
		let placed = false;

		// Try to place this piece at any open position
		for (let pos = 0; pos < puzzle.length; pos++) {
			if (pieceFits(puzzle, piece, pos)) {
				// Eureka! We found a spot for this random piece.
				puzzle = placePiece(puzzle, piece, pos);
				remainingPieces.splice(randomIndex, 1);
				placed = true;
				break;
			}
		}

		if (!placed) {
			// Oops, the random piece didn't fit anywhere. Let's try another one.
			// This method might be slightly less effective than a monkey solving a puzzle.
		}
	}
	// If it worked, it must be a miracle!
	return puzzle;
}
```

Instead, you might start by finding the edge pieces, then the corner pieces, then the pieces with a specific color or pattern. You might group pieces by shape or size, or by the image they contain. You might work on different sections of the puzzle at the same time, or you might focus on one area until it's complete. These are all valid strategies for solving the puzzle, and they are all composed of a series of smaller, interdependent actions chained together. 

Here's some pseudo-code for placing a piece in a jigsaw puzzle:

```typescript
function placePiece(puzzle: Puzzle, piece: Piece): Puzzle {
	const pieceAttributes = {
		edge: findEdge(piece), // EdgeType | undefined
		corner: findCorner(piece), // CornerType | undefined
		colorGroup: findColorGroup(piece), // ColorGroup | undefined
		notableFeature: findNotableFeature(piece), // NotableFeature | undefined
	};

	result = tryPlacePieceByEdge(puzzle, piece) 
		?? tryPlacePieceByCorner(puzzle, piece) 
		?? tryPlacePieceByColorGroup(puzzle, piece) 
		?? tryPlacePieceByNotableFeature(puzzle, piece);

	// If we couldn't place the piece in any group, add it the group with the highest likelihood
	return result ?? addUnplacedToGroup(puzzle, piece, determinePieceGroupLikelihood(puzzle, pieceAttributes);
}
```

In Theseus, you can use evolvers and refineries to break down complex state transformations into smaller, more manageable pieces, then use them in combination fluently to achieve your desired result:

```typescript

	const PuzzlePieceRefinery = Refinery.create("PuzzlePieceRefinery", {noun: "piece"})
		.toEvolve<PuzzleState>()
		.withMutators({
			findEdge: ({immutablePiece}) => {
				// Find the edge type of the piece
				return edgeType;
			},
			findCorner: ({immutablePiece}) => {
				// Find the corner type of the piece
				return cornerType;
			},
			findColorGroup: ({immutablePiece}) => {
				// Find the color group of the piece
				return colorGroup;
			},
			findNotableFeature: ({immutablePiece}) => {
				// Find the notable feature of the piece
				return notableFeature;
			},
			determinePieceGroupLikelihood: ({immutablePiece, immutablePuzzle}, pieceAttributes) => {
				// Determine the likelihood of the piece being in each group
				return pieceGroupLikelihood;
			},
		});

	export const PuzzleEvolver = Evolver.create("PuzzleEvolver", {noun: "puzzle"})
		.toEvolve<PuzzleState>()
		.withMutators({
			placePieceByCoords: ({mutablePuzzle}, piece: Piece, coords: Coordinates) => {
				// Mark the piece as placed
				mutablePuzzle.byCoordinates[coords] = piece;
				mutablePuzzle.pieceStatus[piece.id] = "placed";
				return mutablePuzzle;
			},
			tryPlacePieceByEdge: ({mutablePuzzle}, piece: Piece) => {
				// Try to place the piece by edge
				const foundEdgeCoordinates= PuzzlePieceRefinery.refine(mutablePuzzle).findEdge(piece);
				mutablePuzzle = PuzzleEvolver.mutate(mutablePuzzle).via.placePieceByCoords(piece, foundEdgeCoordinates);
				return mutablePuzzle;
			},
			tryPlacePieceByCorner: ({mutablePuzzle}, piece: Piece) => {
				// Try to place the piece by corner
				const foundCornerCoordinates= PuzzlePieceRefinery.refine(mutablePuzzle).findCorner(piece);
				mutablePuzzle = PuzzleEvolver.mutate(mutablePuzzle).via.placePieceByCoords(piece, foundCornerCoordinates);
				return mutablePuzzle;
			},
			tryPlacePieceByColorGroup: ({mutablePuzzle}, piece: Piece) => {
				// Try to place the piece by color group
				const foundColorGroupCoordinates= PuzzlePieceRefinery.refine(mutablePuzzle).findColorGroup(piece);
				mutablePuzzle = PuzzleEvolver.mutate(mutablePuzzle).via.placePieceByCoords(piece, foundColorGroupCoordinates);
				return mutablePuzzle;
			},
			tryPlacePieceByNotableFeature: ({mutablePuzzle}, piece: Piece) => {
				// Try to place the piece by notable feature
				const foundNotableFeatureCoordinates= PuzzlePieceRefinery.refine(mutablePuzzle).findNotableFeature(piece);
				mutablePuzzle = PuzzleEvolver.mutate(mutablePuzzle).via.placePieceByCoords(piece, foundNotableFeatureCoordinates);
				return mutablePuzzle;
			},
			addUnplacedToGroup: ({mutablePuzzle}, piece: Piece) => {
				if(mutablePuzzle.pieceStatus[piece.id] !== "placed") {
					const mostLikelyGroup= PuzzlePieceRefinery.refine(mutablePuzzle).determinePieceGroupLikelihood(piece);
					mutablePuzzle.byGroup[mostLikelyGroup].push(piece);
				}
				
				return mutablePuzzle;
			},
			tryPlacePiece: ({mutablePuzzle}, piece: Piece) => {
				PuzzleEvolver.evolve(mutablePuzzle)
					.via.tryPlacePieceByEdge(piece)
					.and.tryPlacePieceByCorner(piece)
					.and.tryPlacePieceByColorGroup(piece)
					.and.tryPlacePieceByNotableFeature(piece)
					.and.finally.addUnplacedToGroup(piece);

				return mutablePuzzle;
			},
		});

```


## Analogy: Cleaning your house

Imagine you're leaving instructions for a team of house cleaners. 

You have a list of rooms, and each room has a different shape, size, and set of items to clean. You also have a list of tasks, which may be specific to a room, a subset of rooms, or the entire house. 

You recognize that you clean the house differently than the cleaners do. You might start in the kitchen, then move to the living room, then the bedrooms. You might clean the floors first, then the counters, then the windows. It wouldn't be useful to give the cleaners a list of tasks in the order you perform them, because they will be working in parallel.

Instead, you want to give them a list of tasks that they can perform in any order, where any given member of the cleaning crew might by assigned to a specific room, or a specific task, or both. To go a step further, each task may be broken down into sub-tasks, and each sub-task may have its own dependencies. For example, cleaning the shower requires cleaning the tub first, and cleaning the tub requires several products which must be fetched from the supply closet and applied in a specific order.

Theseus is great at this. Here's how that might look:

### Define the state

```typescript
// Define types for clarity
type SurfaceType = "tile" | "carpet" | "shelf" | "window" | "counter";
type RoomType = "kitchen" | "livingRoom" | "bedroom" | "bathroom";
type RoomState = {
	type: RoomType;
	cleanedSurfaces: string[];
};
type HouseState = {
	rooms: { [key: string]: RoomState };
};

// Initial house state
const initialHouseState: HouseState = {
	rooms: {
		kitchen: {
			type: "kitchen",
			cleanedSurfaces: [],
		},
		livingRoom: {
			type: "livingRoom",
			cleanedSurfaces: [],
		},
		bedroom: {
			type: "bedroom",
			cleanedSurfaces: [],
		},
		bathroom: {
			type: "bathroom",
			cleanedSurfaces: [],
		},
	},
};
```

### Define the evolvers

```typescript
const SurfaceEvolver = Evolver.create("SurfaceEvolver", { noun: "surface" })
	.toEvolve<RoomState>()
	.withMutators({
		vacuumSurface: ({ mutableRoom }, surfaceType: SurfaceType) => {
			mutableRoom.cleanedSurfaces.push(`vacuumed ${surfaceType}`);
			return mutableRoom;
		},
		mopSurface: ({ mutableRoom }, surfaceType: SurfaceType) => {
			mutableRoom.cleanedSurfaces.push(`mopped ${surfaceType}`);
			return mutableRoom;
		},
		cleanWindow: ({ mutableRoom }) => {
			mutableRoom.cleanedSurfaces.push("cleaned window");
			return mutableRoom;
		},
		wipeCounter: ({ mutableRoom }) => {
			mutableRoom.cleanedSurfaces.push("wiped counter");
			return mutableRoom;
		},
	});

const OdorEvolver = Evolver.create("OdorEvolver", { noun: "odor" })
	.toEvolve<RoomState>()
	.withMutators({
		deodorizerSpray: async ({ mutableRoom }) => {
			await new Promise(resolve => setTimeout(resolve, 1000));
			mutableRoom.cleanedSurfaces.push("deodorized");
			return mutableRoom;
		},
	});

// Room Evolvers
const KitchenEvolver = Evolver.create("KitchenEvolver", { noun: "room" })
	.toEvolve<RoomState>()
	.withMutators({
		clean: async ({ mutableRoom }) => {
			SurfaceEvolver.evolve(mutableRoom)
				.via.vacuumSurface("tile")
				.and.vacuumSurface("carpet")
				.and.vacuumSurface("shelf")
				.and.mopSurface("tile")
				.and.wipeCounter()
				.and.finally.cleanWindow();

			return mutableRoom;
		},
	});

const LivingRoomEvolver = Evolver.create("LivingRoomEvolver", { noun: "room" })
	.toEvolve<RoomState>()
	.withMutators({
		clean: async ({ mutableRoom }) => {
			SurfaceEvolver.evolve(mutableRoom)
				.via.vacuumSurface("carpet")
				.and.vacuumSurface("shelf")
				.and.cleanWindow();

			return mutableRoom;
		},
	});

const BedroomEvolver = Evolver.create("BedroomEvolver", { noun: "room" })
	.toEvolve<RoomState>()
	.withMutators({
		clean: async ({ mutableRoom }) => {
			SurfaceEvolver.evolve(mutableRoom)
				.via.vacuumSurface("carpet")
				.and.cleanWindow();

			return mutableRoom;
		},
	});

const BathroomEvolver = Evolver.create("BathroomEvolver", { noun: "room" })
	.toEvolve<RoomState>()
	.withMutators({
		clean: async ({ mutableRoom }) => {
			SurfaceEvolver.evolve(mutableRoom)
				.via.vacuumSurface("tile")
				.and.mopSurface("tile")
				.and.cleanWindow()
				.and.wipeCounter();

			await OdorEvolver.mutate(mutableRoom).via.deodorizerSpray().resultAsync;

			return mutableRoom;
		},
	});
```

### Execute 

```typescript
// House Evolver
const HouseEvolver = Evolver.create("HouseEvolver", { noun: "house" })
	.toEvolve<HouseState>()
	.withMutators({
		cleanRooms: async ({ mutableHouse }) => {

			const { 
				kitchen,
				livingRoom,
				bedroom,
				bathroom,
			} = mutableHouse.rooms;
			
			mutableHouse.rooms.kitchen = KitchenEvolver.mutate(kitchen).via.clean();
			mutableHouse.rooms.livingRoom = LivingRoomEvolver.mutate(livingRoom).via.clean();
			mutableHouse.rooms.bedroom = BedroomEvolver.mutate(bedroom).via.clean();
			mutableHouse.rooms.bathroom = await BathroomEvolver.mutate(bathroom).via.clean();
			
			return mutableHouse;
		},
	});

const cleanHouse = await HouseEvolver(initialHouseState).mutate().via.cleanRooms();
```
