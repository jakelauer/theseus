import { Mutable } from "@Shared/String/makeMutable";

import type { ChainableMutators } from "./ChainableTypes";
import type { MutatorDefs } from "./MutatorTypes";

export interface TypeAccess<
    TData,
    TMutators extends MutatorDefs<TData, TParamName>,
    TEvolverName extends string,
    TParamName extends Mutable<string>,
> {
    data: TData;
    mutators: TMutators;
    evolverName: TEvolverName;
    paramName: TParamName;
    mutableParamName: TParamName;
    returnData: SortaPromise<TData>;
    evolver: EvolverInstance<TData, TMutators, TEvolverName, TParamName>;
}

/**
 * Represents an instance of an evolver, providing methods to mutate or evolve the state. It defines
 * interfaces for `mutate` and `evolve` operations, each returning a set of chainable mutators and a
 * method to retrieve these mutators directly.
 *
 * @template TEvolverData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver
 *   data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver
 *   data.
 */
export type EvolverInstance<
    TEvolverData,
    TMutators extends MutatorDefs<TEvolverData, TParamName>,
    TEvolverName extends string,
    TParamName extends Mutable<string>,
> = {
    __type__access__: TypeAccess<TEvolverData, TMutators, TEvolverName, TParamName>;

    /**
     * Initiates a mutation operation on the evolver's data. Unlike `evolve`, `mutate` is tailored
     * for situations where the mutations lead directly to the final state of the data without
     * further chaining.
     *
     * This method facilitates operations where only a single mutation is required and does not need
     * dynamic chaining, allowing for a concise expression of state transformations.
     *
     * @param input The initial state data to be mutated.
     * @returns An object providing a direct way to apply the mutations (`using`) and a method
     *   (`getMutators`) to retrieve these mutators. The mutations applied through these mutators
     *   conclude the mutation process, returning the final state.
     */
    mutate: (input: TEvolverData) => {
        using: ChainableMutators<TEvolverData, TParamName, TMutators, "final">;
        getMutators: () => ChainableMutators<TEvolverData, TParamName, TMutators, "final">;
    };
    /**
     * Initiates an evolution operation on the evolver's data, providing access to a set of
     * chainable mutators. This method is suitable for applying a series of mutations that may
     * include asynchronous operations.
     *
     * @param input The initial state data to evolve.
     * @returns An object containing a set of chainable mutators (`using`) and a method
     *   (`getMutators`) to directly retrieve these mutators.
     */
    evolve: (input: TEvolverData) => {
        using: ChainableMutators<TEvolverData, TParamName, TMutators>;
        getMutators: () => ChainableMutators<TEvolverData, TParamName, TMutators>;
    };
    getMutatorDefinitions: () => TMutators;
};

/**
 * Type representing the result of a mutate operation on an evolver, providing a fluent API for
 * applying mutations to the state.
 *
 * @template TData The type of data being mutated.
 * @template TMutators The mutator definitions applicable to the data.
 * @template TParamNoun The name of the mutable parameter within the data.
 */
export type MutateObject<
    TData,
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TEvolverName extends string,
    TParamNoun extends Mutable,
> = ReturnType<EvolverInstance<TData, TMutators, TEvolverName, TParamNoun>["mutate"]>;

/**
 * Similar to `MutateObject`, but for the evolve operation, providing a way to apply a series of
 * mutations that may include asynchronous operations.
 */
export type EvolveObject<
    TData,
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TEvolverName extends string,
    TParamNoun extends Mutable,
> = ReturnType<EvolverInstance<TData, TMutators, TEvolverName, TParamNoun>["evolve"]>;

/** Options for configuring an evolver, allowing customization of the mutable parameter's name. */
export interface EvolverOptions<TParamNoun extends string = "input"> {
    noun?: TParamNoun;
}

/**
 * A utility type for representing values that might either be a direct value or a promise resolving
 * to that value. Facilitates handling operations that can be either synchronous or asynchronous.
 *
 * @template T The type of the value or the resolved value of the promise.
 */
export type SortaPromise<T> = T | Promise<T>;
