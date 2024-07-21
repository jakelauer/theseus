import type { RemoveWordAndValidate } from "../../Types/Modifiers.js";

export type NormalizedEvolverName<T extends string> = RemoveWordAndValidate<T, "evolver">;
export const normalizeEvolverName = <T extends string>(name: T): NormalizedEvolverName<T> => 
{
	if (!name) 
	{
		throw new Error("Name cannot be empty.");
	}
	// Regular expression to match 'Evolver' or 'evolver' at the start and/or end of the string
	const regex = /^(Evolver|evolver)?(.*?)(Evolver|evolver)?$/;
	const replacedName = name.replace(regex, "$2");

	// Check if the result is an empty string or a numeric string
	if (replacedName === "" || !isNaN(Number(replacedName))) 
	{
		return name as NormalizedEvolverName<T>;
	}

	return replacedName as NormalizedEvolverName<T>;
};
