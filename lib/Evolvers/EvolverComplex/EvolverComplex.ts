import { Evolver } from "../Evolver/Evolver";
import { EvolveObject, MutateObject } from "../Types/EvolverTypes";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
import { EvolverRenamedForComplex, renameEvolverForComplex } from "./renameEvolverForComplex";

type StringKeyOf<T> = {
    [K in keyof T]: K extends string ? K : never;
}[keyof T];

type RemoveEvolverFromName<T> = {
    [K in keyof T as EvolverRenamedForComplex<Extract<K, string>>]: T[K];
};

export class EvolverComplex {
    public static create = <TData>() => ({
        /**
         * Creates a new EvolverComplex with the given evolvers.
         */
        withEvolvers: <
            TEvolvers extends Record<string, Evolver<TData, any, TEvolverName, TParamName>>,
            TEvolverName extends string,
            TParamName extends string,
        >(
            evolvers: TEvolvers,
        ) => ({
            /**
             * Performs a single mutation on the given input, and returns the resulting transformed data.
             *
             * Examples:
             * ```
             * const {BoxScore} = BaseballEvolverComplex.mutate(myData);
             * const result = BoxScore.setRuns(5);
             * ```
             */
            mutate: (input: TData) => EvolverComplex.mutate(input).withEvolvers(evolvers),
            /**
             * Performs multiple mutations on the given input, chained together. The final result is available via
             * the `finish` method, or by preceding the final chained call with `.lastly`.
             *
             * Examples:
             * ```
             * const {BoxScore} = BaseballEvolverComplex.evolve(myData);
             * const result = BoxScore.setRuns(5).and.setHits(10).and.setErrors(0).finish(); // option 1
             * const result = BoxScore.setRuns(5).and.setHits(10).and.lastly.setErrors(0); // option 2
             * ```
             */
            evolve: (input: TData) => EvolverComplex.evolve(input).withEvolvers(evolvers),
            use: (input: TData) => ({
                Mutate: EvolverComplex.mutate(input).withEvolvers(evolvers),
                Evolve: EvolverComplex.evolve(input).withEvolvers(evolvers),
            }),
        }),
    });

    private static mutate = <TData>(input: TData) => ({
        withEvolvers: <
            TEvolvers extends Record<string, Evolver<TData, TMutators, TEvolverName, TParamName>>,
            TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
            TEvolverName extends string,
            TParamName extends string,
        >(
            evolvers: TEvolvers,
        ) => {
            return this.generateEvolveMethods(evolvers, input, false);
        },
    });

    private static evolve = <TData>(input: TData) => ({
        withEvolvers: <
            TEvolvers extends Record<string, Evolver<TData, TMutators, TEvolverName, TParamName>>,
            TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
            TEvolverName extends string,
            TParamName extends string,
        >(
            evolvers: TEvolvers,
        ) => {
            return this.generateEvolveMethods(evolvers, input, true);
        },
    });

    private static generateEvolveMethods<
        TData,
        TIsMacro extends boolean,
        TEvolvers extends Record<string, Evolver<TData, any, any, any>>,
    >(evolvers: TEvolvers, input: TData, macro: TIsMacro) {
        /**
         * Represents the names of the refineries as provided in the withRefineries argument.
         */
        type TEvolverPassedNames = StringKeyOf<TEvolvers>;

        type TypeAccess<
            TEvolver extends keyof TEvolvers,
            TTypeName extends keyof TEvolvers[TEvolver]["__type__access__"],
        > = TEvolvers[TEvolver]["__type__access__"][TTypeName];

        type MutatorsForEvolver<T extends TEvolverPassedNames> = ReturnType<
            MutateObject<
                TypeAccess<T, "data">,
                TypeAccess<T, "mutators">,
                TypeAccess<T, "mutableParamName">
            >["getMutators"]
        >;
        type MacroMutatorsForEvolver<T extends TEvolverPassedNames> = ReturnType<
            EvolveObject<
                TypeAccess<T, "data">,
                TypeAccess<T, "mutators">,
                TypeAccess<T, "mutableParamName">
            >["getMutators"]
        >;

        type MutatorsRemapped = {
            [KEvolverName in TEvolverPassedNames]: MutatorsForEvolver<KEvolverName>;
        };

        type MacroMutatorsRemapped = {
            [KEvolverName in TEvolverPassedNames]: MacroMutatorsForEvolver<KEvolverName>;
        };

        type MutatorsResult = TIsMacro extends true ? MacroMutatorsRemapped : MutatorsRemapped;

        type MutatorsFormatted = RemoveEvolverFromName<MutatorsResult>;

        const keys = Object.keys(evolvers) as TEvolverPassedNames[];

        const result = keys.reduce((acc, key: TEvolverPassedNames) => {
            const evolver = evolvers[key];
            const mutators = macro ? evolver.evolve(input).getMutators() : evolver.mutate(input).getMutators();
            const formattedEvolverName = renameEvolverForComplex(key);

            (acc as Record<EvolverRenamedForComplex<string>, any>)[formattedEvolverName] = mutators;

            return acc;
        }, {} as MutatorsFormatted);

        return result;
    }
}
