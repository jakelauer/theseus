import deepEqual from "deep-equal";
import allSettled from "promise.allsettled";

import {
    Broadcaster,
    BroadcasterObserver,
    BroadcasterParams,
    DestroyCallback,
} from "./Observable/Broadcaster";

import type {
    AsyncTheseusActions,
    AsyncReturn,
    TheseusActions,
    ITheseus as ITheseus,
} from "./Types/Observable";

// Bug 1031244 // Add shim for Promise.allSettled for browsers that lack support
allSettled.shim();

export abstract class Theseus<
        TDataType extends Record<string, any>,
        TObserverProps = any,
        TObserverType extends BroadcasterObserver<TDataType, TObserverProps> = BroadcasterObserver<
            TDataType,
            TObserverProps
        >,
    >
    extends Broadcaster<TDataType, TObserverProps, TObserverType>
    implements ITheseus<TDataType, TObserverProps, any>
{
    private _internalState: TDataType;

    public get state() {
        return this._internalState;
    }

    /**
     * Creates a Theseus instance
     *
     * @param initialData The starting data (can be null)
     * @param params
     */
    constructor(
        initialData: TDataType,
        params?: BroadcasterParams<TObserverType, TDataType, TObserverProps>,
    ) {
        super(params);

        this._internalState = initialData;
    }

    /**
     * Update the store with new data, and update subscribers.
     *
     * @param data
     */
    private async update(data: Partial<TDataType>) {
        const newState = { ...this._internalState, ...data };
        const equal = deepEqual(newState, this._internalState);

        if (equal) {
            return false;
        }

        this._internalState = { ...this._internalState, ...data } as TDataType;

        await this.broadcast(this._internalState);

        return true;
    }

    /**
     * Run a callback after all pending updates have completed
     *
     * @private
     * @param {() => void} callback
     */
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
    public override observe(
        callback: (newData: TDataType) => void,
        props?: TObserverProps,
        updateImmediately = true,
    ): DestroyCallback {
        const { destroy, observer } = this.saveObserver(callback, props);

        if (updateImmediately) {
            // Update the callback once any pending updates are completed
            this.nextTick(() => {
                observer.callback(this._internalState);
            });
        }

        return destroy;
    }
}

/** Returns the `build()` method that will create a new Theseus instance */
export function theseusShip<
    TDataType extends Record<string, any>,
    TObserverProps = any,
    TObserverType extends BroadcasterObserver<TDataType, TObserverProps> = BroadcasterObserver<
        TDataType,
        TObserverProps
    >,
>() {
    /**
     * Creates a new Theseus instance
     *
     * @param {{
     *     actions: T;
     *     initialState: TDataType;
     *     subscriptionConstructor?:
     *         | CustomObserverClass<TObserverType, TDataType, TObserverProps>
     *         | undefined;
     *     propsRequired?: boolean;
     * }} buildParams
     * @returns {ITheseus<TDataType, TObserverProps>}
     */
    const build = <T extends TheseusActions<TDataType>>(buildParams: {
        actions: T;
        initialState: TDataType;
        params?: BroadcasterParams<TObserverType, TDataType, TObserverProps>;
    }): ITheseus<TDataType, TObserverProps, T> => {
        return new (class extends Theseus<TDataType, TObserverProps, TObserverType> {
            public override actions = this.createActions(buildParams.actions);
        })(buildParams.initialState, buildParams.params) as ITheseus<TDataType, TObserverProps, T>;
    };

    return {
        build,
    };
}
