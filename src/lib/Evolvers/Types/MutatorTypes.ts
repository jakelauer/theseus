import type { FuncMinusFirstArg } from "@Types/Modifiers";
import type { SortaPromise } from "./EvolverTypes";

/**
 * Defines the structure and expected behavior of a mutator function. Mutators are functions that receive an
 * object containing the current state data keyed by `TParamName` and potentially additional arguments. They
 * must return either the mutated state data directly or a promise that resolves to it, encapsulated by
 * `SortaPromise`.
 */
export type Mutator<
    TData extends object,
    TParamName extends string,
    TReturnData extends SortaPromise<TData>,
> = (input: ParamNameData<TData, TParamName>, ...args: any[]) => TReturnData;

/**
 * Matches the signature of a mutator function, without requiring specific arguments. This is useful for
 * dynamically adding mutators to an evolver instance, passing the arguments through at the time of invocation
 * as-is.
 */
export type GenericMutator<TData extends object, TReturnData extends SortaPromise<TData>> = (
    ...args: any[]
) => TReturnData;

export type ParamNameData<TData extends object, TParamName extends string> = {
    [key in TParamName]: TData;
};

/** Represents a collection of definitions for mutators applicable to a piece of evolver data. */
export type MutatorDefs<TData extends object, TParamName extends string> = {
    [key: string]: MutatorDefChild<TData, TParamName>;
};

/**
 * A union type that can represent either a single mutator function or a nested collection of mutator
 * definitions. This allows for the recursive definition of mutators, supporting complex, nested mutations.
 */
export type MutatorDefChild<TData extends object, TParamName extends string> =
    | Mutator<TData, TParamName, SortaPromise<TData>>
    | MutatorDefs<TData, TParamName>;

/**
 * Constructs a dictionary type from a set of mutator definitions, converting each mutator function into a
 * form that is compatible with the chaining and application mechanisms of the Theseus project.
 */
export type MutatorDict<
    TData extends object,
    TParamName extends string,
    TDict extends MutatorDefs<TData, TParamName>,
> = {
    [K in keyof TDict]: TDict[K] extends (...args: any) => any ?
        FuncMinusFirstArg<TDict[K], SortaPromise<TData>>
    : TDict[K] extends MutatorDefs<TData, TParamName> ? MutatorDict<TData, TParamName, TDict[K]>
    : never;
};
