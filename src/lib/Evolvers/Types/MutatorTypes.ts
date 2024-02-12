import type { Mutable } from "@Shared/String/makeMutable";
import type { FuncMinusFirstArg } from "../../Types/Modifiers";
import type { SortaPromise } from "./EvolverTypes";

/**
 * Defines the structure and expected behavior of a mutator function. Mutators are functions that receive
 * an object containing the current state data keyed by `TParamName` and potentially additional arguments.
 * They must return either the mutated state data directly or a promise that resolves to it, encapsulated
 * by `SortaPromise`.
 */
export type Mutator<
    TEvolverData,
    TParamName extends Mutable<string>,
    TReturnData extends SortaPromise<TEvolverData>,
> = (input: { [key in TParamName]: TEvolverData }, ...args: any[]) => TReturnData;

/**
 * Represents a collection of definitions for mutators applicable to a piece of evolver data.
 */
export type MutatorDefs<TEvolverData, TParamName extends Mutable<string>> = {
    [key: string]: MutatorDefChild<TEvolverData, TParamName>;
};

/**
 * A union type that can represent either a single mutator function or a nested collection of mutator definitions.
 * This allows for the recursive definition of mutators, supporting complex, nested mutations.
 */
export type MutatorDefChild<TEvolverData, TParamName extends Mutable<string>> =
    | Mutator<TEvolverData, TParamName, SortaPromise<TEvolverData>>
    | MutatorDefs<TEvolverData, TParamName>;

/**
 * Constructs a dictionary type from a set of mutator definitions, converting each mutator function into
 * a form that is compatible with the chaining and application mechanisms of the Theseus project.
 */
export type MutatorDict<
    TEvolverData,
    TParamName extends Mutable<string>,
    TDict extends MutatorDefs<TEvolverData, TParamName>,
> = {
    [K in keyof TDict]: TDict[K] extends (...args: any) => any ?
        FuncMinusFirstArg<TDict[K], SortaPromise<TEvolverData>>
    : TDict[K] extends MutatorDefs<TEvolverData, TParamName> ?
        MutatorDict<TEvolverData, TParamName, TDict[K]>
    :   never;
};
