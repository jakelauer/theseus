import type { EvolverComplex } from "@Evolvers/EvolverComplex";
import type { EvolverInstance } from "@Evolvers/Types";
import type { Mutable } from "@Shared/String/makeMutable";

export type BuildFromEvolvers<
    TEvolverName extends string,
    TParamName extends string,
    TData,
    TEvolvers extends Record<string, EvolverInstance<TEvolverName, Mutable<TParamName>, TData, any>>,
> = {
    evolvers: TEvolvers;
    initialState: TData;
};

export type BuildFromComplex<TData, TComplex extends EvolverComplex> = {
    complex: TComplex;
    initialState: TData;
};
