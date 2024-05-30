import type { EvolveObject, EvolverInstance, MutateObject } from "@Evolvers/Types/EvolverTypes";

// Determines the mutators for a given evolver by returning the types of mutators available for the evolver's data.
type MutatorsForEvolver<
    TData extends object,
    TParamName extends string,
    TEvolver extends EvolverInstance<TData, string, TParamName, any>,
> = ReturnType<
    MutateObject<
        TEvolver["__type__access__"]["data"],
        TEvolver["__type__access__"]["evolverName"],
        TEvolver["__type__access__"]["paramName"],
        TEvolver["__type__access__"]["mutators"]
    >["getMutators"]
>;

// Similar to MutatorsForEvolver but for macro mutators, determining the mutators for
// evolving the state on a larger scale.
type MacroMutatorsForEvolver<
    TData extends object,
    TParamName extends string,
    TEvolver extends EvolverInstance<TData, string, TParamName, any>,
> = ReturnType<
    EvolveObject<
        TEvolver["__type__access__"]["data"],
        TEvolver["__type__access__"]["evolverName"],
        TEvolver["__type__access__"]["paramName"],
        TEvolver["__type__access__"]["mutators"]
    >["getMutators"]
>;

// Maps each evolver name to its corresponding set of mutators, facilitating direct access to the mutators by name.
type MutatorsRemapped<
    TData extends object,
    TParamName extends string,
    TEvolvers extends EvolverInstance<TData, string,  TParamName, any>[],
> = {
    [K in TEvolvers[number]["evolverName"]]: MutatorsForEvolver<
		TData, 
		TParamName, 
        ExtractEvolverByName<TEvolvers[number], K>
	>;
};

// Similar to MutatorsRemapped but for macro mutators, mapping each evolver name to its set of macro mutators.
type MacroMutatorsRemapped<
    TData extends object,
    TParamName extends string,
    TEvolvers extends EvolverInstance<TData, string,  TParamName, any>[],
> = {
    [K in TEvolvers[number]["evolverName"]]: MacroMutatorsForEvolver<
        TData,
        TParamName,
        ExtractEvolverByName<TEvolvers[number], K>
    >;
};

type ExtractEvolverByName<TEvolvers, Name> = TEvolvers extends { evolverName: Name } ? TEvolvers : never;


/** Type utility for removing 'Evolver' prefix from type names. */
// type RemoveEvolverFromName<T> = {
//     [K in keyof T as NormalizedEvolverName<Extract<K, EvolverName>>]: T[K];
// };

// Applies a transformation to the names of the mutators, removing the 
// 'Evolver' prefix to match the naming conventions of the complex.
export type MacroMutatorsFormatted<
    TData extends object,
    TParamName extends string,
    TEvolvers extends EvolverInstance<TData, string,  TParamName, any>[],
> = MacroMutatorsRemapped<TData, TParamName, TEvolvers>;
export type MutatorsFormatted<
    TData extends object,
    TParamName extends string,
    TEvolvers extends EvolverInstance<TData, string,  TParamName, any>[],
> = MutatorsRemapped<TData, TParamName, TEvolvers>;
