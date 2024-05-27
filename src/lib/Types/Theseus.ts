import type { BroadcasterParams, DestroyCallback } from "@Broadcast/Broadcaster";
import type { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";
import type { EvolverComplex, EvolverComplexInstance } from "@Evolvers/EvolverComplex";
import type { EvolverInstance } from "@Evolvers/Types/EvolverTypes";
import type { MutatorDefs } from "@Evolvers/Types/MutatorTypes";
import type { RefineryInitializer } from "@Refineries/Refinery";
import type { RefineryComplexInstance } from "@Refineries/RefineryComplex";
import type { ForgeDefs } from "@Refineries/Types";
import type { Immutable } from "@Shared/String/makeImmutable";

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

export interface ITheseus<TData> {
    __uuid: string;
    state: TData;
    observe: (callback: (newData: TData) => void, updateImmediately?: boolean) => DestroyCallback;
}

export type BaseParams<
    TData extends object,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> = {
    broadcasterParams?: BroadcasterParams<TData, TObserverType>;
};

export type TheseusParams<
    TData extends object,
    TParamName extends string,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolvers extends EvolverInstance<TData, string,  Mutable<TParamName>, TMutators>[],
    TForges extends ForgeDefs<TData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> = BaseParams<TData, TObserverType> & {
    evolvers: TEvolvers | EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>;
    refineries?: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>;
};
