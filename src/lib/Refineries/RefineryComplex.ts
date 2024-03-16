import getTheseusLogger from "@Shared/Log/get-theseus-logger";
import { Immutable } from "@Shared/String/makeImmutable";

import { RefineryInitializer } from "./Refinery";
import { ForgeDefs } from "./Types/RefineryTypes";
import { NormalizedRefineryName, normalizeRefineryName } from "./Util/normalizeRefineryName";

const log = getTheseusLogger("RefineryComplex");

/**
 * Begins the data refinement process in a fluid, sentence-like pattern. Allows the specification of
 * refineries to process the input data.
 */
const refine = <
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamNoun, TForges>>,
>(
    input: TData,
) => ({
    /**
     * Specifies the set of refineries to be used for processing the input data. Each property in the provided
     * object should be a Refinery whose data matches TData. Follows a fluent pattern, allowing for intuitive
     * and clear data processing steps.
     */
    withRefineries: (refineries: TRefineries) => {
        /** Represents the names of the refineries as provided in the withRefineries argument. */
        type TRefineryPassedNames = keyof TRefineries;

        /**
         * Maps each provided refinery to its output as determined by the getForges method. The getForges
         * method represents the core functionality of each refinery.
         */
        type RefineriesRemapped = {
            [K in TRefineryPassedNames]: ReturnType<TRefineries[K]>;
        };

        /** Represents an individual refinery within the provided collection. */
        type OneRefinery<TRefineryName extends TRefineryPassedNames> = ReturnType<TRefineries[TRefineryName]>;

        const keys = Object.keys(refineries) as TRefineryPassedNames[];

        const result = keys.reduce(
            (acc, key: string) => {
                console.log(key, refineries);
                const refinery = refineries[key];
                const forges = refinery(input) as OneRefinery<typeof key>;
                const formattedRefineryName = normalizeRefineryName(key) as NormalizedRefineryName<string>;

                (acc as Record<NormalizedRefineryName<string>, any>)[formattedRefineryName] = forges;

                return acc;
            },
            {} as {
                [K in keyof RefineriesRemapped as NormalizedRefineryName<
                    Extract<K, string>
                >]: RefineriesRemapped[K];
            },
        );

        return result;
    },
});

const create = <TData extends object>() => ({
    withRefineries: <
        TParamNoun extends string,
        TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
        TRefineries extends Record<string, RefineryInitializer<TData, TParamNoun, TForges>>,
    >(
        refineries: TRefineries,
    ) =>
        innerWithRefineries<TData, TParamNoun, TForges, TRefineries>(refineries) as RefineryComplexInstance<
            TData,
            TParamNoun,
            TForges,
            TRefineries
        >,
});

const innerWithRefineries = <
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamNoun, TForges>>,
>(
    refineries: TRefineries,
) => {
    const result = {
        refine: (input: TData) =>
            refine<TData, TParamNoun, TForges, TRefineries>(input).withRefineries(refineries),
    } as const;

    log.verbose("Creating refinery complex with refineries", {
        refineries: Object.keys(refineries),
    });

    return result;
};

/**
 * Manages a complex of refineries, providing a structured way to process data. This class facilitates a
 * fluent interface for refining data, akin to constructing a sentence:
 * `RefineryComplex.refine(myData).withRefineries({ ... })`.
 */
export class RefineryComplex {
    public static create = create;
}

export type RefineryComplexInstance<
    TData extends object,
    TParamName extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
> = ReturnType<typeof RefineryComplexInstanceTypeGen<TData, TParamName, TForges, TRefineries>>;

const RefineryComplexInstanceTypeGen = <
    TData extends object,
    TParamName extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
>() => {
    type Func = typeof innerWithRefineries<TData, TParamName, TForges, TRefineries>;

    type RefineReturn = ReturnType<ReturnType<Func>["refine"]>;

    // eslint-disable-next-line no-constant-condition
    if ("true") {
        throw new Error("TypeGenFunc is not meant to be executed. It is only used for type organization.");
    }

    return {} as unknown as {
        refine: (data: TData) => RefineReturn;
    };
};

export type RefineryComplexRefineInstance<
    TData extends object,
    TParamName extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
> = ReturnType<typeof RefineryComplexRefineInstanceTypeGen<TData, TParamName, TForges, TRefineries>>;

const RefineryComplexRefineInstanceTypeGen = <
    TData extends object,
    TParamName extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
>() => {
    type RefineFunc = typeof refine<TData, TParamName, TForges, TRefineries>;

    type RefineReturn = ReturnType<RefineFunc>;

    type RefineWithRefineriesReturn = ReturnType<RefineReturn["withRefineries"]>;

    // eslint-disable-next-line no-constant-condition
    if ("true") {
        throw new Error("TypeGenFunc is not meant to be executed. It is only used for type organization.");
    }

    return {} as unknown as RefineWithRefineriesReturn;
};
