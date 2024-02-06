import { Refinery } from "../Refinery/Refinery";
import { ForgeDefs, Immutable } from "../Types/RefineryTypes";
import { RefineryRenamedForComplex, renameRefineryForComplex } from "./renameRefineryForComplex";

/**
 * Transforms the keys of an input type T by removing 'refinery' from their names.
 * This is particularly useful for avoiding name collisions and simplifying property names in the context of multiple refineries.
 */
type RemoveRefineryFromName<T> = {
    [K in keyof T as RefineryRenamedForComplex<Extract<K, string>>]: T[K];
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
            TRefineries extends Record<TRefineryName, Refinery<TForgeableData, TForges, TRefineryName, TParamNoun>>,
            TRefineryName extends string,
        >(
            refineries: TRefineries,
        ) =>
            ({
                refine: (input: TForgeableData) => RefineryComplex.refine(input).withRefineries(refineries),
            }) as const,
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
        withRefineries: <TRefineries extends Record<string, Refinery<TForgeableData, any, string, string>>>(
            refineries: TRefineries,
        ) => {
            /**
             * Represents the names of the refineries as provided in the withRefineries argument.
             */
            type TRefineryPassedNames = keyof TRefineries;

            /**
             * Maps each provided refinery to its output as determined by the getForges method.
             * The getForges method represents the core functionality of each refinery.
             */
            type RefineriesRemapped = {
                [K in TRefineryPassedNames]: ReturnType<ReturnType<TRefineries[K]["refine"]>["getForges"]>;
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
            type RefineriesFormatted = RemoveRefineryFromName<RefineriesRemapped>;

            const keys = Object.keys(refineries) as TRefineryPassedNames[];

            const result = keys.reduce((acc, key: string) => {
                const refinery = refineries[key];
                const forges = refinery.refine(input).getForges() as OneForgeSet<typeof key>;
                const formattedRefineryName = renameRefineryForComplex(key) as RefineryRenamedForComplex<string>;

                (acc as Record<RefineryRenamedForComplex<string>, any>)[formattedRefineryName] = forges;

                return acc;
            }, {} as RefineriesFormatted);

            return result;
        },
    });
}
