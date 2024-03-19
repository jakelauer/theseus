import type { EvolveObject, EvolverInstance, MutateObject } from "@Evolvers/Types/EvolverTypes";
import type { NormalizedEvolverName } from "@Evolvers/Util/normalizeEvolverName";
import type { Mutable } from "@Shared/String/makeMutable";

/** Utility type for extracting string keys from a type. */
type StringKeyOf<T> = {
    [K in keyof T]: K extends string ? K : never;
}[keyof T];

// Determines the mutators for a given evolver by returning the types of mutators available for the evolver's data.
type MutatorsForEvolver<
    TEvolverName extends StringKeyOf<TEvolvers>,
    TData extends object,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
> = ReturnType<
    MutateObject<
        TEvolvers[TEvolverName]["__type__access__"]["data"],
        TEvolvers[TEvolverName]["__type__access__"]["evolverName"],
        TEvolvers[TEvolverName]["__type__access__"]["mutableParamName"],
        TEvolvers[TEvolverName]["__type__access__"]["mutators"]
    >["getMutators"]
>;

// Similar to MutatorsForEvolver but for macro mutators, determining the mutators for evolving the state on a larger scale.
type MacroMutatorsForEvolver<
    TEvolverName extends StringKeyOf<TEvolvers>,
    TData extends object,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
> = ReturnType<
    EvolveObject<
        TEvolvers[TEvolverName]["__type__access__"]["data"],
        TEvolvers[TEvolverName]["__type__access__"]["evolverName"],
        TEvolvers[TEvolverName]["__type__access__"]["mutableParamName"],
        TEvolvers[TEvolverName]["__type__access__"]["mutators"]
    >["getMutators"]
>;

// Maps each evolver name to its corresponding set of mutators, facilitating direct access to the mutators by name.
type MutatorsRemapped<
    TData extends object,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
> = {
    [KEvolverName in StringKeyOf<TEvolvers>]: MutatorsForEvolver<KEvolverName, TData, TParamName, TEvolvers>;
};

// Similar to MutatorsRemapped but for macro mutators, mapping each evolver name to its set of macro mutators.
type MacroMutatorsRemapped<
    TData extends object,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
> = {
    [KEvolverName in StringKeyOf<TEvolvers>]: MacroMutatorsForEvolver<
        KEvolverName,
        TData,
        TParamName,
        TEvolvers
    >;
};

/** Type utility for removing 'Evolver' prefix from type names. */
type RemoveEvolverFromName<T> = {
    [K in keyof T as NormalizedEvolverName<Extract<K, string>>]: T[K];
};

// Applies a transformation to the names of the mutators, removing the 'Evolver' prefix to match the naming conventions of the complex.
export type MacroMutatorsFormatted<
    TData extends object,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
> = RemoveEvolverFromName<MacroMutatorsRemapped<TData, TParamName, TEvolvers>>;
export type MutatorsFormatted<
    TData extends object,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
> = RemoveEvolverFromName<MutatorsRemapped<TData, TParamName, TEvolvers>>;
