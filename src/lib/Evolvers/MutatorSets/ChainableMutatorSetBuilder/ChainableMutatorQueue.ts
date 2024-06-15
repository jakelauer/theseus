import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import type { Mutator, GenericMutator } from "@Evolvers/Types/MutatorTypes";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";

const log = getTheseusLogger("Queue");

interface Params<TData extends object, TParamNoun extends string> 
{
	paramNoun: TParamNoun;
	setData: (data: TData) => void;
	getData: () => TData;
}

export interface MutatorQueue<
	TData extends object,
	TParamNoun extends string>{
	asyncEncountered: () => boolean;
	queue: Promise<any>;
	queueMutation<TFuncReturn extends SortaPromise<TData>>(
		mutatorPath: string,
		func: Mutator<TData, TParamNoun, TFuncReturn>,
		args: any[]
	): SortaPromise<TData>;
	reset: () => void;
}

export class ChainableMutatorQueue<
	TData extends object,
	TParamNoun extends string
> 
{
	private _isAsyncEncountered = false;
	private _queue: SortaPromise<any> = Promise.resolve();

	private constructor(private params: Params<TData, TParamNoun>) {}

	public get asyncEncountered() 
	{
		return this._isAsyncEncountered;
	}

	public get queue() 
	{
		return this._queue;
	}

	public reset() 
	{
		this._queue = Promise.resolve();
		this._isAsyncEncountered = false;
	}

	private assertObjectResult(selfPath: string, result: TData) 
	{
		if (typeof result !== "object") 
		{
			throw new Error(
				`Expected mutator ${selfPath} to return an object, but got type "${typeof result}" from value ${JSON.stringify(
					result,
				)}.`,
			);
		}
	}

	private async buildAsyncOperation(
		selfPath: string,
		mutatorResult: Promise<TData>,
	) 
	{
		// Async operation encountered, switch to queuing mode
		this._isAsyncEncountered = true;
		log.trace(
			`mutatorResult for ${selfPath} is a Promise. Set isAsyncEncountered to true.`,
		);
		return mutatorResult.then((result) => 
		{
			this.assertObjectResult(selfPath, result);
			log.verbose(`{ASYNC} ${selfPath}`, result);
			return result;
		});
	}

	private buildSyncOperation(selfPath: string, mutatorResult: TData) 
	{
		this.assertObjectResult(selfPath, mutatorResult);
		log.verbose(`{SYNC} ${selfPath} = `, mutatorResult);
		return mutatorResult;
	}

	private buildQueueOperation(
		selfPath: string,
		mutator: GenericMutator<TData, SortaPromise<TData>>,
		...args: any[]
	) 
	{
		return () => 
		{
			log.verbose(`Executing queue operation ${selfPath}`, { args });

			const mutatorResult = mutator(...args);
			log.verbose(`Executed queue operation ${selfPath}`, { args });

			if (mutatorResult === undefined || mutatorResult === null) 
			{
				throw new Error(
					`Mutator ${selfPath} returned ${mutatorResult}. Mutators must return a value compatible with the data type.`,
				);
			}

			log.verbose(
				`Queued operation ${selfPath} is async: ${
					mutatorResult instanceof Promise
				}`,
			);

			return mutatorResult instanceof Promise
				? this.buildAsyncOperation(selfPath, mutatorResult)
				: this.buildSyncOperation(selfPath, mutatorResult);
		};
	}

	public queueMutation<TFuncReturn extends Promise<TData>>(
		mutatorPath: string,
		func: Mutator<TData, TParamNoun, TFuncReturn>,
		args: any[]
	): Promise<TData>;
	public queueMutation<TFuncReturn extends TData>(
		mutatorPath: string,
		func: Mutator<TData, TParamNoun, TFuncReturn>,
		args: any[]
	): TData;
	public queueMutation<TFuncReturn extends SortaPromise<TData>>(
		mutatorPath: string,
		func: Mutator<TData, TParamNoun, TFuncReturn>,
		args: any[],
	): TFuncReturn 
	{
		log.verbose(`Request to queue ${mutatorPath}(${args}) received.`);

		const operation = this.buildQueueOperation(mutatorPath, func, ...args);

		log.verbose(`Built operation for ${mutatorPath}`);
	
		// Delegate to a specialized method based on whether async operations have been encountered before.
		const queueOutput = this._isAsyncEncountered
			? this.queueAfterAsyncEncountered(operation, mutatorPath)
			: this.queueBeforeAsyncEncountered(operation, mutatorPath);
				
		return queueOutput as TFuncReturn;
	}
	
	private queueAfterAsyncEncountered(operation: () => SortaPromise<TData>, mutatorPath: string): Promise<TData> 
	{
		log.verbose(`Queueing operation ${mutatorPath} after pre-existing async operation`);
		this._queue = this._queue.then(() => 
		{
			log.verbose(`Executing queued operation ${mutatorPath} after pre-existing async operation`);
			const result = operation();
			return this.setDataWithResult(result);
		});
		return this._queue;
	}
	
	private queueBeforeAsyncEncountered(
		operation: () => SortaPromise<TData>, 
		mutatorPath: string): SortaPromise<TData> 
	{
		log.verbose(`Queueing operation ${mutatorPath}`);
		const result = operation();
		if (result instanceof Promise) 
		{
			log.verbose(`Queueing operation ${mutatorPath} as a Promise. All subsequent operations will be queued.`);
			this._queue = this.setDataWithResult(result);
			return this._queue;
		}
		else 
		{
			return this.setDataWithResult(result);
		}
	}

	private setDataWithResult(
		result: TData | Promise<TData>,
	): SortaPromise<TData> 
	{
		let outcome: SortaPromise<TData>;
		if (result instanceof Promise) 
		{
			log.verbose("Async operation detected, waiting for resolution before setting...");
			outcome = result.then((resolvedResult) =>
			{
				log.verbose("Async operation resolved, setting data to result of operation");

				this.params.setData(resolvedResult);
				return resolvedResult;
			});
		}
		else 
		{
			log.verbose("Setting data to result of operation");
			outcome = result;
			this.params.setData(outcome);
		}

		return outcome;
	}

	public static create<TData extends object, TParamNoun extends string>(
		params: Params<TData, TParamNoun>,
	)
	{
		return new ChainableMutatorQueue(params);
	}
}
