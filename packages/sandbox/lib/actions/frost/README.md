# Frost

Frost is a utility for creating immutable object proxies in the Sandbox library. It provides a way to create deeply frozen objects that prevent direct modifications while still allowing controlled changes through the Sandbox mechanism.

## Features

- Creates immutable object proxies
- Supports deep freezing of nested objects
- Integrates seamlessly with Sandbox for temporary modifications
- Provides utilities for defrosting and working with frosted objects


## How does it work?

Frost provides a unique approach to immutability that goes beyond traditional methods like `Object.freeze` or libraries like Immer. The key feature of frost is its ability to create immutable objects that can be selectively unfrozen and modified in a controlled manner. This allows you to pass objects around your application with confidence that they won't be unexpectedly modified, while still retaining the ability to make changes when necessary.

Here's how frost achieves this:


# Usage

### Basic Usage

```typescript
import { frost } from './frost';

const originalObject = { a: 1, b: { c: 2 } };
const frostedObject = frost(originalObject);

// Attempting to modify the frosted object directly will throw an error
frostedObject.a = 2; // Throws: Cannot modify property "a" of the original object.
```

### Integration with Sandbox

```typescript
import { frost } from './frost';
import { sandbox } from '../sandbox';
import { cement } from '../cement';

const originalObject = { a: 1, b: { c: 2 } };
const frostedObject = frost(originalObject);

// Create a sandbox to modify the frosted object
const sandboxedObject = sandbox(frostedObject);

// Modify the object within the sandbox
sandboxedObject.a = 3;
sandboxedObject.b.c = 4;

// Cement the changes
const result = cement(sandboxedObject);

console.log(result); // { a: 3, b: { c: 4 } }
```

### Defrosting

```typescript
import { frost, defrost } from './frost';

const originalObject = { a: 1, b: { c: 2 } };
const frostedObject = frost(originalObject);

// Defrost the object to remove the immutability
const defrostedObject = defrost(frostedObject);

// Now you can modify the object directly
defrostedObject.a = 3;
```

## API

| Function | Description |
|-|-|
| `frost<T>(obj: T): Readonly<T>` | Creates a deep frost proxy of the given object. |
| `frostClone<T>(obj: T): Readonly<T>` | Creates a clone of the original object and then frosts it. |
| `defrost<T>(obj: T, opts?: StrictnessOptions): T` | Removes the frost proxy and returns the original object structure. |
| `isFrost(obj: any, mode?: "some" \| "every"): boolean` | Checks if an object is a frost proxy or contains frost proxies. |

