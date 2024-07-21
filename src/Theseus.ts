import { v4 as uuidv4 } from "uuid";

import { getTheseusLogger } from "theseus-logger";

import { Broadcaster } from "./lib/Broadcast/Broadcaster.js";
import TheseusBuilder from "./TheseusBuilder.js";

import type { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";
import type { DestroyCallback } from "./lib/Broadcast/Broadcaster.js";
import type { BaseParams, ITheseus } from "@Types/Theseus";
import {
	cement, frost, sandbox, 
} from "theseus-sandbox";

const log = getTheseusLogger("Observation");

export class Theseus<
        TData extends object,
        TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
    >
	extends Broadcaster<TData, TObserverType>
	implements ITheseus<TData>
{
	private internalState: TData;
	#id: string;

	public static instancesById: Record<string, Theseus<any, any>> = {};
	public static stackDepthsById: Record<string, number> = {};

	/**
     * Creates an Observation instance
     *
     * @param initialData The starting data (can be null)
     * @param params
     */
	private constructor(data: TData, params?: BaseParams<TData, TObserverType>) 
	{
		super(params?.broadcasterParams);

		this.#id = uuidv4();
		this.setData(data);
		Theseus.instancesById[this.#id] = this;
	}

	public static __private_create<
        TData extends object,
        TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
    >(data: TData, params?: BaseParams<TData, TObserverType>) 
	{
		return new Theseus(data, params);
	}

	public get __uuid() 
	{
		return this.#id;
	}

	public get state() 
	{
		return this.internalState;
	}

	private setData = (data: TData) => 
	{
		this.internalState = sandbox(frost(data), {
			mode: "copy",
		});
	};

	/**
     * Update the store with new data, and update subscribers.
     *
     * @param data
     */
	private async update(data: TData) 
	{
		Object.assign(this.internalState, data);
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

	public static incrementStackDepth(theseusId: string | undefined) 
	{
		if (theseusId) 
		{
			if (!Theseus.stackDepthsById[theseusId]) 
			{
				Theseus.stackDepthsById[theseusId] = 0;
			}
			Theseus.stackDepthsById[theseusId]++;
		}
		else 
		{
			log.verbose("No theseusId provided. Skipping stack depth increment.");
		}
	}

	public static decrementStackDepth(theseusId: string | undefined) 
	{
		if (theseusId) 
		{
			const oldDepth = Theseus.stackDepthsById[theseusId] ?? 0;
			const newDepth = Math.max(oldDepth - 1, 0);

			Theseus.stackDepthsById[theseusId] = newDepth;
		}
		else 
		{
			log.verbose("No theseusId provided. Skipping stack depth decrement.");
		}
	}

	/**
     * Observe this data store. Call the returned callback to destroy.
     *
     * @param updateImmediately (default = true) If true, the callback will be called immediately on creation,
     *   with current data.
     * @param props The further input about the observer, if any
     * @param callback
     */
	public override observe(callback: (newData: TData) => void, updateImmediately = false): DestroyCallback 
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
		const stackDepth = Theseus.stackDepthsById[theseusId] ?? 0;
		if (stackDepth === 0) 
		{
			const instance = Theseus.getInstance(theseusId);
			return await instance.update(data);
		}
		else 
		{
			log.verbose(
				`Instance ${theseusId} is currently being updated. Skipping. Current stack depth: ${this.stackDepthsById[theseusId]}`,
			);
		}
	}
}

export type TheseusInstance = typeof Theseus;
export default TheseusBuilder;
