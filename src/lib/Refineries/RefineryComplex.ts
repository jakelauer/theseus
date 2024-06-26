import getTheseusLogger from "@Shared/Log/get-theseus-logger";



import type { Refinery } from "./Refinery";
import type { ForgeDefs } from "./Types/RefineryTypes";
import type { NormalizedRefineryName } from "./Util/normalizeRefineryName";
import type { RefineriesRemapped } from "@Refineries/Types/RefineryComplexTypes";

const log = getTheseusLogger("RefineryComplex");

/**
 * Begins the data refinement process in a fluid, sentence-like pattern. Allows the specification of
 * refineries to process the input data.
 */
const refine = <
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
    TRefineries extends Refinery<TData, string, TParamNoun, TForges>[],
>(
		input: TData,
	) => ({
		/**
     * Specifies the set of refineries to be used for processing the input data. Each property in the provided
     * object should be a Refinery whose data matches TData. Follows a fluent pattern, allowing for intuitive
     * and clear data processing steps.
     */
		withRefineries: (refineries: TRefineries) => 
		{
			const result = refineries.reduce(
				(acc, refinery) => 
				{
					const forgeSet = refinery.refine(input);

					(acc as Record<NormalizedRefineryName<string>, any>)[refinery.refineryName] = forgeSet.getForges();

					return acc;
				},
            {} as RefineriesRemapped<TData, TParamNoun, TForges, TRefineries>,
			);

			return result;
		},
	});

const create = <TData extends object>() => ({
	withRefineries: <
        TParamNoun extends string,
        TForges extends ForgeDefs<TData, TParamNoun>,
		TRefineries extends Refinery<TData, string, TParamNoun, TForges>[],
    >(
		...refineries: TRefineries
	): RefineryComplexInstance<TData, TParamNoun, TForges, TRefineries> =>
		innerWithRefineries<TData, TParamNoun, TForges, TRefineries>(refineries),
});

const innerWithRefineries = <
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
    TRefineries extends Refinery<TData, string, TParamNoun, TForges>[],
>(
		refineries: TRefineries,
	) => 
{
	const result = {
		refine: (input: TData) =>
			refine<TData, TParamNoun, TForges, TRefineries>(input).withRefineries(refineries),
	} as const;

	log.verbose("Creating refinery complex with refineries", {
		refineries: Object.keys(refineries),
	});

	return result;
};

/**
 * Manages a complex of refineries, providing a structured way to process data. This class facilitates a
 * fluent interface for refining data, akin to constructing a sentence:
 * `RefineryComplex.refine(myData).withRefineries({ ... })`.
 */
export class RefineryComplex 
{
	public static create = create;
}

export type RefineryComplexInstance<
    TData extends object,
    TParamNoun extends string,
    TForges extends ForgeDefs<TData, TParamNoun>,
    TRefineries extends Refinery<TData, string, TParamNoun, TForges>[],
> = {
    refine: (data: TData) => RefineriesRemapped<TData, TParamNoun, TForges, TRefineries>;
};
