import getLogger from "@Shared/Log/getLogger";
import { Immutable } from "@Shared/String/makeImmutable";

import { NormalizedEvolverName } from "../../Evolvers/Evolver/Util/normalizeEvolverName";
import { ForgeDefs } from "../Types/RefineryTypes";
import { Refinery } from "./";
import { NormalizedRefineryName, normalizeRefineryName } from "./Util/normalizeRefineryName";

const log = getLogger("RefineryComplex");

/**
 * Transforms the keys of an input type T by removing 'refinery' from their names.
 * This is particularly useful for avoiding name collisions and simplifying property names in the context of multiple refineries.
 */
type AllRefineriesNormalized<T> = {
    [K in keyof T as NormalizedEvolverName<Extract<K, string>>]: T[K];
};

/**
 * Manages a complex of refineries, providing a structured way to process data.
 * This class facilitates a fluent interface for refining data, akin to constructing a sentence:
 * `RefineryComplex.refine(myData).withRefineries({ ... })`.
 */
export class RefineryComplex {
    public static create = <TForgeableData, TParamNoun extends string>() => ({
        withRefineries: <
            TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
            TRefineries extends Record<
                TRefineryName,
                Refinery<TForgeableData, TForges, TRefineryName, TParamNoun>
            >,
            TRefineryName extends string,
        >(
            refineries: TRefineries,
        ) => {
            const result = {
                refine: (input: TForgeableData) =>
                    RefineryComplex.refine(input).withRefineries(refineries),
            } as const;

            log.debug("Creating refinery complex with refineries", refineries);

            return result;
        },
    });

    /**
     * Begins the data refinement process in a fluid, sentence-like pattern.
     * Allows the specification of refineries to process the input data.
     */
    private static refine = <TForgeableData>(input: TForgeableData) => ({
        /**
         * Specifies the set of refineries to be used for processing the input data.
         * Each property in the provided object should be a Refinery whose data matches TForgeableData.
         * Follows a fluent pattern, allowing for intuitive and clear data processing steps.
         */
        withRefineries: <
            TRefineries extends Record<string, Refinery<TForgeableData, any, string, string>>,
        >(
            refineries: TRefineries,
        ) => {
            log.debug("Refining data with refineries", refineries);

            /**
             * Represents the names of the refineries as provided in the withRefineries argument.
             */
            type TRefineryPassedNames = keyof TRefineries;

            /**
             * Maps each provided refinery to its output as determined by the getForges method.
             * The getForges method represents the core functionality of each refinery.
             */
            type RefineriesRemapped = {
                [K in TRefineryPassedNames]: ReturnType<
                    ReturnType<TRefineries[K]["refine"]>["getForges"]
                >;
            };

            /**
             * Represents an individual refinery within the provided collection.
             */
            type OneRefinery<TRefineryName extends TRefineryPassedNames> = ReturnType<
                TRefineries[TRefineryName]["refine"]
            >;

            /**
             * Represents the set of functions responsible for the forging/refining process within each refinery.
             */
            type OneForgeSet<TRefineryName extends TRefineryPassedNames> = ReturnType<
                OneRefinery<TRefineryName>["getForges"]
            >;

            /**
             * After remapping the outputs of each refinery's functions, this type removes 'Refinery' from their names.
             * This avoids naming conflicts and simplifies the use of these functions in the application.
             */
            type RefineriesFormatted = AllRefineriesNormalized<RefineriesRemapped>;

            const keys = Object.keys(refineries) as TRefineryPassedNames[];

            const result = keys.reduce((acc, key: string) => {
                const refinery = refineries[key];
                const forges = refinery.refine(input).getForges() as OneForgeSet<typeof key>;
                const formattedRefineryName = normalizeRefineryName(
                    key,
                ) as NormalizedRefineryName<string>;

                (acc as Record<NormalizedRefineryName<string>, any>)[formattedRefineryName] =
                    forges;

                log.debug(`Refinery ${key} processed with forges`, forges);

                return acc;
            }, {} as RefineriesFormatted);

            log.debug(`Refinery complex created with refineries: ${keys.join(", ")}`);

            return result;
        },
    });
}
