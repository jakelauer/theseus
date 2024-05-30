import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import type { ParamNameData, Mutator } from "@Evolvers/Types/MutatorTypes";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";
import { createDraft, finishDraft, type Draft } from "immer";

const log = getTheseusLogger("Queue");

interface Params<TData extends object, TParamName extends string> 
{
	argName: TParamName;
	setData: (data: ParamNameData<TData, TParamName>) => void;
	getData: () => ParamNameData<TData, TParamName>;
}

export interface MutatorQueue<
	TData extends object,
	TParamName extends string>{
	asyncEncountered: () => boolean;
	queue: Promise<any>;
	queueMutation<TFuncReturn extends SortaPromise<TData>>(
		mutatorPath: string,
		func: Mutator<TData, TParamName, TFuncReturn>,
		args: any[]
	): SortaPromise<TData>;
	reset: () => void;
}

export class ChainableMutatorQueue<
	TData extends object,
	TParamName extends string
> 
{
	private _isAsyncEncountered = false;
	private _queue: SortaPromise<any> = Promise.resolve();
	#draft: Draft<ParamNameData<TData, TParamName>>;

	private constructor(private params: Params<TData, TParamName>) {}

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
		mutator: Mutator<TData, TParamName, SortaPromise<TData>>,
		args: any[],
	) 
	{
		return () => 
		{
			log.verbose(`Executing queue operation ${selfPath}`, { args });
			const data = this.params.getData();

			log.verbose(`Creating draft for ${selfPath}`, data);
			
			this.#draft = createDraft(data);
			log.verbose(`Draft created for ${selfPath}`, this.#draft);

			const mutatorResult = mutator(this.#draft as ParamNameData<TData, TParamName>, ...args);
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

	private inputToObject(input: TData): { [key in TParamName]: TData } 
	{
		return { [this.params.argName]: input } as {
			[key in TParamName]: TData;
		};
	}

	public queueMutation<TFuncReturn extends Promise<TData>>(
		mutatorPath: string,
		func: Mutator<TData, TParamName, TFuncReturn>,
		args: any[]
	): Promise<TData>;
	public queueMutation<TFuncReturn extends TData>(
		mutatorPath: string,
		func: Mutator<TData, TParamName, TFuncReturn>,
		args: any[]
	): TData;
	public queueMutation<TFuncReturn extends SortaPromise<TData>>(
		mutatorPath: string,
		func: Mutator<TData, TParamName, TFuncReturn>,
		args: any[],
	): TFuncReturn 
	{
		log.verbose(`Request to queue ${mutatorPath}(${args}) received.`);

		const operation = this.buildQueueOperation(mutatorPath, func, args);

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
		const finalizeAndReturnData = (result: TData) => 
		{
			const finishedDraft = this.extractDataFromDraftResult(this.#draft, result);
			this.params.setData(finishedDraft as ParamNameData<TData, TParamName>);
			return this.params.getData()[this.params.argName];
		};

		let outcome: SortaPromise<TData>;
		if (result instanceof Promise) 
		{
			log.verbose("Async operation detected, waiting for resolution before setting...");
			outcome = result.then((resolvedResult) =>
			{
				log.verbose("Async operation resolved, setting data to result of operation", resolvedResult);

				return finalizeAndReturnData(resolvedResult);
			});
		}
		else 
		{
			log.verbose("Setting data to result of operation", result);
			outcome = finalizeAndReturnData(result);
		}

		return outcome;
	}

	protected extractDataFromDraftResult(draft: Draft<ParamNameData<TData, TParamName>>, funcResult: SortaPromise<TData>)
	{
		const generateOutcome = (d: Draft<ParamNameData<TData, TParamName>>) => (finishDraft(d) as ParamNameData<TData, TParamName>);

		return funcResult instanceof Promise 
			? funcResult.then((r: TData) => 
			{
				(draft as ParamNameData<TData, TParamName>)[this.params.argName] = r;
				return generateOutcome(draft);
			}) 
			: generateOutcome(draft);
	};

	public static create<TData extends object, TParamName extends string>(
		params: Params<TData, TParamName>,
	)
	{
		return new ChainableMutatorQueue(params);
	}
}
