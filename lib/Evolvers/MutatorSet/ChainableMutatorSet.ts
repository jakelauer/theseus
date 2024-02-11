import log from "loglevel";

import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
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

        if (result) log.trace(`Function at path "${path}" returns a Promise`);

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
                const output = func(this.mutableData, ...args);
                this.mutableData = this.inputToObject<TEvolverData, TParamName>(output);

                return this.isPromise(selfPath, output) ? output : (
                        {
                            and: this,
                        }
                    );
            },
            lastly: new MutatorSet<TEvolverData, TParamName, TMutators>(
                this.mutableData[this.argName],
                this.argName,
                this.mutators,
            ),
        });

        log.trace(`Added function to self at path: ${selfPath}, accessible via "and" and "lastly" properties`);
    }

    /**x
     * Retrieves the final form of the mutated data after all chainable mutations have been applied.
     *
     * @returns The final mutated state.
     */
    public getFinalForm() {
        log.trace(`Retrieving final form of mutated data`);
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
        log.trace(`Creating chainable mutator set with initial data and mutators`);
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
