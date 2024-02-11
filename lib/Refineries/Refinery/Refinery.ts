import cloneDeep from "clone-deep";
import deepFreeze from "deep-freeze-strict";
import log from "loglevel";

import { makeImmutable } from "../../Utils/StringUtils";
import { ForgeSet } from "../ForgeSet/ForgeSet";
import { NormalizedRefineryName } from "../RefineryComplex/normalizeRefineryName";
import { ForgeDefs, Immutable, RefineObject, RefineryDefinition } from "../Types/RefineryTypes";

/**
 * Represents a refinery for transforming data using a set of forge functions.
 * A refinery encapsulates the logic for applying these transformations, offering
 * a fluent API for defining and executing data refinements.
 *
 * @template TForgeableData The type of data being refined.
 * @template TForges The definitions of forge functions applicable to the forgeable data.
 * @template TRefineryName The name of the refinery, affecting how it's referenced and used.
 * @template TParamNoun The name of the parameter representing the forgeable part of the data.
 */
export class Refinery<
    TForgeableData,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
    TRefineryName extends string,
    TParamNoun extends string,
> {
    public readonly refineryName: NormalizedRefineryName<TRefineryName>;
    public readonly immutableArgName: Immutable<TParamNoun>;
    private readonly forges: TForges;

    private constructor(definitions: RefineryDefinition<TRefineryName, TParamNoun>, forges: TForges) {
        log.trace(`Creating refinery with name: ${definitions.name}`, forges);
        const normalizedName = this.normalizeName(definitions.name);
        const immutableDataNoun: TParamNoun = definitions.dataNoun ?? ("input" as TParamNoun);

        this.refineryName = normalizedName;
        this.immutableArgName = makeImmutable(immutableDataNoun);
        this.forges = forges;
    }

    /**
     * Normalizes the refinery name by removing any 'refinery' prefix or suffix, ensuring
     * a clean, user-friendly name for the refinery instance.
     */
    private normalizeName(name: TRefineryName) {
        const trimmed = this.trimRefineryFromName(name);

        this.assertValidName(trimmed, "Name cannot be empty, nor only the word 'refinery'");

        log.trace(`Normalizing refinery name: ${name} -> ${trimmed}`);

        return name as NormalizedRefineryName<TRefineryName>;
    }

    private trimRefineryFromName(name: string) {
        const ensureName = name ?? "";
        return ensureName.replace(/^(refinery\s+|\s+refinery)$/gi, "");
    }

    private assertValidName(name: string, errorMessage: string) {
        if (!name || name.trim().length === 0) {
            log.error(`Refinery name is invalid. ${errorMessage}`);
            throw new Error(`Refinery name is invalid. ${errorMessage}`);
        }
    }

    /**
     * Initiates the refinement process on the input data using the defined set of forges.
     * This method returns an object allowing further specification of how the data should be refined.
     */
    public refine(input: TForgeableData) {
        const inputClone = cloneDeep(input);
        log.trace(`Cloned input data for refinery: `, inputClone);

        deepFreeze(inputClone);
        log.trace(`Ensured input data is immutable for refinery "${this.refineryName}" via deep-freeze`);

        // Create the actions which will be available when `for()` is called.
        const forgeSet = ForgeSet.create<TForgeableData, Immutable<TParamNoun>, TForges>(
            input,
            this.immutableArgName,
            this.forges,
        );

        log.trace(`Created forge set for refinery "${this.refineryName}"`);

        /**
         * Save memory by not duplicating forgeSet on both `into` and `forges`.
         * Why both? Depends on the use-case. Destructuring feels better with
         * `forges`, but `into` looks better with chaining.
         *
         * const { bar } = fooRefinery.forge(fooData).forges;
         *
         * vs
         *
         * fooRefinery.forge(fooData).into.bar();
         */
        const forgeSetGetter = () => forgeSet;
        const result = Object.defineProperties<RefineObject<TForgeableData, TForges, TParamNoun>>({} as any, {
            getForges: {
                get: () => forgeSetGetter,
            },
            using: {
                get: forgeSetGetter,
            },
        });

        return result as RefineObject<TForgeableData, TForges, TParamNoun>;
    }

    /**
     * Retrieves the definitions of forges associated with this refinery.
     */
    public getForgeDefinitions() {
        return this.forges;
    }
    /**
     * Factory method for creating a new refinery instance. This method initiates the refinery configuration process,
     * allowing the caller to specify the data type to be refined and the forge functions to be used for the refinement.
     * It employs a fluent API design, enabling a step-by-step specification of the refinery's configuration in a clear and intuitive manner.
     *
     * The method returns an object with a `toRefine` method, marking the beginning of the refinery configuration. The `toRefine` method,
     * in turn, expects a callback to define the data type for the refinery. This callback provides another method, `withForges`, which is used
     * to specify the forge functions applicable to the data type. Finally, `withForges` returns the configured refinery instance, ready for use.
     *
     * Usage example:
     * ```typescript
     * const {MyRefinery} = Refinery.create("MyRefinery", "theData")
     *   .toRefine<{ myDataType: number }>() // Specify the data type to be refined
     *   .withForges({ // Define the forge functions
     *     forgeFunction1: (immutableTheData) => { ... },
     *     forgeFunction2: (immutableTheData) => { ... },
     *   });
     * ```
     *
     * @template _TRefineryName The name of the refinery, affecting how it's referenced and used.
     * @template _TParamNoun The name of the parameter representing the forgeable part of the data.
     * @param definitions An object containing the refinery's name and optionally the data noun. The data noun specifies the name of the parameter that represents the forgeable data within the forge functions.
     * @returns An object with a `toRefine` method, marking the start of the refinery configuration process.
     */
    public static create = <_TRefineryName extends string, _TParamNoun extends string>(
        definitions: RefineryDefinition<_TRefineryName, _TParamNoun>,
    ) => ({
        /**
         * Name the evolver. This name will affect the argument passed in to each evolver action.
         * For example, if the name is "shoppingCart", each action will receive an argument entitled "mutableShoppingCart"
         */
        toRefine: <_TForgeableData>() => ({
            withForges: <_TForges extends ForgeDefs<_TForgeableData, Immutable<_TParamNoun>>>(forges: _TForges) => {
                log.trace(`Creating refinery with name: ${definitions.name}`, forges);

                // This is a trick to force the type of the return value to be the name of the refinery.
                type ForceReturnVariableName = Record<
                    _TRefineryName,
                    Refinery<_TForgeableData, _TForges, _TRefineryName, _TParamNoun>
                >;

                const refinery = new Refinery<_TForgeableData, _TForges, _TRefineryName, _TParamNoun>(
                    definitions,
                    forges,
                );

                log.trace(`Created refinery with name: ${refinery.refineryName}`);

                return {
                    [definitions.name]: refinery,
                } as ForceReturnVariableName;
            },
        }),
    });
}
