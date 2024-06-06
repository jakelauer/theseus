import deepExtend from "deep-extend";
import { v4 as uuidv4 } from "uuid";

import { getTheseusLogger } from "@Shared/index";

import { Broadcaster } from "./lib/Broadcast/Broadcaster";
import TheseusBuilder from "./TheseusBuilder";

import type { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";
import type { DestroyCallback } from "./lib/Broadcast/Broadcaster";
import type { BaseParams, ITheseus } from "@Types/Theseus";
import { cement, frost, sandbox } from "@theseus/sandbox";
const log = getTheseusLogger("Observation");

export class Theseus<
        TData extends object,
        TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
    >
	extends Broadcaster<TData, TObserverType>
	implements ITheseus<TData> 
{
	private internalState: TData;
	#uuid: string;

	public static instancesById: Record<string, Theseus<any, any>> = {};

	public get __uuid() 
	{
		return this.#uuid;
	}

	public get state() 
	{
		return this.internalState;
	}

	private setData = (data: TData) => 
	{
		this.internalState = sandbox(data, { mode: "copy" });
	};

	/**
     * Creates an Observation instance
     *
     * @param initialData The starting data (can be null)
     * @param params
     */
	constructor(data: TData, params?: BaseParams<TData, TObserverType>) 
	{
		super(params?.broadcasterParams);

		this.#uuid = uuidv4();
		this.setData(frost(data));
		Theseus.instancesById[this.#uuid] = this;
	}

	/**
     * Update the store with new data, and update subscribers.
     *
     * @param data
     */
	private async update(data: TData) 
	{
		deepExtend(this.internalState, data);
		const newState = cement(this.internalState);

		this.setData(newState);

		log.verbose(`Updated state for instance ${this.__uuid}`);
		await this.broadcast(this.internalState);
		log.verbose(`Broadcasted state for instance ${this.__uuid}`);

		return true;
	}

	/** Run a callback after all pending updates have completed */
	private nextTick(callback: () => void) 
	{
		const pendingUpdatePromises = Object.values(this.pendingUpdates);
		void Promise.allSettled(pendingUpdatePromises).finally(callback);
	}

	/**
     * Observe this data store. Call the returned callback to destroy.
     *
     * @param updateImmediately (default = true) If true, the callback will be called immediately on creation,
     *   with current data.
     * @param props The further input about the observer, if any
     * @param callback
     */
	public override observe(callback: (newData: TData) => void, updateImmediately = true): DestroyCallback 
	{
		const { destroy, observer } = this.saveObserver(callback);

		if (updateImmediately) 
		{
			// Update the callback once any pending updates are completed
			this.nextTick(() => 
			{
				observer.callback(this.internalState);
			});
		}

		return destroy;
	}

	public static getInstance(theseusId: string) 
	{
		return this.instancesById[theseusId];
	}

	public static async updateInstance(theseusId: string, data: any) 
	{
		log.verbose(`Updating instance ${theseusId}`);
		const instance = Theseus.getInstance(theseusId);
		return await instance.update(data);
	}
}
export type TheseusInstance = typeof Theseus;
export default TheseusBuilder;
