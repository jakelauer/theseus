/**
 * Capitalizes the first letter of a given string.
 *
 * @template T The type of the input string.
 * @param {T} str - The string to capitalize.
 * @returns {Capitalize<T>} The input string with its first letter capitalized.
 */
export function capitalizeFirstLetter<T extends string>(str: T): Capitalize<T> 
{
    return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}
