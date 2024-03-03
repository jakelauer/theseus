import { v4 as uuidv4 } from "uuid";

export type DestroyCallback = () => void;

export interface CustomObserverClass<ConstructorType, TDataType> {
    new (callback: (newData: TDataType) => void): ConstructorType;
}

export class BroadcasterObserver<TDataType> {
    public readonly callback: (newData: TDataType) => void;

    constructor(callback: (newData: TDataType) => void) {
        this.callback = callback;
    }

    public update(newData: TDataType) {
        return new Promise<void>((resolve) =>
            requestAnimationFrame(() => {
                this.callback(newData);
                resolve();
            }),
        );
    }
}

export interface BroadcasterParams<TObserverType, TDataType> {
    observerClassConstructor?: CustomObserverClass<TObserverType, TDataType> | null;
}

export class Broadcaster<
    TData,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> {
    protected readonly params: BroadcasterParams<TObserverType, TData>;
    protected readonly observers: { [key: string]: TObserverType } = {};

    protected pendingUpdates: Record<string, Promise<any>> = {};

    /**
     * Creates a Broadcaster
     *
     * @param params
     */
    constructor(params?: BroadcasterParams<TObserverType, TData>) {
        this.params = {
            observerClassConstructor: null,
            ...(params ?? {}),
        };
    }

    protected get allObservers(): TObserverType[] {
        return Object.values(this.observers);
    }

    public async broadcast(data: TData) {
        const broadcastTo = this.getObserversToUpdate(data);

        // Assign a guid to this broadcast
        const updateGuid = uuidv4();

        if (broadcastTo.length === 0) {
            return Promise.resolve();
        }

        // Store the broadcast in pending updates, and delete it when it's complete
        this.pendingUpdates[updateGuid] = Promise.allSettled(
            broadcastTo.map((observer) => observer.update(data)),
        ).then(() => delete this.pendingUpdates[updateGuid]);

        // Return the pending update Promise
        return this.pendingUpdates[updateGuid];
    }

    protected buildObserver(callback: (newData: TData) => void) {
        const { observerClassConstructor } = this.params;

        const observer: TObserverType =
            observerClassConstructor ?
                new observerClassConstructor(callback)
            :   (new BroadcasterObserver(callback) as TObserverType);

        return observer;
    }

    protected saveObserver(callback: (newData: TData) => void): {
        destroy: DestroyCallback;
        observer: TObserverType;
    } {
        const observer = this.buildObserver(callback);

        const guid = Broadcaster.guid();

        this.observers[guid] = observer;

        return {
            destroy: () => delete this.observers[guid],
            observer: observer,
        };
    }

    /**
     * Observe this broadcaster. Call the returned callback to destroy.
     *
     * @param props The further input about the observer, if any
     * @param callback
     */
    public observe(callback: (newData: TData) => void): DestroyCallback {
        const { destroy } = this.saveObserver(callback);

        return destroy;
    }

    protected static guid() {
        return (new Date().getTime() * Math.random()).toString(36);
    }

    /**
     * Returns a list of observers, optional update parameter can be use to filter the observer list
     *
     * @param data
     * @protected
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Allow for override with access to data
    protected getObserversToUpdate(data: TData) {
        return this.allObservers;
    }

    public static destroyAll(...destroyCallbacks: DestroyCallback[]) {
        destroyCallbacks.forEach((u) => u());
    }
}
