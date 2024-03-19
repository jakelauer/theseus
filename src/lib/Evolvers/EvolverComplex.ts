import getTheseusLogger from '@Shared/Log/get-theseus-logger';

import { normalizeEvolverName } from './Util/normalizeEvolverName';

import type { Mutable } from "@Shared/String/makeMutable";

import type { EvolveObject, EvolverInstance, MutateObject } from "./Types/EvolverTypes";
import type { MutatorDefs } from "./Types/MutatorTypes";
import type { NormalizedEvolverName } from "./Util/normalizeEvolverName";
const log = getTheseusLogger("EvolverComplex");

/** Utility type for extracting string keys from a type. */
type StringKeyOf<T> = {
    [K in keyof T]: K extends string ? K : never;
}[keyof T];

/** Type utility for removing 'Evolver' prefix from type names. */
type RemoveEvolverFromName<T> = {
    [K in keyof T as NormalizedEvolverName<Extract<K, string>>]: T[K];
};

export const generateEvolveMethods = <
    TData extends object,
    TIsMacro extends boolean,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<string>, any>>,
>(
    evolvers: TEvolvers,
    input: TData,
    macro: TIsMacro,
) => {
    /** Represents the names of the refineries as provided in the withRefineries argument. */
    type TEvolverPassedNames = StringKeyOf<TEvolvers>;

    // Utility type for accessing specific types within an evolver, such as data, mutators, and mutable parameter names.
    type InnerType<TEvolverName extends keyof TEvolvers> = TEvolvers[TEvolverName]["__type__access__"];

    // Determines the mutators for a given evolver by returning the types of mutators available for the evolver's data.
    type MutatorsForEvolver<TEvolverName extends TEvolverPassedNames> = ReturnType<
        MutateObject<
            InnerType<TEvolverName>["data"],
            InnerType<TEvolverName>["evolverName"],
            InnerType<TEvolverName>["mutableParamName"],
            InnerType<TEvolverName>["mutators"]
        >["getMutators"]
    >;

    // Similar to MutatorsForEvolver but for macro mutators, determining the mutators for evolving the state on a larger scale.
    type MacroMutatorsForEvolver<TEvolverName extends TEvolverPassedNames> = ReturnType<
        EvolveObject<
            InnerType<TEvolverName>["data"],
            InnerType<TEvolverName>["evolverName"],
            InnerType<TEvolverName>["mutableParamName"],
            InnerType<TEvolverName>["mutators"]
        >["getMutators"]
    >;

    // Maps each evolver name to its corresponding set of mutators, facilitating direct access to the mutators by name.
    type MutatorsRemapped = {
        [KEvolverName in TEvolverPassedNames]: MutatorsForEvolver<KEvolverName>;
    };

    // Similar to MutatorsRemapped but for macro mutators, mapping each evolver name to its set of macro mutators.
    type MacroMutatorsRemapped = {
        [KEvolverName in TEvolverPassedNames]: MacroMutatorsForEvolver<KEvolverName>;
    };

    // Conditional type that selects between MutatorsRemapped and MacroMutatorsRemapped based on the TIsMacro flag.
    type MutatorsResult = TIsMacro extends true ? MacroMutatorsRemapped : MutatorsRemapped;

    // Applies a transformation to the names of the mutators, removing the 'Evolver' prefix to match the naming conventions of the complex.
    type MutatorsFormatted = RemoveEvolverFromName<MutatorsResult>;

    const keys = Object.keys(evolvers) as TEvolverPassedNames[];

    // Iterates over each evolver name, reducing the collection of evolvers into a single object (result)
    // that maps formatted evolver names to their mutators. This object is then returned as the final result
    // of the method, representing the cumulative mutations available for application to the state.
    const result = keys.reduce((acc, key: TEvolverPassedNames) => {
        const evolver = evolvers[key];
        const mutators = macro ? evolver.evolve(input).getMutators() : evolver.mutate(input).getMutators();
        const formattedEvolverName = normalizeEvolverName(key);

        (acc as Record<NormalizedEvolverName<string>, any>)[formattedEvolverName] = mutators;

        return acc;
    }, {} as MutatorsFormatted);

    return result;
};

