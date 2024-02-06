import { makeImmutable } from "../../Utils/StringUtils";
import { ForgeSet } from "../ForgeSet/ForgeSet";
import { RemoveRefineryFromName } from "../RefineryComplex/renameRefineryForComplex";
import { ForgeDefs, Immutable, RefineObject, RefineryDefinition } from "../Types/RefineryTypes";

export class Refinery<
    TForgeableData,
    TForges extends ForgeDefs<TForgeableData, Immutable<TParamNoun>>,
    TRefineryName extends string,
    TParamNoun extends string,
> {
    public readonly refineryName: RemoveRefineryFromName<TRefineryName>;
    public readonly immutableArgName: Immutable<TParamNoun>;
    private readonly forges: TForges;

    private constructor(definitions: RefineryDefinition<TRefineryName, TParamNoun>, forges: TForges) {
        const normalizedName = this.normalizeName(definitions.name);
        const immutableDataNoun: TParamNoun = definitions.dataNoun ?? ("input" as TParamNoun);

        this.refineryName = normalizedName;
        this.immutableArgName = makeImmutable(immutableDataNoun);
        this.forges = forges;
    }

    private normalizeName(name: TRefineryName) {
        const trimmed = this.trimRefineryFromName(name);

        this.assertValidName(trimmed, "Name cannot be empty, nor only the word 'refinery'");

        return name as RemoveRefineryFromName<TRefineryName>;
    }

    private trimRefineryFromName(name: string) {
        const ensureName = name ?? "";
        return ensureName.replace(/^(refinery\s+|\s+refinery)$/gi, "");
    }

    private assertValidName(name: string, errorMessage: string) {
        if (!name || name.trim().length === 0) {
            throw new Error(`Refinery name cannot be empty. ${errorMessage}`);
        }
    }

    /**
     * The data upon which mutates will be performed
     */
    public refine(input: TForgeableData) {
        // Create the actions which will be available when `for()` is called.
        const forgeSet = ForgeSet.create<TForgeableData, Immutable<TParamNoun>, TForges>(
            input,
            this.immutableArgName,
            this.forges,
        );

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

    public getForgeDefinitions() {
        return this.forges;
    }

    public static create = <_TRefineryName extends string, _TParamNoun extends string>(
        definitions: RefineryDefinition<_TRefineryName, _TParamNoun>,
    ) => ({
        /**
         * Name the evolver. This name will affect the argument passed in to each evolver action.
         * For example, if the name is "shoppingCart", each action will receive an argument entitled "mutableShoppingCart"
         */
        toRefine: <_TForgeableData>() => ({
            withForges: <_TForges extends ForgeDefs<_TForgeableData, Immutable<_TParamNoun>>>(forges: _TForges) => {
                // This is a trick to force the type of the return value to be the name of the refinery.
                type ForceReturnVariableName = Record<
                    _TRefineryName,
                    Refinery<_TForgeableData, _TForges, _TRefineryName, _TParamNoun>
                >;

                const refinery = new Refinery<_TForgeableData, _TForges, _TRefineryName, _TParamNoun>(
                    definitions,
                    forges,
                );

                return {
                    [definitions.name]: refinery,
                } as ForceReturnVariableName;
            },
        }),
    });
}
