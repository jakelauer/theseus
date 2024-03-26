# Refineries and RefineryComplexes

## Overview

The Theseus library introduces Refineries and RefineryComplexes as foundational tools for state management.
Refineries facilitate data transformations through both singular mutations and sequential, chained
transformations. RefineryComplexes enable grouping of these Refineries for more complex and organized state
evolution scenarios.

## Refineries

Refineries are designed to encapsulate specific transformations on data, offering a modular approach to state
management.

### Example: Dungeons & Dragons Character Status Refinery

This refinery processes aspects of a character's status, such as health and effects, to generate a descriptive
status report.

```typescript
import { getTheseusLogger, Refinery } from "theseus-js";
import { CharacterState } from "./state/CharacterState";
import type { StatusReport } from "./types/StatusReport";

const log = getTheseusLogger("CharacterStatusRefinery");

export const { CharacterStatusRefinery } = Refinery.create("CharacterStatusRefinery", {
    noun: "CharacterState",
})
    .toRefine<CharacterState>()
    .withForges({
        calculateHealth: ({ immutableCharacterState }) => {
            const healthModifiers = immutableCharacterState.modifiers.filter((m) => m.type === "HEALTH");
            const totalMultiplier = healthModifiers.reduce((acc, { multiplier }) => (acc *= multiplier), 1);
            return immutableCharacterState.health * totalMultiplier;
        },
        listActiveEffects: ({ immutableCharacterState }) => {
            return immutableCharacterState.activeEffects.join(", ");
        },
        // Make the return type explicit to avoid TypeScript inference circular references
        generateStatusReport: ({ immutableCharacterState }): StatusReport => {
            const health = CharacterStatusRefinery.refine(immutableCharacterState).using.calculateHealth();
            const effects = immutableCharacterState.activeEffects.join(", ");
            return {
                health,
                effects,
            };
        },
    });
```

## RefineryComplexes

RefineryComplexes organize multiple related Refineries, facilitating complex state evolution in a structured
manner.

### Example: Dungeons & Dragons Game Session RefineryComplex

This complex groups refineries that manage different aspects of a game session, such as character status and
inventory management.

```typescript
import { RefineryComplex } from "theseus-js";
import { GameState } from "../../state/GameState";

export const GameSessionRefineryComplex = RefineryComplex.create<GameState>().withRefineries({
    CharacterStatusRefinery,
    InventoryRefinery,
});
```

### Using the Refineries and RefineryComplexes

After defining the refineries, here’s how you might use them to refine character and game states in a Dungeons
& Dragons context.

```typescript
// Using CharacterStatusRefinery to refine character state
let characterState: CharacterState = {
    health: 100,
    activeEffects: ["Poisoned", "Blessed"],
    // Other character state attributes...
};

const statusReport = CharacterStatusRefinery.refine(characterState).using.generateStatusReport();

const {
	CharacterStatus,
	Inventory
} = GameSessionRefineryComplex.refine(gameState).

const statusReport = CharacterStatus.generateStatusReport();
const inventory = Inventory.get();

```
