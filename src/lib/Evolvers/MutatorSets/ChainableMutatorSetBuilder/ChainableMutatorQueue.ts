import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import type { Mutator, GenericMutator } from "@Evolvers/Types/MutatorTypes";
import { getTheseusLogger } from "theseus-logger";

const log = getTheseusLogger("Queue");

interface Params<TData extends object, TParamNoun extends string> 
{
	paramNoun: TParamNoun;
	__theseusId?: string;
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

	private constructor(private params: Params<TData, TParamNoun>) 
	{
	}

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
		log.verbose(
			`[🐢 ${selfPath}] Queued operation ${selfPath} is async. Further queued operations will run asynchronously.`,
		);

		// Async operation encountered, switch to queuing mode
		this._isAsyncEncountered = true;

		return mutatorResult.then((result) => 
		{
			this.assertObjectResult(selfPath, result);
			log.verbose(`{ASYNC} ${selfPath}`);
			return result;
		});
	}

	private buildSyncOperation(selfPath: string, mutatorResult: TData) 
	{
		log.verbose(
			`[🐇 ${selfPath}] Queued operation ${selfPath} is synchronous.`,
		);

		this.assertObjectResult(selfPath, mutatorResult);
		log.verbose(`{SYNC} ${selfPath} = `);
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
			log.debug(`[${selfPath}] Operation execution starting`, {
				args, 
			});

			const mutatorResult = mutator(...args);
			log.debug(`[${selfPath}] Operation finished executing`, {
				args, 
			});

			if (mutatorResult === undefined || mutatorResult === null) 
			{
				throw new Error(
					`Mutator ${selfPath} returned ${mutatorResult}. Mutators must return a value compatible with the data type.`,
				);
			}

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
		log.debug(`Request to queue ${mutatorPath}(${args}) received.`);

		const operation = this.buildQueueOperation(mutatorPath, func, ...args);

		log.verbose(`Built operation for ${mutatorPath}`);
	
		// Delegate to a specialized method based on whether async operations have been encountered before.
		const queueOutput = this._isAsyncEncountered
			? this.addToAsyncQueue(operation, mutatorPath)
			: this.addToSynchronousQueue(operation, mutatorPath);

		return queueOutput as TFuncReturn;
	}
	
	private addToAsyncQueue(operation: () => SortaPromise<TData>, mutatorPath: string): Promise<TData> 
	{
		log.debug(`🐢 [${mutatorPath}] Queueing operation after prior queue promises resolve`);
		this._queue = this._queue.then(() => 
		{
			log.debug(`🐢 [${mutatorPath}] Executing queued async operation`);
			const result = operation();
			return this.setDataWithResult(result);
		});
		return this._queue;
	}
	
	private addToSynchronousQueue(
		operation: () => SortaPromise<TData>, 
		mutatorPath: string): SortaPromise<TData> 
	{
		log.debug(`🐇 [${mutatorPath}] Operation will be executed immediately`);
		const result = operation();
		if (result instanceof Promise) 
		{
			log.debug(`🐇➡️🐢 [${mutatorPath}] Operation returned a promise, so we will create an async queue.`);
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
		return result instanceof Promise 
			? this.setDataWithResultAsync(result)
			: this.setDataWithResultSync(result);
	}

	private setDataWithResultSync(result: TData): TData
	{
		log.verbose("Setting data to result of operation");
		this.params.setData(result);

		return result;
	}

	private async setDataWithResultAsync(result: Promise<TData>): Promise<TData> 
	{
		return result.then((resolvedResult) =>
		{
			log.verbose("Async operation resolved, setting data to result of operation");

			this.params.setData(resolvedResult);
			return resolvedResult;
		});
	}

	public static create<TData extends object, TParamNoun extends string>(
		params: Params<TData, TParamNoun>,
	)
	{
		return new ChainableMutatorQueue(params);
	}
}
