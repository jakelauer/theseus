import { buildChainableMutatorQueue } from "@Evolvers/MutatorSets/ChainableMutatorSetBuilder/operations/buildChainableMutatorQueue";
import { createChainingProxy } from "@Evolvers/MutatorSets/ChainableMutatorSetBuilder/operations/createChainingProxy";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";

import { MutatorSetBuilder } from "../MutatorSetBuilder/MutatorSetBuilder";

import type { Chainable, ChainableMutators, FinalMutators } from "@Evolvers/Types/ChainableTypes";
import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import type { Mutable } from "@Shared/String/makeMutable";

import type { GenericMutator, MutableData, MutatorDefs } from "../../Types/MutatorTypes";
import type { TTargetChained } from "./operations/createChainingProxy";
/**
 * Extends MutatorSet to provide chainable mutation operations on evolver data. This class allows mutations to
 * be chained together in a fluent manner, enhancing the clarity and expressiveness of state evolution logic.
 *
 * @template TData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */

type QueueMutation = ReturnType<typeof buildChainableMutatorQueue>;

const mutatorLog = getTheseusLogger("Mutator");

export class ChainableMutatorSetBuilder<
        TData extends object,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TData, TParamName>,
    >
    extends MutatorSetBuilder<TData, TParamName, TMutators>
    implements Chainable<TData>
{
    private calls = 0;

    private queueMutation: QueueMutation;

    // Created by createChainingProxy; always matches the type of the current instance
    private chainingProxy: TTargetChained<typeof this>;

    constructor(inputData: TData, argName: TParamName, mutators: TMutators) {
        super(inputData, argName, mutators);

        this.queueMutation = buildChainableMutatorQueue({
            argName,
            getMutableData: this.getMutableData.bind(this),
            setMutableData: this.setMutableData.bind(this),
        });

        this.chainingProxy = createChainingProxy({
            target: this,
            observationId: this.__theseusId as string,
            queueMutation: this.queueMutation.bind(this),
        });
    }

    private getMutableData() {
        return this.mutableData;
    }

    private setMutableData(data: MutableData<TData, TParamName>) {
        this.mutableData = data;
    }

    public get finalForm() {
        return this.mutableData[this.argName];
    }

    public get finalFormAsync() {
        return this.queueMutation("finalForm", () => this.finalForm, []) as Promise<TData>;
    }

    /**
     * Overrides addFunctionToSelf to support chainable operations. If the operation is asynchronous (returns
     * a Promise), it returns the Promise directly. Otherwise, it enhances the returned object with a
     * chainable interface.
     *
     * @param context The object context to which the mutator function is added.
     * @param selfPath The path (name) under which the mutator function is stored in the context.
     * @param mutator The mutator function to be executed.
     */
    protected override addFunctionToSelf(
        context: any,
        selfPath: string,
        mutator: GenericMutator<TData, SortaPromise<TData>>,
    ) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => {
                this.calls++;
                mutatorLog.verbose(`Called "${selfPath}"`);

                return mutator(...args);
            },
        });
    }

    /**
     * Factory method to create an instance of ChainableMutatorSet with specified initial data, argument name,
     * and mutator definitions. Facilitates the creation of chainable mutators.
     *
     * @param data Initial state data.
     * @param argName Name of the argument representing the mutable part of the state.
     * @param mutators Definitions of mutators to apply to the state.
     * @returns An instance of ChainableMutatorSet configured with the provided parameters.
     */
    public static createChainable<
        TData extends object,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(
        data: TData,
        argName: TParamName,
        mutators: TMutators,
    ): ChainableMutators<TData, TParamName, TMutators> {
        const chain = new ChainableMutatorSetBuilder(data, argName, mutators);
        const proxy = chain.chainingProxy;
        return this.castToChainableMutators(proxy);
    }

    /**
     * Casts the provided ChainableMutatorBuilder instance to a ChainableMutators instance. This is a
     * workaround to avoid TypeScript's inability to infer the correct type of the returned object.
     */
    private static castToChainableMutators<
        TData extends object,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(chainableMutatorSet: TTargetChained<ChainableMutatorSetBuilder<TData, TParamName, TMutators>>) {
        return chainableMutatorSet as ChainableMutators<TData, TParamName, TMutators>;
    }

    /**
     * Overrides the create method to indicate that ChainableMutatorSet is specifically designed for chainable
     * operations, and does not support the creation of non-chainable mutators.
     */
    public static override create<
        TData extends object,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(): FinalMutators<TData, TParamName, TMutators> {
        throw new Error("ChainableMutatorSet does not support non-chained mutators.");
    }
}