const evolve = <
    TData extends object,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TParamName extends string,
>(
    input: TData,
) => {
    return {
        /** Sets up the evolution process with specified evolvers for chained mutations. */
        withEvolvers: (evolvers: TEvolvers) => {
            return generateEvolveMethods(evolvers, input, true);
        },
    };
};

const mutate = <
    TData extends object,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TParamName extends string,
>(
    input: TData,
) => {
    return {
        /** Configures the mutation process with specific evolvers. */
        withEvolvers: (evolvers: TEvolvers) => {
            return generateEvolveMethods(evolvers, input, false);
        },
    };
};

export const create = <TData extends object>() => ({
    withEvolvers: <
        TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
        TParamName extends string,
    >(
        evolvers: TEvolvers,
    ) => {
        log.verbose(`Creating evolver complex with evolvers:`, {
            evolvers: Object.keys(evolvers),
        });

        return {
            __evolvers__: evolvers,
            /**
             * Performs a single mutation on the given input, and returns the resulting transformed data.
             *
             * Examples:
             *
             *     const { BoxScore } = BaseballEvolverComplex.mutate(myData);
             *     const result = BoxScore.setRuns(5);
             */
            mutate: (input: TData) => mutate(input).withEvolvers(evolvers),
            /**
             * Performs multiple mutations on the given input, chained together. The final result is available
             * via the `finish` method, or by preceding the final chained call with `.finally`.
             *
             * Examples:
             *
             *     const { BoxScore } = BaseballEvolverComplex.evolve(myData);
             *     const result = BoxScore.setRuns(5).and.setHits(10).and.setErrors(0).finish(); // option 1
             *     const result = BoxScore.setRuns(5).and.setHits(10).and.finally.setErrors(0); // option 2
             */
            evolve: (input: TData) => evolve(input).withEvolvers(evolvers),
            use: (input: TData) => ({
                mutate: mutate(input).withEvolvers(evolvers),
                evolve: evolve(input).withEvolvers(evolvers),
            }),
        } as EvolverComplexInstance<TData, TParamName, any, TEvolvers>;
    },
});

/** Facilitates complex data transformations by combining multiple Evolvers. */
export class EvolverComplex {
    /** Initializes the creation process for a new EvolverComplex instance. */
    public static create = create;
}

export type EvolverComplexInstance<
    TData extends object,
    TParamName extends string,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
> = ReturnType<typeof EvolverComplexInstanceTypeGen<TData, TParamName, TMutators, TEvolvers>>;

const EvolverComplexInstanceTypeGen = <
    TData extends object,
    TParamName extends string,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
>() => {
    type MutateFunc = typeof mutate<TData, TEvolvers, TMutators, TParamName>;
    type EvolveFunc = typeof evolve<TData, TEvolvers, TMutators, TParamName>;

    type MutateReturn = ReturnType<MutateFunc>;
    type EvolveReturn = ReturnType<EvolveFunc>;

    type MutateWithEvolversReturn = ReturnType<MutateReturn["withEvolvers"]>;
    type EvolveWithEvolversReturn = ReturnType<EvolveReturn["withEvolvers"]>;

    type UseReturn = {
        mutate: MutateWithEvolversReturn;
        evolve: EvolveWithEvolversReturn;
    };

    // eslint-disable-next-line no-constant-condition
    if ("true") {
        throw new Error("TypeGenFunc is not meant to be executed. It is only used for type organization.");
    }

    return {} as unknown as {
        __types__: {
            mutateReturn: MutateWithEvolversReturn;
            evolveReturn: EvolveWithEvolversReturn;
        };
        __evolvers__: TEvolvers;
        mutate: (data: TData) => MutateWithEvolversReturn;
        evolve: (data: TData) => EvolveWithEvolversReturn;
        use: (data: TData) => UseReturn;
    };
};
