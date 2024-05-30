import type { Refinery } from "@Refineries/Refinery";
import type { ForgeDefs } from "@Refineries/Types/RefineryTypes";

/**
 * Maps each provided refinery to its output as determined by the getForges method. The getForges method
 * represents the core functionality of each refinery.
 */
export type RefineriesRemapped<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
    TRefineries extends Refinery<TData, string, TParamNoun, TForges>[],
> = {
    [K in TRefineries[number]["refineryName"]]: ReturnType<ExtractRefineryByName<TRefineries[number], K>["refine"]>;
};

/** Represents an individual refinery within the provided collection. */
export type OneRefinery<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
    TRefinery extends Refinery<TData, string, TParamNoun, TForges>,
> = TRefinery;

type ExtractRefineryByName<TRefineries, Name> = TRefineries extends { refineryName: Name } ? TRefineries : never;
