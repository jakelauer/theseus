import deepEqual from "deep-equal";
import allSettled from "promise.allsettled";

import { EvolverComplex, EvolverComplexInstance } from "@Evolvers/EvolverComplex";
import { EvolverInstance, MutatorDefs } from "@Evolvers/Types";
import { RefineryInitializer } from "@Refineries/Refinery";
import { RefineryComplex, RefineryComplexInstance } from "@Refineries/RefineryComplex";
import { ForgeDefs } from "@Refineries/Types";
import { Immutable } from "@Shared/String/makeImmutable";
import { Mutable } from "@Shared/String/makeMutable";

import {
    Broadcaster,
    BroadcasterObserver,
    BroadcasterParams,
    DestroyCallback,
} from "./Broadcasters/Broadcaster";

allSettled.shim();

type BaseTheseusParams<
    TData,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> = {
    initialData: TData;
    broadcasterParams?: BroadcasterParams<TObserverType, TData>;
};

type TheseusParams<
    TData,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> = BaseTheseusParams<TData, TObserverType>;

export class Theseus<
    TData,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
> extends Broadcaster<TData, TObserverType> {
    #internalState: TData;

    public get state() {
        return this.#internalState;
    }

    /**
     * Creates a Theseus instance
     *
     * @param initialData The starting data (can be null)
     * @param params
     */
    constructor(params: BaseTheseusParams<TData, TObserverType>) {
        super(params.broadcasterParams);

        this.#internalState = params.initialData;
    }

    /**
     * Update the store with new data, and update subscribers.
     *
     * @param data
     */
    private async update(data: TData) {
        const newState = { ...this.#internalState, ...data };
        const equal = deepEqual(newState, this.#internalState);

        if (equal) {
            return false;
        }

        this.#internalState = { ...this.#internalState, ...data } as TData;

        await this.broadcast(this.#internalState);

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
}

const theseusBuilder = <TData, TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>>(
    params: TheseusParams<TData, TObserverType>,
) => {
    return extender(new Theseus<TData, TObserverType>(params));
};

const extender = <
    TInstance extends Theseus<TData, TObserverType>,
    TData,
    TObserverType extends BroadcasterObserver<TData>,
    TParamName extends string,
>(
    theseus: TInstance,
) => {
    /** Add evolvers to the Theseus instance */
    const evolveWith = <
        TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
        TEvolvers extends Record<string, EvolverInstance<string, Mutable<TParamName>, TData, TMutators>>,
    >(
        evolvers: TEvolvers | EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>,
    ) => {
        const evolverComplex =
            "mutate" in evolvers && "evolve" in evolvers ?
                (evolvers as EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>)
            :   EvolverComplex.create<TData>().withEvolvers(evolvers);

        const theseusWithEvolve = extendTheseusWith(theseus, {
            evolve: evolverComplex.evolve(theseus.state),
            mutate: evolverComplex.mutate(theseus.state),
        });

        return extendTheseusWith(theseusWithEvolve, { refineWith: refineExtender(theseusWithEvolve) });
    };

    const refineExtender =
        <TExtended extends TInstance>(instance: TExtended) =>
        <
            TForges extends ForgeDefs<TData, Immutable<TParamName>>,
            TRefineries extends Record<string, RefineryInitializer<TParamName, TData, TForges>>,
        >(
            refineries: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>,
        ) => {
            const refineryComplex =
                "refine" in refineries ?
                    (refineries as RefineryComplexInstance<TData, TParamName, TForges, TRefineries>)
                :   RefineryComplex.create<TData>().withRefineries(refineries);

            const theseusWithRefine = extendTheseusWith(instance, refineryComplex.refine(instance.state));

            return theseusWithRefine;
        };

    return extendTheseusWith(theseus, { evolveWith });
};

/** Extend Theseus with additional methods */
const extendTheseusWith = <TInstance, TExtension extends object>(
    theseus: TInstance,
    extension: TExtension,
) => {
    Object.defineProperties(theseus, extension as any);
    return theseus as TInstance & TExtension;
};

export default theseusBuilder;
