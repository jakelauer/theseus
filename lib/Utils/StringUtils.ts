import { Mutable } from "../Evolvers/Types/MutatorTypes";
import { Immutable } from "../Refineries";

/**
 * Capitalizes the first letter of a given string.
 *
 * @template T The type of the input string.
 * @param {T} str - The string to capitalize.
 * @returns {Capitalize<T>} The input string with its first letter capitalized.
 */
export function capitalizeFirstLetter<T extends string>(str: T): Capitalize<T> {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

/**
 * Transforms a given string into its mutable form by capitalizing the first letter and prefixing it with 'mutable'.
 * This is used to construct type strings that represent mutable parameters within the Theseus framework.
 *
 * @template T The type of the input string.
 * @param {T} str - The string to transform into a mutable form.
 * @returns {Mutable<T>} The transformed string representing a mutable parameter.
 */
export function makeMutable<T extends string>(str: T): Mutable<T> {
    const capitalized = (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

    return `mutable${capitalized}`;
}

/**
 * Transforms a given string into its immutable form by capitalizing the first letter and prefixing it with 'immutable'.
 * This is used to construct type strings that represent immutable parameters within the Theseus framework.
 *
 * @template T The type of the input string.
 * @param {T} str - The string to transform into an immutable form.
 * @returns {Immutable<T>} The transformed string representing an immutable parameter.
 */
export function makeImmutable<T extends string>(str: T): Immutable<T> {
    const capitalized = (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

    return `immutable${capitalized}`;
}
