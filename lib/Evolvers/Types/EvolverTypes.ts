import type { ChainableMutators } from "./ChainableTypes";
import { Mutable, MutatorDefs } from "./MutatorTypes";

export type EvolverInstance<
    TEvolverData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefs<TEvolverData, TParamName>,
> = {
    mutate: (input: TEvolverData) => {
        using: ChainableMutators<TEvolverData, TParamName, TMutators, "final">;
        getMutators: () => ChainableMutators<TEvolverData, TParamName, TMutators, "final">;
    };
    evolve: (input: TEvolverData) => {
        using: ChainableMutators<TEvolverData, TParamName, TMutators>;
        getMutators: () => ChainableMutators<TEvolverData, TParamName, TMutators>;
    };
    getMutatorDefinitions: () => TMutators;
};

export type MutateObject<
    TData,
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TParamNoun extends Mutable,
> = ReturnType<EvolverInstance<TData, TParamNoun, TMutators>["mutate"]>;

export type EvolveObject<
    TData,
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TParamNoun extends Mutable,
> = ReturnType<EvolverInstance<TData, TParamNoun, TMutators>["evolve"]>;

export interface EvolverOptions<TParamNoun extends string = "input"> {
    noun?: TParamNoun;
}

export type SortaPromise<T> = T | Promise<T>;
