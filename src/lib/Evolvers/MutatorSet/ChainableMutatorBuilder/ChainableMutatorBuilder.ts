import { createChainableProxy } from "@Evolvers/MutatorSet/ChainableMutatorBuilder/createChainableProxy";
import { ChainableMutators } from "@Evolvers/Types";
import log from "@Shared/Log/log";
import { Mutable } from "@Shared/String/makeMutable";

import { Func } from "../../../Types/Modifiers";
import { MutatorDefs } from "../../Types/MutatorTypes";
import { MutatorSet } from "../MutatorSet";

// Interface defining the capability to retrieve the final form of the mutated data.
interface Chainable<TData> {
    finalForm: TData;
    finalFormAsync: Promise<TData>;
}

type MutableData<TData, TParamName extends Mutable<string>> = { [key in TParamName]: TData };

/**
 * Extends MutatorSet to provide chainable mutation operations on evolver data.
 * This class allows mutations to be chained together in a fluent manner, enhancing the clarity and expressiveness
 * of state evolution logic.
 *
 * @template TEvolverData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */
export class ChainableMutatorBuilder<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >
    extends MutatorSet<TEvolverData, TParamName, TMutators>
    implements Chainable<TEvolverData>
{
    private finallyMode = false;
    private queue: Promise<any>;
    private isAsyncEncountered: boolean;
    private calls = 0;

    constructor(inputData: TEvolverData, argName: TParamName, mutators: TMutators) {
        super(inputData, argName, mutators);

        this.queue = Promise.resolve();
        this.isAsyncEncountered = false;
    }

    private queueMutatorExecution(
        selfPath: string,
        func: Func<MutableData<TEvolverData, TParamName>, TEvolverData | Promise<TEvolverData>>,
        args: any[],
    ) {
        const operation = () => {
            log.debug(`[Operation] Executing "${selfPath}()" with args: `, args);
            const funcResult = func(this.mutableData, ...args);

            if (funcResult === undefined) {
                log.error(
                    `[Operation] "${selfPath}()" returned undefined. This is likely an error.`,
                );
            } else {
                log.debug(`[Operation] "${selfPath}()" returned: `, funcResult);
            }

            if (funcResult instanceof Promise) {
                log.debug(`[Operation] "${selfPath}()" encountered an async operation`);
                // Async operation encountered, switch to queuing mode
                this.isAsyncEncountered = true;
                return funcResult.then((result) => {
                    log.debug(
                        `[Operation] "${selfPath}()" completed, updating mutable data`,
                        result,
                    );
                    this.mutableData = this.inputToObject(result); // Assuming funcResult updates mutableData
                    return result;
                });
            } else {
                log.debug(
                    `[Operation] "${selfPath}()" completed, updating mutable data`,
                    funcResult,
                );
                this.mutableData = this.inputToObject(funcResult); // Assuming funcResult updates mutableData
                return funcResult;
            }
        };

        if (this.isAsyncEncountered) {
            // Queue all operations after the first async is encountered
            this.queue = this.queue.then(operation);
        } else {
            const result = operation();
            if (result instanceof Promise) {
                this.queue = result;
            }

            return result;
        }

        return this.queue;
    }

    private getOperationProxy() {
        return createChainableProxy({
            target: this,
            queueMutatorExecution: this.queueMutatorExecution.bind(this),
            setFinallyMode: (mode: boolean) => {
                this.finallyMode = mode;
            },
            getFinallyMode: () => this.finallyMode,
        });
    }

    public get finalForm() {
        return this.mutableData[this.argName];
    }

    public get finalFormAsync() {
        return this.queueMutatorExecution(
            "finalForm",
            () => this.finalForm,
            [],
        ) as Promise<TEvolverData>;
    }

    /**
     * Overrides addFunctionToSelf to support chainable operations. If the operation is asynchronous (returns a Promise),
     * it returns the Promise directly. Otherwise, it enhances the returned object with a chainable interface.
     *
     * @param context The object context to which the mutator function is added.
     * @param selfPath The path (name) under which the mutator function is stored in the context.
     * @param func The mutator function to be executed.
     */
    protected override addFunctionToSelf(
        context: any,
        selfPath: string,
        func: Func<any, TEvolverData | Promise<TEvolverData>>,
    ) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => {
                this.calls++;
                log.debug(
                    `[SelfFunc] Call #${this.calls} to function "${selfPath}" with args: `,
                    args,
                );

                return func(...args);
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
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(
        data: TEvolverData,
        argName: TParamName,
        mutators: TMutators,
    ): ChainableMutators<TEvolverData, TParamName, TMutators> {
        log.debug(`Creating chainable mutator set with initial data and mutators`);
        const chain = new ChainableMutatorBuilder(data, argName, mutators).getOperationProxy();
        return this.castToChainableMutators(chain);
    }

    private static castToChainableMutators<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(chainableMutatorSet: ChainableMutatorBuilder<TEvolverData, TParamName, TMutators>) {
        return chainableMutatorSet as ChainableMutators<TEvolverData, TParamName, TMutators>;
    }

    /**
     * Overrides the create method to indicate that ChainableMutatorSet is specifically designed for chainable operations,
     * and does not support the creation of non-chainable mutators.
     */
    public static override create(): MutatorSet<any, any, any> {
        log.error("ChainableMutatorSet does not support non-chained mutators.");
        throw new Error("ChainableMutatorSet does not support non-chained mutators.");
    }
}
