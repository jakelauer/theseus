/**
 * Represents an immutable parameter name. Used to indicate that the data passed to a refinery should not be mutated.
 */
export type Immutable<TParamName extends string = string> = `immutable${Capitalize<TParamName>}`;

/**
 * Transforms a given string into its immutable form by capitalizing the first letter and prefixing it with 'immutable'.
 * This is used to construct type strings that represent immutable parameters within the Theseus framework.
 *
 * @template T The type of the input string.
 * @param {T} str - The string to transform into an immutable form.
 * @returns {Immutable<T>} The transformed string representing an immutable parameter.
 */
export function makeImmutable<T extends string>(str: T): Immutable<T> 
{
    const capitalized = (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

    return `immutable${capitalized}`;
}
