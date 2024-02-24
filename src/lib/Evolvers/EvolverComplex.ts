import { getLogger } from "loglevel";

import { Mutable } from "@Shared/String/makeMutable";

import { Evolver } from "./Evolver";
import { EvolveObject, MutateObject } from "./Types/EvolverTypes";
import { MutatorDefs } from "./Types/MutatorTypes";
import { NormalizedEvolverName, normalizeEvolverName } from "./Util/normalizeEvolverName";

const log = getLogger("EvolverComplex");

/** Utility type for extracting string keys from a type. */
type StringKeyOf<T> = {
    [K in keyof T]: K extends string ? K : never;
}[keyof T];

/** Type utility for removing 'Evolver' prefix from type names. */
type RemoveEvolverFromName<T> = {
    [K in keyof T as NormalizedEvolverName<Extract<K, string>>]: T[K];
};

/** Facilitates complex data transformations by combining multiple Evolvers. */
export class EvolverComplex {
    /** Initializes the creation process for a new EvolverComplex instance. */
    public static create = <TData>() => ({
        /** Specifies evolvers to be used with the EvolverComplex. */
        withEvolvers: <
            TEvolvers extends Record<string, Evolver<TEvolverName, TParamName, TData, any>>,
            TEvolverName extends string,
            TParamName extends string,
        >(
            evolvers: TEvolvers,
        ) => {
            log.debug(
                `Creating evolver complex with evolvers: ${Object.keys(evolvers).join(", ")}`,
            );

            return {
                /**
                 * Performs a single mutation on the given input, and returns the resulting
                 * transformed data.
                 *
                 * Examples:
                 *
                 *     const { BoxScore } = BaseballEvolverComplex.mutate(myData);
                 *     const result = BoxScore.setRuns(5);
                 */
                mutate: (input: TData) => EvolverComplex.mutate(input).withEvolvers(evolvers),
                /**
                 * Performs multiple mutations on the given input, chained together. The final
                 * result is available via the `finish` method, or by preceding the final chained
                 * call with `.finally`.
                 *
                 * Examples:
                 *
                 *     const { BoxScore } = BaseballEvolverComplex.evolve(myData);
                 *     const result = BoxScore.setRuns(5).and.setHits(10).and.setErrors(0).finish(); // option 1
                 *     const result = BoxScore.setRuns(5).and.setHits(10).and.finally.setErrors(0); // option 2
                 */
                evolve: (input: TData) => EvolverComplex.evolve(input).withEvolvers(evolvers),
                use: (input: TData) => ({
                    Mutate: EvolverComplex.mutate(input).withEvolvers(evolvers),
                    Evolve: EvolverComplex.evolve(input).withEvolvers(evolvers),
                }),
            };
        },
    });

    private static mutate = <TData>(input: TData) => {
        log.debug(`Mutating data using evolver complex`, input);

        return {
            /** Configures the mutation process with specific evolvers. */
            withEvolvers: <
                TEvolvers extends Record<
                    string,
                    Evolver<TEvolverName, TParamName, TData, TMutators>
                >,
                TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
                TEvolverName extends string,
                TParamName extends string,
            >(
                evolvers: TEvolvers,
            ) => {
                return this.generateEvolveMethods(evolvers, input, false);
            },
        };
    };

    private static evolve = <TData>(input: TData) => {
        log.debug(`Evolving data using evolver complex`, input);

        return {
            /** Sets up the evolution process with specified evolvers for chained mutations. */
            withEvolvers: <
                TEvolvers extends Record<
                    string,
                    Evolver<TEvolverName, TParamName, TData, TMutators>
                >,
                TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
                TEvolverName extends string,
                TParamName extends string,
            >(
                evolvers: TEvolvers,
            ) => {
                return this.generateEvolveMethods(evolvers, input, true);
            },
        };
    };

