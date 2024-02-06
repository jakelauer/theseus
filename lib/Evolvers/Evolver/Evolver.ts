import { makeMutable } from "../../Utils/StringUtils";
import { RemoveEvolverFromName } from "../EvolverComplex/renameEvolverForComplex";
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
}

export class Evolver<
    TData,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolverName extends string,
    TParamName extends string,
> {
    public readonly evolverName: RemoveEvolverFromName<TEvolverName>;
    protected readonly mutableArgName: Mutable<TParamName>;
    protected readonly mutators: TMutators;

    /**
     * This only exists to provide outside access to the type parameters of evolvers
     * nested within an EvolverComplex. It doesn't need a value.
     */
    public readonly __type__access__: TypeAccess<TData, TMutators, TEvolverName, TParamName>;

    protected constructor(name: TEvolverName, mutators: TMutators, options?: EvolverOptions<TParamName>) {
        const normalizedName = this.normalizeName(name);
        const mutableDataNoun: TParamName = options?.noun ?? ("input" as TParamName);

        this.evolverName = normalizedName;
        this.mutableArgName = makeMutable(mutableDataNoun);
        this.mutators = mutators;
    }

    private normalizeName(name: TEvolverName) {
        const trimmed = this.trimEvolverFromName(name);

        this.assertValidName(trimmed, "Name cannot be empty, nor only the word 'refinery'");

        return name as RemoveEvolverFromName<TEvolverName>;
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

    public getMutatorDefinitions = () => this.mutators;

    /**
     * The data upon which mutates will be performed
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

        return result;
    }

    public evolve(input: TData) {
        // Create the actions which will be available when `for()` is called.
        const mutatorSet = ChainableMutatorSet.createChainable<TData, Mutable<TParamName>, TMutators>(
            input,
            this.mutableArgName,
            this.mutators,
        );

        const mutatorSetGetter = () => mutatorSet;

        return Object.defineProperties<EvolveObject<TData, TMutators, Mutable<TParamName>>>({} as any, {
            getMutators: {
                get: () => mutatorSetGetter,
            },
            using: {
                get: mutatorSetGetter,
            },
        });
    }

    public getMutators() {
        return this.mutators;
    }

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

                return {
                    [name]: refinery,
                } as ForceReturnVariableName;
            },
        }),
    });

    /**
     * Creates a creator for an evolver.
     */
    public static buildCreator = <_TParamName extends string>(options?: EvolverOptions<_TParamName>) => ({
        toEvolve: <_TData>() => ({
            named: <_TEvolverName extends string>(name: _TEvolverName) => {
                return this.create<_TEvolverName, _TParamName>(name, options).toEvolve<_TData>();
            },
        }),
    });
}
