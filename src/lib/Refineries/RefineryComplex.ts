import getTheseusLogger from "@Shared/Log/getTheseusLogger";
import { Immutable } from "@Shared/String/makeImmutable";

import { RefineryInitializer } from "./Refinery";
import { ForgeDefs } from "./Types/RefineryTypes";
import { NormalizedRefineryName, normalizeRefineryName } from "./Util/normalizeRefineryName";

const log = getTheseusLogger("RefineryComplex");

/**
 * Transforms the keys of an input type T by removing 'refinery' from their names. This is particularly useful
 * for avoiding name collisions and simplifying property names in the context of multiple refineries.
 */
type AllRefineriesNormalized<T> = {
    [K in keyof T as NormalizedRefineryName<Extract<K, string>>]: T[K];
};

/**
 * Begins the data refinement process in a fluid, sentence-like pattern. Allows the specification of
 * refineries to process the input data.
 */
const refine = <
    TParamNoun extends string,
    TForgeableData,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TParamNoun, TForgeableData, TForges>>,
>(
    input: TForgeableData,
) => ({
    /**
     * Specifies the set of refineries to be used for processing the input data. Each property in the provided
     * object should be a Refinery whose data matches TForgeableData. Follows a fluent pattern, allowing for
     * intuitive and clear data processing steps.
     */
    withRefineries: (refineries: TRefineries) => {
        log.debug("Refining data with refineries", refineries);

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

        /**
         * After remapping the outputs of each refinery's functions, this type removes 'Refinery' from their
         * names. This avoids naming conflicts and simplifies the use of these functions in the application.
         */
        type RefineriesFormatted = AllRefineriesNormalized<RefineriesRemapped>;

        const keys = Object.keys(refineries) as TRefineryPassedNames[];

        const result = keys.reduce((acc, key: string) => {
            const refinery = refineries[key];
            const forges = refinery(input) as OneRefinery<typeof key>;
            const formattedRefineryName = normalizeRefineryName(key) as NormalizedRefineryName<string>;

            (acc as Record<NormalizedRefineryName<string>, any>)[formattedRefineryName] = forges;

            log.debug(`Refinery ${key} processed with forges`, forges);

            return acc;
        }, {} as RefineriesFormatted);

        log.debug(`Refinery complex created with refineries: ${keys.join(", ")}`);

        return result;
    },
});

const create = <TForgeableData>() => ({
    withRefineries: <
        TParamNoun extends string,
        TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
        TRefineries extends Record<string, RefineryInitializer<TParamNoun, TForgeableData, TForges>>,
    >(
        refineries: TRefineries,
    ) => innerWithRefineries<TForgeableData, TParamNoun, TForges, TRefineries>(refineries),
});

const innerWithRefineries = <
    TForgeableData,
    TParamNoun extends string,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
    TRefineries extends Record<string, RefineryInitializer<TParamNoun, TForgeableData, TForges>>,
>(
    refineries: TRefineries,
) => {
    const result = {
        refine: (input: TForgeableData) =>
            refine<TParamNoun, TForgeableData, TForges, TRefineries>(input).withRefineries(refineries),
    } as const;

    log.debug("Creating refinery complex with refineries", refineries);

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
    TForgeableData,
    TParamName extends string,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TParamName, TForgeableData, TForges>>,
> = ReturnType<typeof RefineryComplexInstanceTypeGen<TForgeableData, TParamName, TForges, TRefineries>>;

const RefineryComplexInstanceTypeGen = <
    TForgeableData,
    TParamName extends string,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TParamName, TForgeableData, TForges>>,
>() => {
    type Func = typeof innerWithRefineries<TForgeableData, TParamName, TForges, TRefineries>;

    type RefineReturn = ReturnType<ReturnType<Func>["refine"]>;

    // eslint-disable-next-line no-constant-condition
    if ("true") {
        throw new Error("TypeGenFunc is not meant to be executed. It is only used for type organization.");
    }

    return {} as unknown as {
        refine: (data: TForgeableData) => RefineReturn;
    };
};

export type RefineryComplexRefineInstance<
    TForgeableData,
    TParamName extends string,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TParamName, TForgeableData, TForges>>,
> = ReturnType<typeof RefineryComplexRefineInstanceTypeGen<TForgeableData, TParamName, TForges, TRefineries>>;

const RefineryComplexRefineInstanceTypeGen = <
    TForgeableData,
    TParamName extends string,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TParamName, TForgeableData, TForges>>,
>() => {
    type RefineFunc = typeof refine<TParamName, TForgeableData, TForges, TRefineries>;

    type RefineReturn = ReturnType<RefineFunc>;

    type RefineWithRefineriesReturn = ReturnType<RefineReturn["withRefineries"]>;

    // eslint-disable-next-line no-constant-condition
    if ("true") {
        throw new Error("TypeGenFunc is not meant to be executed. It is only used for type organization.");
    }

    return {} as unknown as RefineWithRefineriesReturn;
};
