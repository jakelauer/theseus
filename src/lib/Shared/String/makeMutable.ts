/**
 * A utility type for marking parameter names as mutable. This is used to distinguish mutable parameters
 * within evolver data structures.
 */
export type Mutable<TParamName extends string = string> = `mutable${Capitalize<TParamName>}`;

/**
 * Transforms a given string into its mutable form by capitalizing the first letter and prefixing it 
 * with 'mutable'. This is used to construct type strings that represent mutable parameters within 
 * the Theseus framework.
 *
 * @template T The type of the input string.
 * @param {T} str - The string to transform into a mutable form.
 * @returns {Mutable<T>} The transformed string representing a mutable parameter.
 */
export function makeMutable<T extends string>(str: T): Mutable<T> 
{
	const capitalized = (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

	return `mutable${capitalized}`;
}
