<div style="text-align: center;">
	<img src=".assets/logo.png" alt="drawing" style="margin:auto"/>
</div>

# Theseus

Theseus offers fluent state manipulation and management for JavaScript applications, streamlining state changes with
clarity and enforceable rules.

## Goals

-   **Clarity in State Management**: Ensure that state changes are transparent and understandable.
-   **Ease of Compliance**: Encourage adherence to best practices with a design that makes it easier to follow rules
    than to break them.
-   **Smart, Automatic Typing**: Leverage intelligent data typing detection to reduce boilerplate and increase
    efficiency.

## Installation

```bash
npm install theseus
```

## Quick Start

A brief introduction on how to get started with Theseus. For example:

```javascript
import { Evolver, AsyncEvolver } from 'theseus-library';

// Example of using Evolver
const myEvolver = Evolver.as<MyDataType>()
    .withParamName('myData')
    .withMutators({...});

// Example of using AsyncEvolver
const myAsyncEvolver = AsyncEvolver.build<MyAsyncDataType>()
    .named('asyncData')
    .withActions({...});
```

## Core Concepts

### Evolvers

Evolvers in Theseus enable flexible state evolution in JavaScript applications, suitable for complex or asynchronous
state manipulation. They follow a one-to-many relationship, where one Evolver applies many Mutators. Evolvers always use
mutable data and return the same data type, ensuring consistency and predictability in state changes.

-   **`Evolver`**: An Evolver manages synchronous state evolution, integrating multiple Mutators for different aspects
    of state transformation. It uses mutable data as input and returns the same data type, maintaining state integrity.

    -   **AsyncEvolver**: Asynchronous version of `Evolver`, containing mutators which always return a promise of the
        Evolver's data type.

-   **`Mutator`**: Mutators are functions within an Evolver, each specifying a unique rule for how the state evolves.
    They define the logic for state changes, ensuring that each modification is controlled and deliberate.

### Refineries

Refineries in Theseus offer structured data transformation, following a one-to-many relationship where one Refinery
manages many Forges. Refineries always use immutable data as input, and output any other type.

-   **`RefineryComplex`**: A RefineryComplex manages multiple Refineries, each with their own Forges, enabling
    interconnected data transformation workflows.

-   **`Refinery`**: A Refinery orchestrates data transformation, using multiple Forges to handle complex data processing
    tasks.

-   **`Forge`**: Each Forge in a Refinery performs a specific data transformation with **immutable input**, returning
    data of **some other type**.

### Flags

Flags in Theseus provide an efficient way to manage binary state representations like bitwise flags or toggles, handling
flag enumerations, offering methods for manipulation, testing, and querying of flag values.

## Examples - To Do Application

### ToDoEvolver

Show a real-world example of using `Evolver` for state management.

```typescript
import { Evolver } from "@bad-cards/theseus";

// Evolver for managing a single ToDo
const ToDoEvolver = Evolver.as<ToDo>().withParamName("list").withMutators({
    setTitle: ({mutableList}, newTitle: string) => {
        mutableList.title = newTitle;
        return mutableList;
    },
    setPriority: ({mutableList}, newPriority: number) => {
        mutableList.priority = newPriority;
        return mutableList;
    },
    togglePinned: ({mutableList}) => {
        mutableList.pinned = !mutableList.pinned;
        return mutableList;
    },
    setDescription: ({mutableList}, newDescription: string) => {
        mutableList.description = newDescription;
        return mutableList;
    },
    addListItem: ({mutableList}, listItem: ListItem) => {
        mutableList.listItem = mutableList.listItem || [];
        mutableList.listItem.push(listItem);
        return mutableList;
    },
    removeListItem: ({mutableList}, listItemToRemove: ListItem) => {
        mutableList.listItem = mutableList.listItem.filter(listItem => listItem !== listItemToRemove);
        return mutableList;
    },
    moveItemToSection: ({mutableList}, itemIndex: number, sectionIndex: number) => {
        mutableList.itemToSectionIndexMap[itemIndex] = sectionIndex;
        return mutableList;
    }
});

// Evolver for managing a single Section
const SectionEvolver = Evolver.as<Section>().withParamName("section").withMutators({
    setTitle: ({mutableSection}, newTitle: string) => {
        mutableSection.title = newTitle;
        return mutableSection;
    },
    setType: ({mutableSection}, newType: SectionType) => {
        mutableSection.type = newType;
        return mutableSection;
    },
    updateOrder: ({mutableSection}, newOrder: number[]) => {
        // Assuming mutableSection has a property that keeps track of the order of ToDo items
        mutableSection.itemOrder = newOrder;
        return mutableSection;
    },
    // Additional mutators as needed...
});

// Usage example

const todoId = (new URLSearchParams(location.search)).get("list-id");
const todo: ToDo = async fetchToDoById(todoId); // Fetch a list from the server

const updatedToDo = ToDoEvolver.mutate(myToDo)
    .setTitle('New Title')
    .togglePinned()
    .getFinalForm();

```

### Asynchronous State Evolution

Illustrate the use of `AsyncEvolver` for managing asynchronous state changes.

```javascript
// Example code here
```

### Mutating State

Demonstrate how to define and use a `MutatorSet`.

```javascript
// Example code here
```

### Data Transformation with Refineries

Provide an example of creating and using a `Refinery`.

```javascript
// Example code here
```

## API Documentation

Link to detailed API documentation or include a section that covers the main API methods and their usage.

## Contributing

Instructions for contributing to the Theseus project, including coding standards, testing practices, and how to submit
pull requests.

## License

Specify the license under which Theseus is released.
