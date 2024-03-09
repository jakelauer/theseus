import { Immutable } from "@Shared/String/makeImmutable";

import type { FuncMinusFirstArg } from "@Types/Modifiers";
import type { NormalizedRefineryName } from "../Util/normalizeRefineryName";

import type { Forge } from "./ForgeTypes";

/**
 * Defines a dictionary of forge functions, transforming each function to exclude its first argument. This
 * facilitates the chaining and composition of forge functions within a refinery.
 *
 * @template TDict A record of named forge functions.
 */
export type ForgeDict<TDict extends Record<string, () => any>> = {
    [K in keyof TDict]: FuncMinusFirstArg<TDict[K], ReturnType<TDict[K]>>;
};

/**
 * Describes the definitions of forge functions applicable to forgeable data, supporting hierarchical
 * structuring.
 *
 * @template TData The type of data that the forge functions will operate on.
 * @template TParamName The name of the parameter representing the forgeable part of the data, marked as
 *   immutable.
 */
export type ForgeDefs<TData extends object, TParamName extends Immutable> = {
    [key: string]: ForgeDefChild<TData, TParamName>;
};

/**
 * Represents either a single forge function or a nested collection of forge definitions.
 *
 * @template TData The type of data being refined.
 * @template TParamName The name of the parameter representing the forgeable part of the data, marked as
 *   immutable.
 */
export type ForgeDefChild<TData extends object, TParamName extends Immutable> =
    | Forge<TData, TParamName>
    | ForgeDefs<TData, TParamName>;

/**
 * Exposes forge functions from a set to be used in data refinement processes. This type dynamically creates a
 * chainable interface for each forge function, allowing for intuitive and flexible data transformations.
 *
 * @template TData The type of data being refined.
 * @template TParamName The name of the parameter representing the forgeable part of the data, marked as
 *   immutable.
 * @template TForges The forge definitions to be exposed.
 */
export type ExposeForges<
    TData extends object,
    TParamName extends Immutable,
    TForges extends ForgeDefChild<TData, TParamName>,
> = {
    // Iterate over each key in TMutators to create a chainable method
    [K in keyof TForges]: TForges[K] extends (...args: any) => any ?
        FuncMinusFirstArg<
            // Return another function which creates the chain
            (...args: Parameters<TForges[K]>) => ReturnType<TForges[K]>
        >
    : TForges[K] extends ForgeDefChild<TData, TParamName> ? ExposeForges<TData, TParamName, TForges[K]>
    : never;
};

/**
 * Represents an instance of a refinery, encapsulating its name, the immutable argument name, and the forge
 * functions available for refining data.
 *
 * @template TData The type of data to be refined.
 * @template TForges The forge definitions applicable to the forgeable data.
 * @template TRefineryName The name of the refinery, affecting how it's referenced and used.
 * @template TParamNoun The name of the parameter representing the forgeable part of the data.
 */
export type RefineryInstance<
    TData extends object,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
    TRefineryName extends string,
    TParamNoun extends string,
> = {
    refineryName: NormalizedRefineryName<TRefineryName>;
    immutableArgName: Immutable<TParamNoun>;

    refine: (input: TData) => {
        withForge: ExposeForges<TData, Immutable<TParamNoun>, TForges>;
        getForges: () => ExposeForges<TData, Immutable<TParamNoun>, TForges>;
    };

    getForgeDefinitions: () => TForges;
};

/**
 * Represents the refinement process for a given set of data using defined forge functions. This type
 * encapsulates the actions available after initiating a refinement operation with a refinery, offering
 * methods to apply the forges and retrieve the refined data.
 *
 * The `RefineObject` type is part of the Theseus project's refineries system, providing a structured and
 * type-safe way to perform data transformations. It supports a fluent API for applying forge functions to the
 * data, enabling clear and concise expression of complex data transformation logic.
 *
 * @template TData The type of data being refined.
 * @template TForges The forge definitions applicable to the forgeable data. This includes any transformations
 *   or modifications that can be applied to the data as part of the refinement process.
 * @template TParamNoun The name of the parameter representing the forgeable part of the data, marked as
 *   immutable. This ensures that the original data is not mutated during the refinement process, adhering to
 *   the principles of immutability and functional programming.
 *
 *   Usage involves calling `using` to apply the forge functions directly to the data, or `getForges` to
 *   retrieve the set of available forge functions for manual application or inspection. This flexibility
 *   allows developers to choose the most appropriate approach for their specific data transformation needs.
 */
export type RefineObject<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, Immutable<TParamNoun>>,
> = ExposeForges<TData, Immutable<TParamNoun>, TForges>;

/**
 * Describes the structure for defining a refinery, including its name and the data noun used to refer to
 * input data.
 *
 * @template TName The name of the refinery.
 * @template TParamNoun The name of the parameter, defaulting to "input", used to refer to the input data.
 */
export interface RefineryDefinition<TParamNoun extends string = "input"> {
    /**
     * The name of the variable which will be used to refer to the input data. This will be prepended with
     * "immutable", so if the name is "user", the variable will be "immutableUser". Refineries are designed to
     * take in immutable data and return a new object, rather than mutating the original object.
     *
     * If you want to mutate the original object, use an Evolver instead.
     */
    noun?: TParamNoun;
}
