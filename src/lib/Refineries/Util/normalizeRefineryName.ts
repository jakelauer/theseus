import type { RemoveWordFromTypeStr } from "@Types/Modifiers";

export type NormalizedRefineryName<T extends string> = RemoveWordFromTypeStr<T, "refinery">;
export const normalizeRefineryName = <T extends string>(name: T): NormalizedRefineryName<T> => 
{
	// Regular expression to match 'refinery' or 'Refinery' at the start and/or end of the string
	const regex = /^(refinery|Refinery)?(.*?)(refinery|Refinery)?$/;
	return name.replace(regex, "$2") as NormalizedRefineryName<T>;
};
