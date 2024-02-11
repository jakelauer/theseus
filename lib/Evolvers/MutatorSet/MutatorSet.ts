import log from "loglevel";

import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";

/**
 * Represents a set of mutators that can be applied to an evolver's data. It provides the infrastructure for
 * adding mutator functions to the evolver and executing these functions to mutate the evolver's state.
 *
 * @template TEvolverData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */
export class MutatorSet<
    TEvolverData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefs<TEvolverData, TParamName>,
> {
    protected mutableData: { [key in TParamName]: TEvolverData };

    constructor(
        inputData: TEvolverData,
        protected readonly argName: TParamName,
        protected readonly mutators: TMutators,
    ) {
        log.trace(`Creating mutator set with argument name: ${argName}`, inputData, mutators);
        this.mutableData = this.inputToObject(inputData);
        this.extendSelfWithMutators(mutators);
    }

    /**
     * Extends the instance with mutator functions defined in the mutators parameter. It recursively
     * traverses the mutators object, adding each function to the instance, allowing for nested mutator
     * structures.
     */
    private extendSelfWithMutators(mutators: TMutators, path: string[] = []) {
        log.trace(`Extending self with mutators at path: ${path}`, mutators);
        Object.keys(mutators).forEach((mutatorKey) => {
            const item = mutators[mutatorKey];
            const newPath = [...path, mutatorKey];

            if (typeof item === "function") {
                const lastKey = newPath.pop() as string;
                const context = newPath.reduce((obj, key) => {
                    if (!obj[key]) obj[key] = {};
                    return obj[key];
                }, this as any);

                this.addFunctionToSelf(context, lastKey, item);
                log.trace(`Mutator "${mutatorKey}" is a function, added to self at path: ${newPath}`);
            } else if (typeof item === "object" && item !== null) {
                this.extendSelfWithMutators(item as TMutators, newPath);
                log.trace(`Mutator "${mutatorKey}" is an object, recursing at path: ${newPath}`);
            }
        });
    }

    /**
     * Adds a function to the instance at the specified path. This method is used internally
     * by extendSelfWithMutators to attach mutator functions to the instance.
     */
    protected addFunctionToSelf(context: any, selfPath: string, func: Func) {
        log.trace(`Adding function to self at path: ${selfPath} for context: `, context);
        Object.assign(context, {
            [selfPath]: (...args: any[]) => func(this.mutableData, ...args),
        });
    }

    /**
     * Transforms the input data into the structured format expected by the mutators, keyed by the parameter name.
     */
    protected inputToObject<_TEvolverData, _TParamName extends Mutable<string>>(
        input: _TEvolverData,
    ): { [key in _TParamName]: _TEvolverData } {
        log.trace(`Transform input to object with key name: ${this.argName}`, input);
        return { [this.argName]: input } as {
            [key in _TParamName]: _TEvolverData;
        };
    }

    /**
     * Factory method to create a new instance of MutatorSet with the provided initial data, argument name,
     * and mutators. This method facilitates the easy setup of a MutatorSet with a specific set of mutators.
     *
     * @param data The initial state data to use.
     * @param argName The name of the argument representing the mutable part of the state.
     * @param mutators The definitions of mutators to apply to the state.
     * @returns A new instance of MutatorSet configured with the provided parameters.
     */
    public static create<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(data: TEvolverData, argName: TParamName, mutators: TMutators): MutatorSet<TEvolverData, TParamName, TMutators> {
        return new MutatorSet(data, argName, mutators);
    }
}
