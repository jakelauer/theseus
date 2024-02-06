import type { Func, FuncMinusFirstArg } from "../../Types/Modifiers";
import type { RefineryRenamedForComplex } from "../RefineryComplex/renameRefineryForComplex";
import type { Forge } from "./ForgeTypes";

export type Immutable<TParamName extends string = string> = `immutable${Capitalize<TParamName>}`;

export type ForgeDict<TDict extends Record<string, Func>> = {
    [K in keyof TDict]: FuncMinusFirstArg<TDict[K], ReturnType<TDict[K]>>;
};

export type ForgeDefs<TForgeableData, TParamName extends Immutable> = {
    [key: string]: ForgeDefChild<TForgeableData, TParamName>;
};

export type ForgeDefChild<TForgeableData, TParamName extends Immutable> =
    | Forge<TForgeableData, TParamName>
    | ForgeDefs<TForgeableData, TParamName>;

/**
 * Exposes functions from the forge set to be used
 */

export type ExposeForges<
    TForgeableData,
    TParamName extends Immutable,
    TForges extends ForgeDefChild<TForgeableData, TParamName>,
> = {
    // Iterate over each key in TMutators to create a chainable method
    [K in keyof TForges]: TForges[K] extends (...args: any) => any ?
        FuncMinusFirstArg<
            // Return another function which creates the chain
            (...args: Parameters<TForges[K]>) => ReturnType<TForges[K]>
        >
    : TForges[K] extends ForgeDefChild<TForgeableData, TParamName> ?
        ExposeForges<TForgeableData, TParamName, TForges[K]>
    :   never;
};

/**
 * Exposes all functions from the forge set to be used
 */
export type RefineryInstance<
    TForgeableData,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
    TRefineryName extends string,
    TParamNoun extends string,
> = {
    refineryName: RefineryRenamedForComplex<TRefineryName>;
    immutableArgName: Immutable<TParamNoun>;

    refine: (input: TForgeableData) => {
        withForge: ExposeForges<TForgeableData, Immutable<TParamNoun>, TForges>;
        getForges: () => ExposeForges<TForgeableData, Immutable<TParamNoun>, TForges>;
    };

    getForgeDefinitions: () => TForges;
};

export type RefineObject<
    TForgeableData,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
    TParamNoun extends string,
> = {
    using: ExposeForges<TForgeableData, Immutable<TParamNoun>, TForges>;
    getForges: () => ExposeForges<TForgeableData, Immutable<TParamNoun>, TForges>;
};

export interface RefineryDefinition<TName extends string, TParamNoun extends string = "input"> {
    /**
     * The name of the variable which will be used to refer to the input data. This will be
     * prepended with "immutable", so if the name is "user", the variable will be "immutableUser".
     * Refineries are designed to take in immutable data and return a new object, rather than
     * mutating the original object.
     *
     * If you want to mutate the original object, use an Evolver instead.
     */
    dataNoun?: TParamNoun;
    /**
     * The name of the refinery. This will be used to refer to the refinery in the forge set, and is also
     * the name of the refinery when it is returned from the `create` method.
     */
    name: TName;
}
