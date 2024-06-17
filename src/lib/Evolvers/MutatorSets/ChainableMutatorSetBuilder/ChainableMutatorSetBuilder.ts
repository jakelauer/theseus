import { ChainableMutatorQueue } from "@Evolvers/MutatorSets/ChainableMutatorSetBuilder/ChainableMutatorQueue";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";

import { MutatorSetBuilder } from "../MutatorSetBuilder/MutatorSetBuilder";

import type { Chainable, ChainableMutators } from "@Evolvers/Types/ChainableTypes";
import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";

import type { GenericMutator, MutatorDefs } from "../../Types/MutatorTypes";
import { createChainingProxy } from "./proxy/chaining-proxy-manager";
import { getSandboxChanges, sandbox } from "theseus-sandbox";
/**
 * Extends MutatorSet to provide chainable mutation operations on evolver data. This class allows mutations to
 * be chained together in a fluent manner, enhancing the clarity and expressiveness of state evolution logic.
 *
 * @template TData The type of data the evolver operates on.
 * @template TParamNoun The type representing the names of data parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */

const log = getTheseusLogger("ChainableMutatorSetBuilder");

export class ChainableMutatorSetBuilder<
        TData extends object,
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
    >
	extends MutatorSetBuilder<TData, TParamNoun, TMutators>
	implements Chainable<TData> 
{
	private calls = 0;

	private mutatorQueue: ChainableMutatorQueue<TData, TParamNoun>;

	// Created by createChainingProxy; always matches the type of the current instance
	private chainingProxy: typeof this;

	constructor(inputData: TData, paramNoun: TParamNoun, mutators: TMutators) 
	{
		super(inputData, paramNoun, mutators);

		this.mutatorQueue = ChainableMutatorQueue.create({
			paramNoun,
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
		return this.data[this.paramNoun];
	}

	private setData(data: TData) 
	{
		if (data instanceof Promise)
		{
			throw new Error("Cannot set data to a Promise.");
		}

		this.data[this.paramNoun] = data;
	}

	/**
	 * Get the changes that have been made to the store since the last time this method was called.
	 */
	public getChanges(): Partial<TData>
	{
		console.log("Getting changes for instance", this.data[this.paramNoun]);
		return getSandboxChanges(this.data[this.paramNoun]);
	}

	private get resultBase():Promise<TData> | TData 
	{
		return this.mutatorQueue.asyncEncountered
			? Promise.resolve(this.data[this.paramNoun]) 
			: this.data[this.paramNoun];
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
				const draft = sandbox(this.data, { mode: "copy" });
				
				let funcResult: SortaPromise<TData>;
				try 
				{
					funcResult = mutator(draft, ...args);
				}
				catch (e) 
				{
					log.error(`Error in mutator function "${selfPath}"`, e);
					throw e;
				}

				if (funcResult === undefined) 
				{
					log.error(`Function "${selfPath}" returned undefined. This is likely an error.`);
				}

				const outcomeData = this.applyResultDataToDraft(draft[this.paramNoun], funcResult);

				return this.extractDataFromDraftResult(outcomeData);
			},
		});
	}

	protected override getSelfExtensionPoint() 
	{
		return this.mutatorsForProxy;
	}

	protected override extractDataFromDraftResult(funcResult: SortaPromise<TData>)
	{
		return funcResult;
	};

	/**
     * Factory method to create an instance of ChainableMutatorSet with specified initial data, argument name,
     * and mutator definitions. Facilitates the creation of chainable mutators.
     *
     * @param data Initial state data.
     * @param paramNoun Name of the argument representing the data.
     * @param mutators Definitions of mutators to apply to the state.
     * @returns An instance of ChainableMutatorSet configured with the provided parameters.
     */
	public static  createChainable<
        TData extends object,
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
    >(data: TData, paramNoun: TParamNoun, mutators: TMutators) 
	{
		const chain = new ChainableMutatorSetBuilder(data, paramNoun, mutators);
		const proxy = chain.chainingProxy;
		return this.castToChainableMutators(proxy);
	}

	/**
     * Casts the provided ChainableMutatorBuilder instance to a ChainableMutators instance. This is a
     * workaround to avoid TypeScript's inability to infer the correct type of the returned object.
     */
	public static castToChainableMutators<
        TData extends object,
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
    >(chainableMutatorSet: ChainableMutatorSetBuilder<TData, TParamNoun, TMutators>) 
	{
		return chainableMutatorSet as ChainableMutators<TData, TParamNoun, TMutators>;
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
