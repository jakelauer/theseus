<div style="text-align: center;">
<img src="./.assets/logo.png" alt="Theseus Logo">
</div>

# Theseus

Welcome to Theseus, a robust solution for managing application state with clarity and efficiency. Designed
with modern JavaScript applications in mind, Theseus stands out for its fluent state manipulation, ease of
compliance, and intelligent typing capabilities.

## Key Concepts

Theseus is built around several core concepts that differentiate it from other state management libraries:

-   **Evolvers:** Inspired by the idea of evolving application state, Evolvers in Theseus provide a structured
    way to define how state changes in response to actions. They encourage a deterministic and predictable
    state transition model, making state management more intuitive and less error-prone.

-   **Refineries:** Complementing Evolvers, Refineries allow for the transformation and validation of state
    transitions. They ensure that state changes are not only predictable but also conform to defined
    constraints and validations, enhancing the robustness of your application.

-   **Fluent State Management:** Theseus introduces a fluent interface for state management, making the code
    more readable and expressive. This approach allows developers to chain state operations in a clear and
    logical sequence.

## Why Theseus?

Compared to other state management libraries, Theseus offers:

-   **Automatic Type Inference:** Theseus smartly infers types, reducing the boilerplate code typically
    associated with maintaining types for application state, actions, and reducers.

-   **Modular Architecture:** The library's design encourages a modular approach to state management, making
    it easier to scale and maintain large applications.

-   **Enhanced Debugging:** With built-in support for logging and state transition tracing, Theseus simplifies
    the debugging process, helping developers identify and fix issues faster.

## Getting Started

### Installation

```shell
npm install theseus-js
```

```shell
yarn add theseus-js
```

```shell
pnpm install theseus-js
```

### Usage

#### See the [tutorial](./.tutorial/README.md) for a walkthrough!

## Documentation

For more detailed information on specific Theseus concepts, refer to the following documentation sections:

-   [Evolvers Documentation](src/lib/Evolvers)
-   [Refineries Documentation](src/lib/Refineries)

## Examples

Check out our TicTacToe example:

[Link to TicTacToe Example](.examples/TicTacToe/)

This example demonstrates the practical implementation of Theseus concepts in a familiar game format, making
it easier to grasp the library's capabilities.

## Building and Contributing

Theseus is an open-source project, and we welcome contributions from the community. Whether it's adding new
features, fixing bugs, or improving documentation, your contributions are invaluable to making Theseus better
for everyone.

### Setting Up for Development

1. Clone the repository.
2. Run `pnpm install && pnpm prepare` to install dependencies and prepare development.
3. Use `pnpm test` to test the library.
4. Use `pnpm build` to compile the library.

## License

Theseus is MIT licensed. For more details, see the [LICENSE](LICENSE) file.
