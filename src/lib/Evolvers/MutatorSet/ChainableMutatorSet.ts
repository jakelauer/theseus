import log from "@Shared/Log/log";
import { AwaitSync } from "@Shared/Promise/AwaitSync";
import { Mutable } from "@Shared/String/makeMutable";

import { Func } from "../../Types/Modifiers";
import { MutatorDefs } from "../Types/MutatorTypes";
import { MutatorSet } from "./MutatorSet";

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
    /**
     * Utility method to determine if a given value is a Promise.
     *
     * @param value The value to check.
     * @returns True if the value is a Promise, false otherwise.
     */
    private isPromise(path: string, value: any): value is Promise<any> {
        const result = Boolean(value && typeof value.then === "function");

        if (result) log.debug(`Function "${path}" returns a Promise`);

        return result;
    }

    /**
     * Overrides addFunctionToSelf to support chainable operations. If the operation is asynchronous (returns a Promise),
     * it returns the Promise directly. Otherwise, it enhances the returned object with a chainable interface.
     *
     * @param context The object context to which the mutator function is added.
     * @param selfPath The path (name) under which the mutator function is stored in the context.
     * @param func The mutator function to be executed.
     */
    protected override addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => {
                log.debug(`Executing "${selfPath}" with args: `, args);

                const output = func(this.mutableData, ...args);
                const isPromise = this.isPromise(selfPath, output);
                let outcomeData: TEvolverData;
                let chainableKey: "then" | "and";

                if (isPromise) {
                    const [outData, err] = AwaitSync(output);
                    if (err) throw err;

                    outcomeData = outData;
                    chainableKey = "then";

                    log.debug(
                        `Function "${selfPath}" returns a Promise, enhancing with chainable interface. Current state: `,
                        this.mutableData,
                    );
                } else {
                    outcomeData = output;
                    chainableKey = "and";

                    log.debug(
                        `Function "${selfPath}" returns a non-Promise, enhancing with chainable interface. Current state: `,
                        this.mutableData,
                    );
                }

                context.finally = new MutatorSet<TEvolverData, TParamName, TMutators>(
                    outcomeData,
                    this.argName,
                    this.mutators,
                );

                this.mutableData = this.inputToObject<TEvolverData, TParamName>(outcomeData);
                return {
                    [chainableKey]: this,
                };
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
        return new ChainableMutatorSet(data, argName, mutators);
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
