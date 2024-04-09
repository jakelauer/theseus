import type { RemoveWordFromTypeStr } from "../../Types/Modifiers";

export type NormalizedEvolverName<T extends string> = RemoveWordFromTypeStr<T, "evolver">;
export const normalizeEvolverName = <T extends string>(name: T): NormalizedEvolverName<T> => 
{
    // Regular expression to match 'Evolver' or 'Evolver' at the start and/or end of the string
    const regex = /^(Evolver|evolver)?(.*?)(Evolver|evolver)?$/;
    return name.replace(regex, "$2") as NormalizedEvolverName<T>;
};
