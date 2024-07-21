import { getTheseusLogger } from "theseus-logger";
import { ForgeSet } from "./ForgeSets/ForgeSet.js";
import { normalizeRefineryName, type NormalizedRefineryName } from "./Util/normalizeRefineryName.js";
import type {
	ForgeDefs, RefineObject, RefineryDefinition as RefineryOptions, 
} from "./Types/RefineryTypes.js";
import { sandbox } from "theseus-sandbox";

const log = getTheseusLogger("Refinery");

/**
 * Represents a refinery for transforming data using a set of forge functions. A refinery encapsulates the
 * logic for applying these transformations, offering a fluent API for defining and executing data
 * refinements.
 */

export type RefineryInitializer<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
> = (data: TData) => RefineObject<TData, TParamNoun, TForges>;

export type RefineryResult<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
> = RefineryInitializer<TData, TParamNoun, TForges>;

export class Refinery<
    TData extends object,
    TRefineryName extends string,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
> 
{
	public readonly refineryName: NormalizedRefineryName<TRefineryName>;
	public readonly paramNoun: TParamNoun;
	private readonly forges: TForges;

	private constructor(name: TRefineryName, forges: TForges, options: RefineryOptions<TParamNoun>) 
	{
		const normalizedName = this.normalizeName(name);

		this.refineryName = normalizedName;
		this.paramNoun = options.noun ?? ("input" as TParamNoun);
		this.forges = forges;
	}

	/**
     * Normalizes the refinery name by removing any 'refinery' prefix or suffix, ensuring a clean,
     * user-friendly name for the refinery instance.
     */
	private normalizeName(name: TRefineryName) 
	{
		const trimmed = normalizeRefineryName(name);

		log.verbose(`Normalizing refinery name: ${name} -> ${trimmed}`);

		this.assertValidName(trimmed, "Name cannot be empty, nor only the word 'refinery'");

		return trimmed as unknown as NormalizedRefineryName<TRefineryName>;
	}

	private assertValidName(name: string, errorMessage: string) 
	{
		if (!name || name.trim().length === 0) 
		{
			log.error(`Refinery name is invalid. ${errorMessage}`);
			throw new Error(`Refinery name is invalid. ${errorMessage}`);
		}
	}

	/**
     * Initiates the refinement process on the input data using the defined set of forges. This method returns
     * an object allowing further specification of how the data should be refined.
     */
	public refine(input: TData) 
	{
		const clone = sandbox(input, {
			mode: "copy",
		});

		// Create the actions which will be available when `for()` is called.
		const forgeSet = ForgeSet.create<TData, TParamNoun, TForges>(clone as TData, this.paramNoun, this.forges);

		/**
         * Save memory by not duplicating forgeSet on both `into` and `forges`. Why both? Depends on the
         * use-case. Destructuring feels better with `forges`, but `into` looks better with chaining.
         *
         * Const { bar } = fooRefinery.forge(fooData).forges;
         *
         * Vs
         *
         * FooRefinery.forge(fooData).into.bar();
         */
		const forgeSetGetter = () => forgeSet;
		const result = {
			...forgeSet,
			getForges: () => forgeSetGetter(),
		};

		return result;
	}

	/** Retrieves the definitions of forges associated with this refinery. */
	public getForgeDefinitions() 
	{
		return this.forges;
	}
	/**
     * Factory method for creating a new refinery instance. This method initiates the refinery configuration
     * process, allowing the caller to specify the data type to be refined and the forge functions to be used
     * for the refinement. It employs a fluent API design, enabling a step-by-step specification of the
     * refinery's configuration in a clear and intuitive manner.
     *
     * The method returns an object with a `toRefine` method, marking the beginning of the refinery
     * configuration. The `toRefine` method, in turn, expects a callback to define the data type for the
     * refinery. This callback provides another method, `withForges`, which is used to specify the forge
     * functions applicable to the data type. Finally, `withForges` returns the configured refinery instance,
     * ready for use.
     *
     * Usage example:
     *
     * ```typescript
     * const {MyRefinery} = Refinery.create("MyRefinery", "theData")
     *   .toRefine<{ myDataType: number }>() // Specify the data type to be refined
     *   .withForges({ // Define the forge functions
     *     forgeFunction1: (theData) => { ... },
     *     forgeFunction2: (theData) => { ... },
     *   });
     * ```
     *
     * @template _TRefineryName The name of the refinery, affecting how it's referenced and used.
     * @template _TParamNoun The name of the parameter representing the forgeable part of the data.
     * @param definitions An object containing the refinery's name and optionally the data noun. The data noun
     *   specifies the name of the parameter that represents the forgeable data within the forge functions.
     * @returns An object with a `toRefine` method, marking the start of the refinery configuration process.
     */
	public static create = <_TRefineryName extends string, _TParamNoun extends string>(
	/**
         * The name of the refinery. This will be used to refer to the refinery in the forge set, and is also
         * the name of the refinery when it is returned from the `create` method.
         */
		name: _TRefineryName,
		options: RefineryOptions<_TParamNoun>,
	) => ({
		/**
         * Name the evolver. This name will affect the argument passed in to each evolver action. For example,
         * if the name is "shoppingCart", each action will receive an argument entitled "shoppingCart"
         */
		toRefine: <_TData extends object>() => ({
			withForges: <_TForges extends ForgeDefs<_TData, _TParamNoun>>(forges: _TForges) => 
			{
				const refinery = new Refinery<_TData, _TRefineryName, _TParamNoun, _TForges>(name, forges, options);

				return refinery;
			},
		}),
	});

	/**
     * Provides a builder function to simplify the creation of Evolver instances, supporting a fluent
     * configuration API.
     *
     * @returns A function for fluently configuring and creating an Evolver instance.
     */
	public static buildCreator = <_TParamNoun extends string>(options: RefineryOptions<_TParamNoun>) => ({
		toRefine: <_TData extends object>() => ({
			named: <_TRefineryName extends string>(name: _TRefineryName) => 
			{
				const nameHasWhitespace = name.match(/\s/);
				if (nameHasWhitespace) 
				{
					throw new Error(`Refinery name cannot contain whitespace: ${name}`);
				}

				return this.create<_TRefineryName, _TParamNoun>(name, options).toRefine<_TData>();
			},
		}),
	});
}
