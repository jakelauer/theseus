import type { EvolverComplex } from "@Evolvers/EvolverComplex";
import { EvolverInstance } from "@Evolvers/Types/EvolverTypes";

import type { Mutable } from "@Shared/String/makeMutable";

export type BuildFromEvolvers<
    TData extends object,
    TEvolverName extends string,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, TEvolverName, Mutable<TParamName>, any>>,
> = {
    evolvers: TEvolvers;
    initialState: TData;
};

export type BuildFromComplex<TData, TComplex extends EvolverComplex> = {
    complex: TComplex;
    initialState: TData;
};
