import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
import { MutatorSet } from "./MutatorSet";

// Defines an interface for objects that can be chained and resolved to a final form.
interface Chainable<TEvolverData> {
    getFinalForm: () => TEvolverData;
}

/**
 * Extends `MutatorSet` to support asynchronous chainable mutations on evolver data.
 * It allows for the definition and execution of async mutators, which can be chained together
 * and executed in sequence to evolve the application state asynchronously.
 */
export class AsyncChainableMutatorSet<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >
    extends MutatorSet<TEvolverData, TParamName, TMutators>
    implements Chainable<TEvolverData>
{
    /**
     * Overrides `addFunctionToSelf` to wrap provided functions in an asynchronous context,
     * allowing them to perform async operations before mutating the state.
     */
    protected override addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: async (...args: any[]) => {
                const output = (await func(this.mutableData, ...args)) as TEvolverData;
                this.mutableData = this.inputToObject<TEvolverData, TParamName>(output);

                return this;
            },
        });
    }

    /**
     * Retrieves the final form of the mutated data after all asynchronous mutations have been applied.
     *
     * @returns The final mutated state.
     */
    public getFinalForm() {
        return this.mutableData[this.argName];
    }

    /**
     * Factory method to create an instance of `AsyncChainableMutatorSet` with specified initial data, argument name,
     * and mutator definitions. Facilitates easy instantiation with proper typing.
     */
    public static createAsync<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(
        data: TEvolverData,
        argName: TParamName,
        mutators: TMutators,
    ): AsyncChainableMutatorSet<TEvolverData, TParamName, TMutators> {
        return new AsyncChainableMutatorSet(data, argName, mutators);
    }

    /**
     * Overrides the `create` method to throw an error, indicating that `AsyncChainableMutatorSet`
     * does not support the creation of non-chained mutators, enforcing its use for asynchronous operations only.
     */
    public static override create(): MutatorSet<any, any, any> {
        throw new Error("AsyncChainableMutatorSet does not support non-chained mutators.");
    }
}
