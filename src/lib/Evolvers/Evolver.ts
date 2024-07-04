import { ChainableMutatorSetBuilder, MutatorSetBuilder } from "@Evolvers/MutatorSets";

import type {
	EvolveObject,
	EvolverOptions,
	MutateObject,
	TypeAccess,
} from "@Evolvers/Types/EvolverTypes";
import type { MutatorDefs } from "@Evolvers/Types/MutatorTypes";
import { normalizeEvolverName, type NormalizedEvolverName } from "@Evolvers/Util/normalizeEvolverName";
import type { ChainableMutators, FinalMutators } from "./Types/ChainableTypes";
import { getTheseusLogger } from "theseus-logger";
const log = getTheseusLogger("Evolver");

/**
 * Represents an evolver for data transformation and mutation, encapsulating the logic for mutating and
 * evolving data structures.
 */
export class Evolver<
    TData extends object,
    TEvolverName extends string,
    TParamNoun extends string,
    TMutators extends MutatorDefs<TData, TParamNoun>,
> 
{
	#theseusId?: string;
	public readonly evolverName: NormalizedEvolverName<TEvolverName>;
	protected readonly paramNoun: TParamNoun;
	protected readonly mutators: TMutators;

	private cachedMutatorSet: FinalMutators<TData, TParamNoun, TMutators> | undefined;
	private cachedChainableMutatorSet: ChainableMutators<TData, TParamNoun, TMutators> | undefined;

	/**
     * This only exists to provide outside access to the type parameters of evolvers nested within an
     * EvolverComplex. It doesn't need a value.
     */
	public readonly __type__access__: TypeAccess<TData, TEvolverName, TParamNoun, TMutators>;

	/**
     * Constructor for Evolver. Initializes the evolver with a name, set of mutators, and optional
     * configuration.
     */
	protected constructor(name: TEvolverName, mutators: TMutators, options?: EvolverOptions<TParamNoun>) 
	{
		const normalizedName = this.normalizeName(name);
		this.paramNoun = options?.noun ?? ("input" as TParamNoun);

		this.evolverName = normalizedName;

		this.assertValidMutators(mutators);
		this.mutators = mutators;
	}

	public __setTheseusId(id: string) 
	{
		this.#theseusId = id;
	}

	private assertValidMutators(mutators: TMutators) 
	{
		if (!mutators || Object.keys(mutators).length === 0) 
		{
			log.error("Mutators cannot be empty.");
			throw new Error("Mutators cannot be empty.");
		}

		for (const key in mutators) 
		{
			if (!mutators[key]) 
			{
				log.error(`Mutator '${key}' cannot be empty.`);
				throw new Error(`Mutator '${key}' cannot be empty.`);
			}
		}
	}

	private normalizeName(name: TEvolverName) 
	{
		const trimmed = normalizeEvolverName(name);

		this.assertValidName(trimmed, "Name cannot be empty, nor only the word 'refinery'");

		return trimmed as unknown as NormalizedEvolverName<TEvolverName>;
	}

	private assertValidName(name: string, errorMessage: string) 
	{
		if (!name || name.trim().length === 0) 
		{
			throw new Error(`Refinery name cannot be empty. ${errorMessage}`);
		}
	}

	/**
     * Retrieves the definitions of mutators associated with this evolver.
     *
     * @returns A collection of mutator definitions.
     */
	public getMutatorDefinitions = () => this.mutators;

	/**
     * Applies mutation operations to the input data, based on the configured mutators.
     *
     * @returns The mutated data.
     */
	public mutate(input: TData) 
	{
		const mutatorSet =
            this.cachedMutatorSet ??
            MutatorSetBuilder.create<TData, TParamNoun, TMutators>(
            	input,
            	this.paramNoun,
            	this.mutators,
            	this.#theseusId,
            );

		if (!this.cachedMutatorSet) 
		{
			this.cachedMutatorSet = mutatorSet;
		}
		else 
		{
			(mutatorSet as MutatorSetBuilder<any, any, any>).reset(input);
		}

		const mutatorSetGetter = () => mutatorSet;
		const result = Object.defineProperties<
            MutateObject<TData, TEvolverName, TParamNoun, TMutators>
        >({} as any, {
        	getMutators: {
        		get: () => mutatorSetGetter,
        	},
        	via: {
        		get: mutatorSetGetter,
        	},
        });

		return result;
	}

	/**
     * Applies mutation operations to the input data, based on the configured mutators.
     *
     * @returns An object allowing further mutation or chaining operations.
     */
	public evolve(input: TData) 
	{
		const mutatorSet =
            this.cachedChainableMutatorSet ??
            ChainableMutatorSetBuilder.createChainable<TData, TParamNoun, TMutators>(
            	input,
            	this.paramNoun,
            	this.mutators,
            	this.#theseusId,
            );

		if (!this.cachedChainableMutatorSet) 
		{
			this.cachedChainableMutatorSet = mutatorSet;
		}
		else 
		{
			(mutatorSet as ChainableMutatorSetBuilder<any, any, any>).reset(input);
		}


		const mutatorSetGetter = () => mutatorSet;

		const result = Object.defineProperties<
            EvolveObject<TData, TEvolverName, TParamNoun, TMutators>
        >({} as any, {
        	getMutators: {
        		get: () => mutatorSetGetter,
        	},
        	via: {
        		get: mutatorSetGetter,
        	},
        });

		return result;
	}

	/**
     * Accessor for retrieving the mutators directly.
     *
     * @returns The configured mutators for this evolver.
     */
	public getMutators() 
	{
		return this.mutators;
	}

	/**
     * Factory method for creating an Evolver instance, facilitating a fluent API for defining evolvers.
     *
     * @returns A fluent interface for constructing an Evolver with specified data and mutators.
     */
	public static create = <_TEvolverName extends string, _TParamNoun extends string = "input">(
		name: _TEvolverName,
		options?: EvolverOptions<_TParamNoun>,
	) => ({
		toEvolve: <_TData extends object>() => ({
			withMutators: <_TMutators extends MutatorDefs<_TData, _TParamNoun>>(
				mutators: _TMutators,
			) => 
			{
				const evolver = new Evolver<_TData, _TEvolverName, _TParamNoun, _TMutators>(
					name,
					mutators,
					options,
				);

				log.verbose(`Created evolver: ${evolver.evolverName} with mutators:`, {
					mutators: Object.keys(mutators),
				});

				return evolver;
			},
		}),
	});

	/**
     * Provides a builder function to simplify the creation of Evolver instances, supporting a fluent
     * configuration API.
     *
     * @returns A function for fluently configuring and creating an Evolver instance.
     */
	public static buildCreator = <_TParamNoun extends string>(options?: EvolverOptions<_TParamNoun>) => ({
		toEvolve: <_TData extends object>() => ({
			named: <_TEvolverName extends string>(name: _TEvolverName) => 
			{
				log.verbose(`Creating evolver: ${name} with options: ${JSON.stringify(options)}`);

				const nameHasWhitespace = name.match(/\s/);
				if (nameHasWhitespace) 
				{
					throw new Error(`Evolver name cannot contain whitespace: ${name}`);
				}

				return this.create<_TEvolverName, _TParamNoun>(name, options).toEvolve<_TData>();
			},
		}),
	});
}
