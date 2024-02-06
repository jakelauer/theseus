import { FuncMinusFirstArg } from "../../Types/Modifiers";
import { Mutable, MutatorDefChild } from "./MutatorTypes";

export interface FinishChain<TEvolverData, IsAsync extends AsyncTracker> {
    completeEvolver: () => IsAsync extends "async" ? Promise<TEvolverData> : TEvolverData;
}

export interface FinishAsyncChain<TEvolverData> {
    completeEvolverAsync: () => Promise<TEvolverData>;
}

type AsyncTracker = "sync" | "async";
type FinalTracker = "final" | "notFinal";

type MutatorCallable<TMutator extends (...args: any[]) => any, TReturn> = FuncMinusFirstArg<
    (...args: Parameters<TMutator>) => TReturn
>;

type SyncChainable<
    TData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefChild<TData, TParamName>,
    TMutator extends (...args: any[]) => any,
    IsFinal extends FinalTracker = "notFinal",
> = MutatorCallable<
    TMutator,
    IsFinal extends "final" ? TData
    :   Record<
            "and",
            ChainableMutators<TData, TParamName, TMutators, IsFinal> &
                Record<"lastly", ChainableMutators<TData, TParamName, TMutators, "final">>
        > &
            Record<"getFinalForm", () => TData>
>;

type IsChainAsync<TMutators, PrevAsync extends AsyncTracker = "sync"> = {
    [K in keyof TMutators]: TMutators[K] extends (...args: any[]) => Promise<any> ? "async" : PrevAsync;
}[keyof TMutators];

/**
 * Defines public-facing chainable output actions.
 */
export type ChainableMutators<
    TData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefChild<TData, TParamName>,
    IsFinal extends FinalTracker = "notFinal",
> = {
    [K in keyof TMutators]: TMutators[K] extends (...args: any[]) => Promise<any> ?
        FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => Promise<TData>>
    : TMutators[K] extends (...args: any[]) => any ?
        IsFinal extends "final" ?
            IsChainAsync<TMutators> extends "async" ?
                FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => Promise<TData>>
            :   FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => TData>
        :   SyncChainable<TData, TParamName, TMutators, TMutators[K], "notFinal">
    : TMutators[K] extends { [key: string]: any } ? ChainableMutators<TData, TParamName, TMutators[K], IsFinal>
    : never;
};
