import { ChainableMutatorQueue } from "@Evolvers/MutatorSets/ChainableMutatorSetBuilder/ChainableMutatorQueue";
import { getTheseusLogger } from "theseus-logger";

import { MutatorSetBuilder } from "../MutatorSetBuilder/MutatorSetBuilder.js";

import type { Chainable, ChainableMutators } from "@Evolvers/Types/ChainableTypes";
import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";

import type { MutatorDefs } from "../../Types/MutatorTypes.js";
import { createChainingProxy } from "./proxy/chaining-proxy-manager.js";
import {
	cement, frost, getSandboxChanges, isFrost, 
} from "theseus-sandbox";
import { containsSandbox } from "theseus-sandbox";
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
	private mutatorQueue: ChainableMutatorQueue<TData, TParamNoun>;

	// Created by createChainingProxy; always matches the type of the current instance
	private chainingProxy: typeof this;

	constructor(inputData: TData, paramNoun: TParamNoun, mutators: TMutators, theseusId?: string) 
	{
		super(inputData, paramNoun, mutators, theseusId);

		this.mutatorQueue = ChainableMutatorQueue.create({
			paramNoun,
			getData: this.getData.bind(this),
			setData: this.setData.bind(this),
			__theseusId: theseusId,
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

	public override reset(data: TData): void 
	{
		super.reset(data);
		this.mutatorQueue.reset();
	}

	/**
     * Get the changes that have been made to the store since the last time this method was called.
     */
	public getChanges(): Partial<TData> 
	{
		log.verbose("Getting changes for instance");
		return getSandboxChanges(this.data[this.paramNoun]);
	}

	private get resultBase(): TData 
	{
		return this.data[this.paramNoun];
	}

	public override setData(data: TData): void 
	{
		if (data instanceof Promise) 
		{
			throw new Error("Cannot set data to a Promise.");
		}

		this._data = this.augmentData(data);
	}

	public end() 
	{
		if (this.resultBase instanceof Promise) 
		{
			throw new Error(
				"Cannot call end() on a chain that has encountered an async operation. Use endAsync() instead.",
			);
		}

		let result = this.resultBase;
		if (containsSandbox(result)) 
		{
			result = cement(result);
		}

		if (!isFrost(result)) 
		{
			result = frost(result);
		}

		this.setData(result as TData);
		this.cementData();

		return result as TData;
	}

	// eslint-disable-next-line theseus/break-on-chainable
	public async endAsync(): Promise<TData> 
	{
		await (this.resultBase as Promise<TData>);
		return this.end();
	}

	protected override getSelfExtensionPoint() 
	{
		return this.mutatorsForProxy;
	}

	protected override extractDataFromDraftResult(funcResult: SortaPromise<TData>) 
	{
		return funcResult;
	}

	/**
     * Factory method to create an instance of ChainableMutatorSet with specified initial data, argument name,
     * and mutator definitions. Facilitates the creation of chainable mutators.
     *
     * @param data Initial state data.
     * @param paramNoun Name of the argument representing the data.
     * @param mutators Definitions of mutators to apply to the state.
     * @returns An instance of ChainableMutatorSet configured with the provided parameters.
     */
	public static createChainable<
        TData extends object,
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
    >(data: TData, paramNoun: TParamNoun, mutators: TMutators, theseusId?: string) 
	{
		const chain = new ChainableMutatorSetBuilder(data, paramNoun, mutators, theseusId);
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
