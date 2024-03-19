import type { RefineryInitializer } from "@Refineries/Refinery";
import type { ForgeDefs } from "@Refineries/Types/RefineryTypes";
import type { NormalizedRefineryName } from "@Refineries/Util/normalizeRefineryName";
import type { Immutable } from "@Shared/String/makeImmutable";

/**
 * Maps each provided refinery to its output as determined by the getForges method. The getForges method
 * represents the core functionality of each refinery.
 */
export type RefineriesRemapped<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamNoun, TForges>>,
> = {
    [K in keyof TRefineries]: ReturnType<TRefineries[K]>;
};

/** Represents an individual refinery within the provided collection. */
export type OneRefinery<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamNoun, TForges>>,
    TRefineryName extends keyof TRefineries,
> = ReturnType<TRefineries[TRefineryName]>;

export type RefineryComplexOutcome<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamNoun, TForges>>,
> = {
    [K in keyof RefineriesRemapped<TData, TParamNoun, TForges, TRefineries> as NormalizedRefineryName<
        Extract<K, string>
    >]: RefineriesRemapped<TData, TParamNoun, TForges, TRefineries>[K];
};
