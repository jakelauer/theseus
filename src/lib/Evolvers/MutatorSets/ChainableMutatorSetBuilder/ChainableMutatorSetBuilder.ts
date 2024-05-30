import { ChainableMutatorQueue } from "@Evolvers/MutatorSets/ChainableMutatorSetBuilder/operations/ChainableMutatorQueue";
import { createChainingProxy } from "@Evolvers/MutatorSets/ChainableMutatorSetBuilder/operations/createChainingProxy";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";

import { MutatorSetBuilder } from "../MutatorSetBuilder/MutatorSetBuilder";

import type { Chainable, ChainableMutators } from "@Evolvers/Types/ChainableTypes";
import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";

import type { GenericMutator, ParamNameData, MutatorDefs } from "../../Types/MutatorTypes";
/**
 * Extends MutatorSet to provide chainable mutation operations on evolver data. This class allows mutations to
 * be chained together in a fluent manner, enhancing the clarity and expressiveness of state evolution logic.
 *
 * @template TData The type of data the evolver operates on.
 * @template TParamName The type representing the names of data parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */

const log = getTheseusLogger("ChainableMutatorSetBuilder");

export class ChainableMutatorSetBuilder<
        TData extends object,
        TParamName extends string,
        TMutators extends MutatorDefs<TData, TParamName>,
    >
	extends MutatorSetBuilder<TData, TParamName, TMutators>
	implements Chainable<TData> 
{
	private calls = 0;

	private mutatorQueue: ChainableMutatorQueue<TData, TParamName>;

	// Created by createChainingProxy; always matches the type of the current instance
	private chainingProxy: typeof this;

	constructor(inputData: TData, argName: TParamName, mutators: TMutators) 
	{
		super(inputData, argName, mutators);

		this.mutatorQueue = ChainableMutatorQueue.create({
			argName,
			getData: this.getData.bind(this),
			setData: this.setData.bind(this),
		});

		this.chainingProxy = createChainingProxy({
			target: this,
			observationId: this.__theseusId as string,
			queue: this.mutatorQueue,
		});
	}

	private getData() 
	{
		return this.data;
	}

	private setData(data: ParamNameData<TData, TParamName>) 
	{
		if (data instanceof Promise)
		{
			throw new Error("Cannot set data to a Promise.");
		}

		this.data = data;
	}

	private get resultBase():Promise<TData> | TData 
	{
		return this.mutatorQueue.asyncEncountered
			? Promise.resolve(this.data[this.argName]) 
			: this.data[this.argName];
	}

	public get result() 
	{
		return this.resultBase as TData;
	}

	public get resultAsync(): Promise<TData> 
	{
		return this.resultBase as Promise<TData>;
	}

	/**
     * Overrides addFunctionToSelf to support chainable operations. If the operation is asynchronous (returns
     * a Promise), it returns the Promise directly. Otherwise, it enhances the returned object with a
     * chainable interface.
     *
     * @param context The object context to which the mutator function is added.
     * @param selfPath The path (name) under which the mutator function is stored in the context.
     * @param mutator The mutator function to be executed.
     */
	protected override addFunctionToSelf(
		context: any,
		selfPath: string,
		mutator: GenericMutator<TData, SortaPromise<TData>>,
	) 
	{
		Object.assign(context, {
			[selfPath]: (...args: any[]) => 
			{
				this.calls++;

				const [dataDraft, ...rest] = args;

				log.debug(`Executing mutator ${selfPath}`, { args });

				const result = mutator(dataDraft, ...rest);

				Object.assign(dataDraft[this.argName], result);

				return result;
			},
		});
	}

	protected override getSelfExtensionPoint() 
	{
		return this.fixedMutators;
	}

	/**
     * Factory method to create an instance of ChainableMutatorSet with specified initial data, argument name,
     * and mutator definitions. Facilitates the creation of chainable mutators.
     *
     * @param data Initial state data.
     * @param argName Name of the argument representing the data.
     * @param mutators Definitions of mutators to apply to the state.
     * @returns An instance of ChainableMutatorSet configured with the provided parameters.
     */
	public static  createChainable<
        TData extends object,
        TParamName extends string,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(data: TData, argName: TParamName, mutators: TMutators) 
	{
		const chain = new ChainableMutatorSetBuilder(data, argName, mutators);
		const proxy = chain.chainingProxy;
		return this.castToChainableMutators(proxy);
	}

	/**
     * Casts the provided ChainableMutatorBuilder instance to a ChainableMutators instance. This is a
     * workaround to avoid TypeScript's inability to infer the correct type of the returned object.
     */
	public static castToChainableMutators<
        TData extends object,
        TParamName extends string,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(chainableMutatorSet: ChainableMutatorSetBuilder<TData, TParamName, TMutators>) 
	{
		return chainableMutatorSet as ChainableMutators<TData, TParamName, TMutators>;
	}

	/**
     * Overrides the create method to indicate that ChainableMutatorSet is specifically designed for chainable
     * operations, and does not support the creation of non-chainable mutators.
     */
	public static override create(): never 
	{
		throw new Error("ChainableMutatorSet does not support non-chained mutators.");
	}
}
