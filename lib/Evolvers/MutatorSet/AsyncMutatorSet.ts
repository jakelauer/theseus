import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
import { MutatorSet } from "./MutatorSet";

/**
 * Extends `MutatorSet` to support asynchronous state mutations. It enables the definition and execution of async mutators,
 * facilitating state evolution that may depend on asynchronous operations.
 *
 * @template TEvolverData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */
export class AsyncMutatorSet<
    TEvolverData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefs<TEvolverData, TParamName>,
> extends MutatorSet<TEvolverData, TParamName, TMutators> {
    // Overrides the mutableData property to ensure it's compatible with async operations.
    protected override mutableData: { [key in TParamName]: TEvolverData };

    constructor(
        inputData: TEvolverData,
        protected override readonly argName: TParamName,
        functionObject: TMutators,
    ) {
        super(inputData, argName, functionObject);
        this.mutableData = this.inputToObject(inputData);
    }

    /**
     * Overrides `addFunctionToSelf` to wrap provided functions in an asynchronous context.
     * This enables the execution of async operations before mutating the state.
     */
    protected override addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: async (...args: any[]) => await func(this.mutableData, ...args),
        });
    }

    /**
     * Factory method to create an instance of `AsyncMutatorSet` with specified initial data, argument name,
     * and mutator definitions. Designed to support asynchronous mutators specifically.
     */
    public static createAsync<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(data: TEvolverData, argName: TParamName, mutators: TMutators): MutatorSet<TEvolverData, TParamName, TMutators> {
        return new AsyncMutatorSet(data, argName, mutators);
    }

    /**
     * Overrides the `create` method to indicate that `AsyncMutatorSet` is specifically designed for async operations,
     * and it does not support the creation of non-async mutators.
     */
    public static override create(): MutatorSet<any, any, any> {
        throw new Error("AsyncMutatorSet does not support non-async mutators.");
    }
}
