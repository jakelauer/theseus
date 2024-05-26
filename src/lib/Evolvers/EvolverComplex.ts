import getTheseusLogger from "@Shared/Log/get-theseus-logger";

import { normalizeEvolverName } from "./Util/normalizeEvolverName";

import type { Mutable } from "@Shared/String/makeMutable";

import type { EvolverInstance } from "./Types/EvolverTypes";
import type { MutatorDefs } from "./Types/MutatorTypes";
import type { NormalizedEvolverName } from "./Util/normalizeEvolverName";
import type { MacroMutatorsFormatted, MutatorsFormatted } from "@Evolvers/Types/EvolverComplexTypes";
const log = getTheseusLogger("EvolverComplex");

/** Utility type for extracting string keys from a type. */
type StringKeyOf<T> = {
    [K in keyof T]: K extends string ? K : never;
}[keyof T];

export const generateEvolveMethods = <
    TData extends object,
    TIsMacro extends boolean,
    TParamName extends string,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, any>>,
>(
		evolvers: TEvolvers,
		input: TData,
		macro: TIsMacro,
	) => 
{
    /** Represents the names of the refineries as provided in the withRefineries argument. */
    type TEvolverPassedNames = StringKeyOf<TEvolvers>;

    const keys = Object.keys(evolvers) as TEvolverPassedNames[];

    // Iterates over each evolver name, reducing the collection of evolvers into a single object (result)
    // that maps formatted evolver names to their mutators. This object is then returned as the final result
    // of the method, representing the cumulative mutations available for application to the state.
    const result = keys.reduce(
    	(acc, key: TEvolverPassedNames) => 
    	{
    		const evolver = evolvers[key];
    		const mutators =
                macro ? evolver.evolve(input).getMutators() : evolver.mutate(input).getMutators();
    		const formattedEvolverName = normalizeEvolverName(key);

    		(acc as Record<NormalizedEvolverName<string>, any>)[formattedEvolverName] = mutators;

    		return acc;
    	},
        {} as MutatorsFormatted<TData, TParamName, TEvolvers>,
    );

    return result;
};

export const evolve = <
    TData extends object,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TParamName extends string,
>(
		input: TData,
	) => 
{
	return {
		/** Sets up the evolution process with specified evolvers for chained mutations. */
		withEvolvers: (evolvers: TEvolvers) => 
		{
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
	) => 
{
	return {
		/** Configures the mutation process with specific evolvers. */
		withEvolvers: (evolvers: TEvolvers) => 
		{
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
	) => 
	{
		log.verbose("Creating evolver complex with evolvers:", {
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
             * via the `finish` method, or by preceding the final chained call with `.lastly`.
             *
             * Examples:
             *
             *     const { BoxScore } = BaseballEvolverComplex.evolve(myData);
             *     const result = BoxScore.setRuns(5).and.setHits(10).and.setErrors(0).finish(); // option 1
             *     const result = BoxScore.setRuns(5).and.setHits(10).and.lastly.setErrors(0); // option 2
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
export class EvolverComplex 
{
	/** Initializes the creation process for a new EvolverComplex instance. */
	public static create = create;
}

export type EvolverComplexInstance<
    TData extends object,
    TParamName extends string,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
> = {
    __evolvers__: TEvolvers;
    mutate: (data: TData) => MutatorsFormatted<TData, TParamName, TEvolvers>;
    evolve: (data: TData) => MacroMutatorsFormatted<TData, TParamName, TEvolvers>;
    use: (data: TData) => {
        mutate: MutatorsFormatted<TData, TParamName, TEvolvers>;
        evolve: MacroMutatorsFormatted<TData, TParamName, TEvolvers>;
    };
};
