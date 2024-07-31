# theseus-sandbox

<sup>Part of [`theseus-js`](https://github.com/jakelauer/theseus-js).</sup>

![build](https://github.com/jakelauer/theseus-js/actions/workflows/build.yml/badge.svg?branch=main)
![test](https://github.com/jakelauer/theseus-js/actions/workflows/test.yml/badge.svg?branch=main)

<a href="https://www.npmjs.com/package/theseus-sandbox"><img src="https://badgen.net/npm/v/theseus-sandbox?color=red" alt="npm version" height="18"></a>
<img src="https://badgen.net/github/license/jakelauer/theseus" alt="npm version" height="18">

`theseus-sandbox` provides a unique approach to immutability that allows objects to be made immutable while still
permitting controlled modifications. Unlike other immutability libraries like [Immer](https://immerjs.github.io/immer/),
which freeze objects irreversibly, or [Immutable.js](https://immutable-js.com/), which replaces native functionality
with immutable replacements, Theseus Sandbox uses a combination of `frost`, `sandbox`, and `cement` to achieve
immutability with flexibility.

# Key Concepts

## Frost

`frost` is a utility that creates deeply immutable object proxies. When an object is frosted, it is wrapped in a proxy
that prevents any direct modifications. This ensures that the object remains unchanged and safe from unintended
mutations.

## Sandbox

`sandbox` allows for temporary modifications to objects, including frosted objects. When an object is sandboxed, another
proxy is created that tracks changes without modifying the original object. This proxy can be used to make changes in a
controlled environment.

#### Copy vs Modify mode

When `{mode: "copy"}` is used, the sandbox creates a deep clone of the original object. Any modifications made within
the sandbox are applied to this clone, leaving the original object untouched. When the changes are cemented, a new
object is returned with the modifications, and the original object remains unchanged.

By contrast, `{mode: "modify"}` for the sandbox allows changes to be made directly to the original object when cemented.
This mode is useful when you want to update the original object in place.

## Cement

`cement` is used to finalize the changes made in a sandbox. It applies the tracked changes to the original object, even
if the object is frosted. This means that frosted objects can only be edited via a cemented sandbox, ensuring that all
modifications are intentional and controlled.

# Workflow

1. **Frosting an Object**: Use `frost` to create an immutable proxy of an object.

    ```typescript
    import { frost } from "theseus-sandbox";

    const original = frost({
        eggs: 3,
        bakery: {
            muffins: 2,
        },
    });

    // Attempting to modify the frosted object directly will throw an error
    try {
        original.eggs = 4;
    } catch (e) {
        console.error(e.message); // Throws: Cannot modify property "eggs" of the original object.
    }
    ```

2. **Sandboxing an Object**: Use `sandbox` to create a proxy that allows temporary modifications.

    ```typescript
    // ...continued from above

    import { sandbox } from "theseus-sandbox";
    const sandboxObj = sandbox(original);

    // Modify the object within the sandbox
    sandboxObj.eggs = 12;
    sandboxObj.bakery.cookies = 6;

    console.log(original, sandboxObj);
    // Result:
    // |- { eggs: 3, bakery: { muffins: 2 } }
    // |- { eggs: 12, bakery: { cookies: 6, muffins: 2 } }
    ```

3. **Cementing Changes**: Use `cement` to apply the changes made in the sandbox to the original object.

    ```typescript
    // ...continued from above

    import { cement } from "theseus-sandbox";

    console.log(original, sandboxObj);
    // Result:
    // |- { eggs: 3, bakery: { muffins: 2 } }
    // |- { eggs: 12, bakery: { cookies: 6, muffins: 2 } }

    cement(sandboxObj);

    console.log(original, sandboxObj);
    // Result:
    // |- { eggs: 12, bakery: { cookies: 6, muffins: 2 } }
    // |- { eggs: 12, bakery: { cookies: 6, muffins: 2 } }
    ```

## Example

Here is a complete example demonstrating the workflow:

```typescript
import { frost, sandbox, cement } from "theseus-sandbox";

const original = frost({
    eggs: 3,
    bakery: {
        muffins: 2,
    },
});

const sandboxObj = sandbox(original);

sandboxObj.eggs = 12;
sandboxObj.bakery.cookies = 6;

cement(sandboxObj);

console.log(original, sandboxObj);
// Result:
// |- { eggs: 12, bakery: { cookies: 6, muffins: 2 } }
// |- { eggs: 12, bakery: { cookies: 6, muffins: 2 } }
```

## Copy vs Modify

#### Copy

```typescript
import { sandbox, cement } from "theseus-sandbox";
import { deepEqual } from "deep-equal";

// Original object
const originalObject = {
    name: "John",
    age: 30,
    address: {
        street: "123 Main St",
        city: "Anytown",
    },
};

// Create a sandbox in "copy" mode
const sandboxedObject = sandbox(originalObject, { mode: "copy" });

// Modify the sandboxed object
sandboxedObject.age = 31;
sandboxedObject.address.street = "456 Elm St";

// Cement the changes
const cementedObject = cement(sandboxedObject);

// Log the final results
console.log(deepEqual(originalObject, cementedObject)); // false
```

#### Modify

```typescript
import { sandbox, cement } from "theseus-sandbox";
import { deepEqual } from "deep-equal";

// Original object
const originalObject = {
    name: "John",
    age: 30,
    address: {
        street: "123 Main St",
        city: "Anytown",
    },
};

// Create a sandbox in "copy" mode
const sandboxedObject = sandbox(originalObject, { mode: "modify" });

// Modify the sandboxed object
sandboxedObject.age = 31;
sandboxedObject.address.street = "456 Elm St";

// Cement the changes
const cementedObject = cement(sandboxedObject);

// Log the final results
console.log(deepEqual(originalObject, cementedObject)); // true
```
