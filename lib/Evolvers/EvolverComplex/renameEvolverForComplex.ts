type RemoveEvolverStartNoCaps<T extends string> = T extends `evolver${infer Rest}` ? Rest : T;
type RemoveEvolverEndNoCaps<T extends string> = T extends `${infer Rest}evolver` ? Rest : T;
type RemoveEvolverNoCaps<T extends string> = RemoveEvolverStartNoCaps<RemoveEvolverEndNoCaps<T>>;
type RemoveEvolverStartCaps<T extends string> = T extends `Evolver${infer Rest}` ? Rest : T;
type RemoveEvolverEndCaps<T extends string> = T extends `${infer Rest}Evolver` ? Rest : T;
type RemoveEvolverCaps<T extends string> = RemoveEvolverStartCaps<RemoveEvolverEndCaps<T>>;

/**
 * Normalizes evolver names by removing both capitalized ('Evolver') and non-capitalized ('evolver') prefixes or suffixes,
 * ensuring a consistent naming convention across the Theseus project's EvolverComplex functionality. This type is crucial
 * for handling a variety of evolver naming patterns, making it easier to manage and reference evolvers within the complex
 * state management structures.
 *
 * The `RemoveEvolverFromName` type achieves its goal by sequentially applying two sets of operations:
 * - First, it addresses non-capitalized versions ('evolver') of the prefix or suffix, ensuring that any lowercase 'evolver'
 *   present at the beginning or end of the string is removed.
 * - Secondly, it applies a similar removal process for the capitalized 'Evolver', catering to names where 'Evolver' might
 *   appear with initial capital letters.
 *
 * By combining these steps, `RemoveEvolverFromName` effectively strips away these specific prefixes or suffixes from evolver names,
 * regardless of their capitalization, without altering the rest of the string's original casing. This process allows for a cleaner
 * and more uniform approach to handling evolver names within the system, facilitating easier access, reference, and management of
 * evolver-related functionality.
 */
export type RemoveEvolverFromName<T extends string> = RemoveEvolverNoCaps<RemoveEvolverCaps<T>>;
export type EvolverRenamedForComplex<T extends string> = RemoveEvolverFromName<T>;

export const renameEvolverForComplex = <T extends string>(name: T): EvolverRenamedForComplex<T> => {
    // Regular expression to match 'Evolver' or 'Evolver' at the start and/or end of the string
    const regex = /^(Evolver|Evolver)?(.*?)(Evolver|Evolver)?$/;
    return name.replace(regex, "$2") as EvolverRenamedForComplex<T>;
};
