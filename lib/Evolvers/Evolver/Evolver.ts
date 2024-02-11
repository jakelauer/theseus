import log from "loglevel";

import { makeMutable } from "../../Utils/StringUtils";
import { NormalizedEvolverName } from "../EvolverComplex/normalizeEvolverName";
import { ChainableMutatorSet } from "../MutatorSet/ChainableMutatorSet";
import { MutatorSet } from "../MutatorSet/MutatorSet";
import { EvolveObject, EvolverOptions, MutateObject, SortaPromise } from "../Types/EvolverTypes";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";

interface TypeAccess<
    TData,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolverName extends string,
    TParamName extends string,
> {
    data: TData;
    mutators: TMutators;
    evolverName: TEvolverName;
    paramName: TParamName;
    mutableParamName: Mutable<TParamName>;
    returnData: SortaPromise<TData>;
    evolver: Evolver<TData, TMutators, TEvolverName, TParamName>;
}

/**
 * Represents an evolver for data transformation and mutation, encapsulating the logic for mutating and evolving data structures.
 */
export class Evolver<
    TData,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolverName extends string,
    TParamName extends string,
> {
    public readonly evolverName: NormalizedEvolverName<TEvolverName>;
    protected readonly mutableArgName: Mutable<TParamName>;
    protected readonly mutators: TMutators;

    /**
     * This only exists to provide outside access to the type parameters of evolvers
     * nested within an EvolverComplex. It doesn't need a value.
     */
    public readonly __type__access__: TypeAccess<TData, TMutators, TEvolverName, TParamName>;

    /**
     * Constructor for Evolver. Initializes the evolver with a name, set of mutators, and optional configuration.
     */
    protected constructor(name: TEvolverName, mutators: TMutators, options?: EvolverOptions<TParamName>) {
        const normalizedName = this.normalizeName(name);
        const mutableDataNoun: TParamName = options?.noun ?? ("input" as TParamName);

        this.evolverName = normalizedName;
        this.mutableArgName = makeMutable(mutableDataNoun);

        this.assertValidMutators(mutators);
        this.mutators = mutators;

        log.trace(`Created evolver: ${this.evolverName}`);
    }

    private assertValidMutators(mutators: TMutators) {
        if (!mutators || Object.keys(mutators).length === 0) {
            log.error("Mutators cannot be empty.");
            throw new Error("Mutators cannot be empty.");
        }

        for (const key in mutators) {
            if (!mutators[key]) {
                log.error(`Mutator '${key}' cannot be empty.`);
                throw new Error(`Mutator '${key}' cannot be empty.`);
            }
        }

        log.trace(`Evolver '${this.evolverName}' has ${Object.keys(mutators).length} mutators.`);
    }

    private normalizeName(name: TEvolverName) {
        const trimmed = this.trimEvolverFromName(name);

        this.assertValidName(trimmed, "Name cannot be empty, nor only the word 'refinery'");

        return name as NormalizedEvolverName<TEvolverName>;
    }

    private trimEvolverFromName(name: string) {
        const ensureName = name ?? "";
        return ensureName.replace(/^(evolver\s+|\s+evolver)$/gi, "");
    }

    private assertValidName(name: string, errorMessage: string) {
        if (!name || name.trim().length === 0) {
            throw new Error(`Refinery name cannot be empty. ${errorMessage}`);
        }
    }

    /**
     * Retrieves the definitions of mutators associated with this evolver.
     * @returns A collection of mutator definitions.
     */
    public getMutatorDefinitions = () => this.mutators;

    /**
     * Applies mutation operations to the input data, based on the configured mutators.
     * @returns The mutated data.
     */
    public mutate(input: TData) {
        // Create the actions which will be available when `for()` is called.
        const mutatorSet = MutatorSet.create<TData, Mutable<TParamName>, TMutators>(
            input,
            this.mutableArgName,
            this.mutators,
        );

        const mutatorSetGetter = () => mutatorSet;
        const result = Object.defineProperties<MutateObject<TData, TMutators, Mutable<TParamName>>>({} as any, {
            getMutators: {
                get: () => mutatorSetGetter,
            },
            using: {
                get: mutatorSetGetter,
            },
        });

        log.trace(`Mutating data using evolver: ${this.evolverName}`, input);

        return result;
    }

    /**
     * Applies mutation operations to the input data, based on the configured mutators.
     * @returns An object allowing further mutation or chaining operations.
     */
    public evolve(input: TData) {
        // Create the actions which will be available when `for()` is called.
        const mutatorSet = ChainableMutatorSet.createChainable<TData, Mutable<TParamName>, TMutators>(
            input,
            this.mutableArgName,
            this.mutators,
        );

        const mutatorSetGetter = () => mutatorSet;

        const result = Object.defineProperties<EvolveObject<TData, TMutators, Mutable<TParamName>>>({} as any, {
            getMutators: {
                get: () => mutatorSetGetter,
            },
            using: {
                get: mutatorSetGetter,
            },
        });

        log.trace(`Evolving data using evolver: ${this.evolverName}`, input);

        return result;
    }

    /**
     * Accessor for retrieving the mutators directly.
     * @returns The configured mutators for this evolver.
     */
    public getMutators() {
        return this.mutators;
    }

    /**
     * Factory method for creating an Evolver instance, facilitating a fluent API for defining evolvers.
     * @returns A fluent interface for constructing an Evolver with specified data and mutators.
     */
    public static create = <_TEvolverName extends string, _TParamName extends string>(
        name: _TEvolverName,
        options?: EvolverOptions<_TParamName>,
    ) => ({
        toEvolve: <_TData>() => ({
            withMutators: <_TMutators extends MutatorDefs<_TData, Mutable<_TParamName>>>(mutators: _TMutators) => {
                // This is a trick to force the type of the return value to be the name of the refinery.
                type ForceReturnVariableName = Record<
                    _TEvolverName,
                    Evolver<_TData, _TMutators, _TEvolverName, _TParamName>
                >;

                const refinery = new Evolver<_TData, _TMutators, _TEvolverName, _TParamName>(name, mutators, options);

                log.trace(
                    `Created evolver: ${refinery.evolverName} with mutators: ${Object.keys(mutators).join(", ")}`,
                );

                return {
                    [name]: refinery,
                } as ForceReturnVariableName;
            },
        }),
    });

    /**
     * Provides a builder function to simplify the creation of Evolver instances, supporting a fluent configuration API.
     * @returns A function for fluently configuring and creating an Evolver instance.
     */
    public static buildCreator = <_TParamName extends string>(options?: EvolverOptions<_TParamName>) => ({
        toEvolve: <_TData>() => ({
            named: <_TEvolverName extends string>(name: _TEvolverName) => {
                log.trace(`Creating evolver: ${name} with options: ${JSON.stringify(options)}`);

                return this.create<_TEvolverName, _TParamName>(name, options).toEvolve<_TData>();
            },
        }),
    });
}
