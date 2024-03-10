import deepExtend from 'deep-extend';
import allSettled from 'promise.allsettled';
import { v4 as uuidv4 } from 'uuid';

import { BroadcasterObserver } from '@Broadcast/BroadcasterObserver';
import extendObservation from '@Observe/ExtendObservation';
import { getTheseusLogger } from '@Shared/index';

import { Broadcaster, BroadcasterParams, DestroyCallback } from '../Broadcast/Broadcaster';

const log = getTheseusLogger("Observation");

allSettled.shim();

type BaseParams<
    TData extends object,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> = {
    initialData: TData;
    broadcasterParams?: BroadcasterParams<TData, TObserverType>;
};

export interface IObservation<TData> {
    __uuid: string;
    state: TData;
    observe: (callback: (newData: TData) => void, updateImmediately?: boolean) => DestroyCallback;
}

export type ObservationExtendable<
    TData extends object,
    TObservation extends IObservation<TData>,
    Extension,
> = TObservation & {
    [K in keyof Extension]: Extension[K];
};

export type ObservationParams<
    TData extends object,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> = BaseParams<TData, TObserverType>;

export class Observation<
    TData extends object,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> extends Broadcaster<TData, TObserverType> {
    #internalState: TData;
    #uuid: string;

    public static instancesById: Record<string, Observation<any, any>> = {};

    public get __uuid() {
        return this.#uuid;
    }

    public get state() {
        return this.#internalState;
    }

    private setData = (data: TData) => {
        this.#internalState = data;
    };

    /**
     * Creates an Observation instance
     *
     * @param initialData The starting data (can be null)
     * @param params
     */
    constructor(params: BaseParams<TData, TObserverType>) {
        super(params.broadcasterParams);

        this.#uuid = uuidv4();
        this.setData(params.initialData);
        Observation.instancesById[this.#uuid] = this;
    }

    /**
     * Update the store with new data, and update subscribers.
     *
     * @param data
     */
    private async update(data: TData) {
        const newState = deepExtend(this.#internalState, data);

        this.setData(newState);

        log.verbose(`Updated state for instance ${this.__uuid}`);
        await this.broadcast(this.#internalState);
        log.verbose(`Broadcasted state for instance ${this.__uuid}`);

        return true;
    }

    /** Run a callback after all pending updates have completed */
    private nextTick(callback: () => void) {
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
    public override observe(callback: (newData: TData) => void, updateImmediately = true): DestroyCallback {
        const { destroy, observer } = this.saveObserver(callback);

        if (updateImmediately) {
            // Update the callback once any pending updates are completed
            this.nextTick(() => {
                observer.callback(this.#internalState);
            });
        }

        return destroy;
    }

    public static getInstance(observationId: string) {
        return this.instancesById[observationId];
    }

    public static async updateInstance(observationId: string, data: any) {
        log.verbose(`Updating instance ${observationId}`);
        const instance = Observation.getInstance(observationId);
        return await instance.update(data);
    }
}

/** Create a new Observation instance */
const builder = <
    TData extends object,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
>(
    params: ObservationParams<TData, TObserverType>,
) => {
    const observation: IObservation<TData> = new Observation<TData, TObserverType>(params);
    const extendable = extendObservation(observation);

    return extendable;
};

export default builder;
