import type { FinalMutators } from "@Evolvers/Types/ChainableTypes";
import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import { Theseus } from "@/Theseus";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";

import type { Mutable } from "@Shared/String/makeMutable";

import type { GenericMutator, MutatorDefs } from "../../Types/MutatorTypes";
/**
 * Represents a set of mutators that can be applied to an evolver's data. It provides the infrastructure for
 * adding mutator functions to the evolver and executing these functions to mutate the evolver's state.
 *
 * @template TData The type of data the evolver operates on.
 * @template TParamName The type representing the names of mutable parameters within the evolver data.
 * @template TMutators The type representing the definitions of mutators applicable to the evolver data.
 */

const log = getTheseusLogger("MutatorSetBuilder");

export class MutatorSetBuilder<
    TData extends object,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefs<TData, TParamName>,
> {
    protected __theseusId?: string;
    protected mutableData: { [key in TParamName]: TData };

    constructor(
        inputData: TData,
        protected readonly argName: TParamName,
        protected readonly mutators: TMutators,
        observationId?: string,
    ) {
        this.mutableData = this.inputToObject(inputData);
        this.extendSelfWithMutators(mutators);
        this.__theseusId = observationId;
    }

    public __setTheseusId(id: string) {
        this.__theseusId = id;
    }

    /**
     * Extends the instance with mutator functions defined in the mutators parameter. It recursively traverses
     * the mutators object, adding each function to the instance, allowing for nested mutator structures.
     */
    private extendSelfWithMutators(mutators: TMutators, path: string[] = []) {
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
            } else if (typeof item === "object" && item !== null) {
                this.extendSelfWithMutators(item as TMutators, newPath);
            }
        });
    }

    /**
     * Utility method to determine if a given value is a Promise.
     *
     * @param value The value to check.
     * @returns True if the value is a Promise, false otherwise.
     */
    protected isPromise(path: string, value: any): value is Promise<any> {
        const result = Boolean(value && typeof value.then === "function");

        if (result) log.verbose(`Function "${path}" returns a Promise`);

        return result;
    }

    /**
     * Adds a function to the instance at the specified path. This method is used internally by
     * extendSelfWithMutators to attach mutator functions to the instance.
     */
    protected addFunctionToSelf(
        context: any,
        selfPath: string,
        mutator: GenericMutator<TData, SortaPromise<TData>>,
    ) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => {
                let funcResult: SortaPromise<TData>;
                try {
                    funcResult = mutator(this.mutableData, ...args);
                } catch (e) {
                    log.error(`Error in mutator function "${selfPath}"`, e);
                    throw e;
                }

                if (funcResult === undefined) {
                    log.error(`Function "${selfPath}" returned undefined. This is likely an error.`);
                }

                const funcAsPromise =
                    funcResult instanceof Promise ? funcResult : Promise.resolve(funcResult);

                funcAsPromise
                    .then((result) => {
                        if (this.__theseusId && result) {
                            log.verbose(`Function "${selfPath}" completed, sending to Observation.`);
                            void Theseus.updateInstance(this.__theseusId, result);
                        }
                    })
                    .catch((e) => {
                        throw e;
                    });

                return funcResult;
            },
        });
    }

    /**
     * Transforms the input data into the structured format expected by the mutators, keyed by the parameter
     * name.
     */
    protected inputToObject<_TData, _TParamName extends Mutable<string>>(
        input: _TData,
    ): { [key in _TParamName]: _TData } {
        return { [this.argName]: input } as {
            [key in _TParamName]: _TData;
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
        TData extends object,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(
        data: TData,
        argName: TParamName,
        mutators: TMutators,
        observationId?: string,
    ): FinalMutators<TData, TParamName, TMutators> {
        const builder = new MutatorSetBuilder(data, argName, mutators, observationId);

        return this.castToMutators(builder);
    }

    /**
     * Casts the provided ChainableMutatorBuilder instance to a ChainableMutators instance. This is a
     * workaround to avoid TypeScript's inability to infer the correct type of the returned object.
     */
    private static castToMutators<
        TData extends object,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TData, TParamName>,
    >(chainableMutatorSet: MutatorSetBuilder<TData, TParamName, TMutators>) {
        return chainableMutatorSet as unknown as FinalMutators<TData, TParamName, TMutators>;
    }
}
