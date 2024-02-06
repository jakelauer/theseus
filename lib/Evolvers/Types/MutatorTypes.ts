import type { FuncMinusFirstArg } from "../../Types/Modifiers";
import type { SortaPromise } from "./EvolverTypes";

/**
 * The required shape of a Mutator. Mutators must be a function which is passed an object with one key,
 * which is `TParamName`, and a value of type `TEvolverData`. They may additionally specify any further arguments
 * as required by the functionality. They must return `TEvolverData`.
 */
export type Mutator<
    TEvolverData,
    TParamName extends Mutable<string>,
    TReturnData extends SortaPromise<TEvolverData>,
> = (input: { [key in TParamName]: TEvolverData }, ...args: any[]) => TReturnData;

export type MutatorDefs<TEvolverData, TParamName extends Mutable<string>> = {
    [key: string]: MutatorDefChild<TEvolverData, TParamName>;
};

export type MutatorDefChild<TEvolverData, TParamName extends Mutable<string>> =
    | Mutator<TEvolverData, TParamName, SortaPromise<TEvolverData>>
    | MutatorDefs<TEvolverData, TParamName>;

export type Mutable<TParamName extends string = string> = `mutable${Capitalize<TParamName>}`;

export type MutatorDict<
    TEvolverData,
    TParamName extends Mutable<string>,
    TDict extends MutatorDefs<TEvolverData, TParamName>,
> = {
    [K in keyof TDict]: TDict[K] extends (...args: any) => any ? FuncMinusFirstArg<TDict[K], SortaPromise<TEvolverData>>
    : TDict[K] extends MutatorDefs<TEvolverData, TParamName> ? MutatorDict<TEvolverData, TParamName, TDict[K]>
    : never;
};
