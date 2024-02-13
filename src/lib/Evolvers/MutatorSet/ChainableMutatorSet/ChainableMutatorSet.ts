import { createChainableProxy } from "@Evolvers/MutatorSet/ChainableMutatorSet/createChainableProxy";
import log from "@Shared/Log/log";
import { Mutable } from "@Shared/String/makeMutable";

import { Func } from "../../../Types/Modifiers";
import { MutatorDefs } from "../../Types/MutatorTypes";
import { MutatorSet } from "../MutatorSet";

// Interface defining the capability to retrieve the final form of the mutated data.
interface Chainable<TData> {
    getFinalForm: () => TData;
}

/**
 * Extends MutatorSet to provide chainable mutation operations on evolver data.
 * This class allows mutations to be chained together in a fluent manner, enhancing the clarity and expressiveness
 * of state evolution logic.
 *
 * @template TEvolverData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */
export class ChainableMutatorSet<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >
    extends MutatorSet<TEvolverData, TParamName, TMutators>
    implements Chainable<TEvolverData>
{
    // This allows the Proxy to be used to dynamically access functions for the methods called
    [key: string]: any;

    private finallyMode = false;
    private queue: Promise<any>;
    private isAsyncEncountered: boolean;
    private calls = 0;

    constructor(inputData: TEvolverData, argName: TParamName, mutators: TMutators) {
        super(inputData, argName, mutators);

        this.queue = Promise.resolve();
        this.isAsyncEncountered = false;
    }

    /**
     * Executes a mutator function with the specified arguments, updating the mutable data and queue as needed.
     */
    private executeMutator(funcPropPath: string, func: Func, args: any[]) {
        console.debug(`Executing function "${funcPropPath}" with args: `, args);
        const funcResult = func(this.mutableData, ...args);
        if (funcResult === undefined) {
            log.error(`Function "${funcPropPath}" returned undefined. This is likely an error.`);
        }
        return funcResult;
    }

    /**
     * Ensures that the result of a function execution is handled correctly, updating the mutable data and queue as needed.
     */
    private handleMutatorResult(funcPropPath: string, funcResult: any) {
        if (funcResult instanceof Promise) {
            return this.handlePromiseResult(funcPropPath, funcResult);
        } else {
            return this.handleSyncResult(funcPropPath, funcResult);
        }
    }

    /**
     * Updates the mutable data with the result of an asynchronous function execution.
     */
    private handlePromiseResult(funcPropPath: string, funcResult: any) {
        log.debug(`Function "${funcPropPath}" encountered an async operation`);
        this.isAsyncEncountered = true;
        return funcResult.then((result: any) => {
            log.debug(`Function "${funcPropPath}" async operation completed`, result);
            this.mutableData = this.inputToObject(result);
            return result;
        });
    }

    /**
     * Updates the mutable data with the result of a synchronous function execution.
     */
    private handleSyncResult(funcPropPath: string, funcResult: any) {
        log.debug(`Function "${funcPropPath}" completed`, funcResult);
        this.mutableData = this.inputToObject(funcResult);
        return funcResult;
    }

    /**
     * Updates the queue with a new operation, ensuring that it is executed in sequence with other operations.
     */
    private updateQueue(operation: () => any) {
        if (this.isAsyncEncountered) {
            log.debug(`[updateQueue] Function encountered an async operation`);
            this.queue = this.queue.then(operation);
        } else {
            const result = operation();
            log.debug(`[updateQueue] Function completed with result: `, result);
            if (result instanceof Promise) {
                log.debug(`[updateQueue] Function returned a promise`);
                this.queue = result;
            } else {
                return result;
            }
        }

        return this.queue;
    }

    /**
     * Queues a mutator function for execution, ensuring that it is executed in sequence with other operations.
     */
    private queueMutatorExecution(funcPropPath: string, func: Func, args: any[]) {
        const operation = () => {
            const funcResult = this.executeMutator(funcPropPath, func, args);
            return this.handleMutatorResult(funcPropPath, funcResult);
        };

        return this.updateQueue(operation);
    }

    private getOperationProxy() {
        return createChainableProxy({
            target: this,
            queueMutatorExecution: this.queueMutatorExecution.bind(this),
            isAsyncEncountered: () => this.isAsyncEncountered,
            setFinallyMode: (mode: boolean) => {
                this.finallyMode = mode;
            },
            getFinallyMode: () => this.finallyMode,
        });
    }

    /**
     * Overrides addFunctionToSelf to support chainable operations. If the operation is asynchronous (returns a Promise),
     * it returns the Promise directly. Otherwise, it enhances the returned object with a chainable interface.
     *
     * @param context The object context to which the mutator function is added.
     * @param funcPropPath The path (name) under which the mutator function is stored in the context.
     * @param func The mutator function to be executed.
     */
    protected override addFunctionToSelf(
        context: any,
        funcPropPath: string,
        func: Func<any, TEvolverData | Promise<TEvolverData>>,
    ) {
        Object.assign(context, {
            [funcPropPath]: (...args: any[]) => {
                this.calls++;
                log.debug(
                    `[SelfFunc] Call #${this.calls} to function "${funcPropPath}" with args: `,
                    args,
                );

                return func(...args);
            },
        });
    }

    /**x
     * Retrieves the final form of the mutated data after all chainable mutations have been applied.
     *
     * @returns The final mutated state.
     */
    public getFinalForm() {
        log.debug(`Retrieving final form of mutated data`);
        return this.mutableData[this.argName];
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
    >(data: TEvolverData, argName: TParamName, mutators: TMutators) {
        log.debug(`Creating chainable mutator set with initial data and mutators`);
        const chain = new ChainableMutatorSet(data, argName, mutators);
        return chain.getOperationProxy();
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