    /**
     * Dynamically generates evolution methods for the provided evolvers, based on the input data
     * and a flag indicating whether to use macro mutators.
     *
     * This method iterates over each evolver provided, using either the `evolve` or `mutate` method
     * based on the `macro` flag. It then retrieves the mutators from each evolver and formats the
     * evolver names to align with the complex's naming conventions. The result is a collection of
     * mutators keyed by the formatted evolver names, allowing for dynamic and flexible state
     * evolution.
     *
     * @template TEvolvers - A type representing the evolvers passed to the method.
     * @template TData - The type of the input data upon which the evolvers will operate.
     * @template TIsMacro - A boolean type indicating whether to use macro mutators.
     * @param {TEvolvers} evolvers - An object containing evolvers, which are entities capable of
     *   evolving or mutating the application state.
     * @param {TData} input - The initial state or input data that the evolvers will use to generate
     *   new states or mutations.
     * @param {TIsMacro} macro - A flag indicating whether to use macro mutators (true) or regular
     *   mutators (false).
     * @returns {MutatorsFormatted} A collection of mutators, keyed by the formatted names of the
     *   evolvers, ready for application to the state.
     *
     *   The method leverages TypeScript's advanced typing features to ensure type safety and to
     *   facilitate automatic typing based on the input parameters. It uses utility types to extract
     *   and remap mutators for each evolver, and then reduces this information into a single object
     *   that represents the cumulative mutations available.
     */
    private static generateEvolveMethods<
        TData,
        TIsMacro extends boolean,
        TEvolvers extends Record<string, Evolver<string, string, TData, any>>,
    >(evolvers: TEvolvers, input: TData, macro: TIsMacro) {
        log.debug(`Generating evolve methods for evolvers: ${Object.keys(evolvers).join(", ")}`);

        /** Represents the names of the refineries as provided in the withRefineries argument. */
        type TEvolverPassedNames = StringKeyOf<TEvolvers>;

        // Utility type for accessing specific types within an evolver, such as data, mutators, and mutable parameter names.
        type InnerType<TEvolverName extends keyof TEvolvers> =
            TEvolvers[TEvolverName]["__type__access__"];

        // Determines the mutators for a given evolver by returning the types of mutators available for the evolver's data.
        type MutatorsForEvolver<TEvolverName extends TEvolverPassedNames> = ReturnType<
            MutateObject<
                InnerType<TEvolverName>["evolverName"],
                InnerType<TEvolverName>["mutableParamName"],
                InnerType<TEvolverName>["data"],
                InnerType<TEvolverName>["mutators"]
            >["getMutators"]
        >;

        // Similar to MutatorsForEvolver but for macro mutators, determining the mutators for evolving the state on a larger scale.
        type MacroMutatorsForEvolver<TEvolverName extends TEvolverPassedNames> = ReturnType<
            EvolveObject<
                InnerType<TEvolverName>["evolverName"],
                InnerType<TEvolverName>["mutableParamName"],
                InnerType<TEvolverName>["data"],
                InnerType<TEvolverName>["mutators"]
            >["getMutators"]
        >;

        // Maps each evolver name to its corresponding set of mutators, facilitating direct access to the mutators by name.
        type MutatorsRemapped = {
            [KEvolverName in TEvolverPassedNames]: MutatorsForEvolver<KEvolverName>;
        };

        // Similar to MutatorsRemapped but for macro mutators, mapping each evolver name to its set of macro mutators.
        type MacroMutatorsRemapped = {
            [KEvolverName in TEvolverPassedNames]: MacroMutatorsForEvolver<KEvolverName>;
        };

        // Conditional type that selects between MutatorsRemapped and MacroMutatorsRemapped based on the TIsMacro flag.
        type MutatorsResult = TIsMacro extends true ? MacroMutatorsRemapped : MutatorsRemapped;

        // Applies a transformation to the names of the mutators, removing the 'Evolver' prefix to match the naming conventions of the complex.
        type MutatorsFormatted = RemoveEvolverFromName<MutatorsResult>;

        const keys = Object.keys(evolvers) as TEvolverPassedNames[];

        // Iterates over each evolver name, reducing the collection of evolvers into a single object (result)
        // that maps formatted evolver names to their mutators. This object is then returned as the final result
        // of the method, representing the cumulative mutations available for application to the state.
        const result = keys.reduce((acc, key: TEvolverPassedNames) => {
            log.debug(`Generating mutators for evolver: ${key}`);
            const evolver = evolvers[key];
            const mutators =
                macro ? evolver.evolve(input).getMutators() : evolver.mutate(input).getMutators();
            const formattedEvolverName = normalizeEvolverName(key);
            log.debug(`Formatted evolver name for complex: ${formattedEvolverName}`);

            (acc as Record<NormalizedEvolverName<string>, any>)[formattedEvolverName] = mutators;

            return acc;
        }, {} as MutatorsFormatted);

        return result;
    }
}
