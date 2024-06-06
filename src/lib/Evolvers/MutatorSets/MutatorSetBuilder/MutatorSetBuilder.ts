import type { FinalMutators } from "@Evolvers/Types/ChainableTypes";
import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import { Theseus } from "@/Theseus";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";


import type { GenericMutator, MutatorDefs } from "../../Types/MutatorTypes";
import { cement, sandbox } from "@theseus/sandbox";
/**
 * Represents a set of mutators that can be applied to an evolver's data. It provides the infrastructure for
 * adding mutator functions to the evolver and executing these functions to mutate the evolver's state.
 *
 * @template TData The type of data the evolver operates on.
 * @template TParamNoun The type representing the names of the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */

const log = getTheseusLogger("MutatorSetBuilder");

export class MutatorSetBuilder<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefs<TData, TParamNoun>,
> 
{
	protected __theseusId?: string;
	protected data: Record<TParamNoun, TData>;
	public mutatorsForProxy: TMutators = {} as TMutators;

	constructor(
		inputData: TData,
        protected readonly paramNoun: TParamNoun,
        protected readonly mutators: TMutators,
        observationId?: string,
	) 
	{
		this.data = this.inputToObject(inputData);
		this.extendSelfWithMutators(mutators);
		this.__theseusId = observationId;
	}

	public __setTheseusId(id: string) 
	{
		this.__theseusId = id;
	}

	public replaceData(data: TData) 
	{
		this.data = this.inputToObject(data);
	}

	protected getSelfExtensionPoint(): any 
	{
		return this;
	}

	/**
     * Extends the instance with mutator functions defined in the mutators parameter. It recursively traverses
     * the mutators object, adding each function to the instance, allowing for nested mutator structures.
     */
	private extendSelfWithMutators(mutators: TMutators, path: string[] = []) 
	{
		Object.keys(mutators).forEach((mutatorKey) => 
		{
			const item = mutators[mutatorKey];
			const newPath = [...path, mutatorKey];

			if (typeof item === "function") 
			{
				const lastKey = newPath.pop() as string;
				const context = newPath.reduce((obj, key) => 
				{
					if (!obj[key]) obj[key] = {};
					return obj[key];
				}, this.getSelfExtensionPoint() as any);

				this.addFunctionToSelf(context, lastKey, item);
			}
			else if (typeof item === "object" && item !== null) 
			{
				this.extendSelfWithMutators(item as TMutators, newPath);
			}
		});
	}

	/**
     * Utility method to determine if a given value is a Promise.
     *
     * @param value The value to check.
     * @returns True if the value is a Promise, false otherwise.
     */
	protected isPromise(path: string, value: any): value is Promise<any> 
	{
		const result = Boolean(value && typeof value.then === "function");

		if (result) log.verbose(`Function "${path}" returns a Promise`);

		return result;
	}

	/**
     * Adds a function to the instance at the specified path. This method is used internally by
     * extendSelfWithMutators to attach mutator functions to the instance.
     */
	protected addFunctionToSelf(
		context: any,
		selfPath: string,
		mutator: GenericMutator<TData, SortaPromise<TData>>,
	) 
	{
		Object.assign(context, {
			[selfPath]: (...args: any[]) => 
			{
				const draft = sandbox(this.data);
				
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

				log.debug(`Result of mutator "${selfPath}"`, funcResult);

				if (funcResult === undefined) 
				{
					log.error(`Function "${selfPath}" returned undefined. This is likely an error.`);
				}

				return this.extractDataFromDraftResult(funcResult);
			},
		});
	}

	protected extractDataFromDraftResult(funcResult: SortaPromise<TData>)
	{
		const generateOutcome = (data: TData) => 
		{
			const finishedDraft = cement(data) as Record<TParamNoun, TData>;
			if (this.__theseusId && finishedDraft) 
			{
				void Theseus.updateInstance(this.__theseusId, finishedDraft);
			}
			return finishedDraft;
		};

		return funcResult instanceof Promise 
			? funcResult.then((result: TData) => 
			{
				return generateOutcome(result);
			}) 
			: generateOutcome(funcResult);
	};

	/**
     * Transforms the input data into the structured format expected by the mutators, keyed by the parameter
     * name.
     */
	protected inputToObject<_TData, _TParamNoun extends string>(
		input: _TData,
	): { [key in _TParamNoun]: _TData } 
	{
		return { [this.paramNoun]: input } as {
            [key in _TParamNoun]: _TData;
        };
	}

	/**
     * Factory method to create a new instance of MutatorSet with the provided initial data, argument name,
     * and mutators. This method facilitates the easy setup of a MutatorSet with a specific set of mutators.
     *
     * @param data The initial state data to use.
     * @param paramNoun The name of the argument representing the state.
     * @param mutators The definitions of mutators to apply to the state.
     * @returns A new instance of MutatorSet configured with the provided parameters.
     */
	public static create<
        TData extends object,
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
    >(data: TData, paramNoun: TParamNoun, mutators: TMutators, observationId?: string) 
	{
		const builder = new MutatorSetBuilder(data, paramNoun, mutators, observationId);

		return this.castToMutators(builder);
	}

	/**
     * Casts the provided ChainableMutatorBuilder instance to a ChainableMutators instance. This is a
     * workaround to avoid TypeScript's inability to infer the correct type of the returned object.
     */
	public static castToMutators<
        TData extends object,
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
    >(
		chainableMutatorSet: MutatorSetBuilder<TData, TParamNoun, TMutators>,
	): FinalMutators<TData, TParamNoun, TMutators> 
	{
		return chainableMutatorSet as unknown as FinalMutators<TData, TParamNoun, TMutators>;
	}
}
