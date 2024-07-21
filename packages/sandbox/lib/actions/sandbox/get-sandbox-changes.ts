import { CONSTANTS } from "sandbox-constants";
import { isSandbox } from "./detect/is-sandbox-proxy.js";

/**
 * Returns the changes made to the object if it is a sandbox proxy.
 *
 * @template T - The type of the object.
 * @param {T} potentialSandbox - The object to get changes from.
 * @returns {object} - An object containing the recursive changes.
 */
export function getSandboxChanges<T extends object>(potentialSandbox: T): Partial<T> 
{
	if (!isSandbox(potentialSandbox)) 
	{
		throw new Error("The provided object is not a sandbox.");
	}

	return getRecursiveChanges(potentialSandbox);
}

/**
 * Recursively gets changes from the object.
 *
 * @param {object} changes - The changes object to process.
 * @returns {object} - The processed changes with nested changes included.
 */
function getRecursiveChanges<T extends object>(potentialSandbox: T): Partial<T> 
{
	const result = getChangesForObj(potentialSandbox);

	const innerResult = Object.keys(potentialSandbox).reduce((acc, key) => 
	{
		const value = potentialSandbox[key];
		if (typeof value === "object" && value !== null) 
		{
			acc[key] = getRecursiveChanges(value);
		}

		return acc;
	}, {});

	return {
		...result,
		...innerResult,
	};
}

function getChangesForObj<T extends object>(obj: T): Partial<T> 
{
	return obj[CONSTANTS.SANDBOX_SYMBOL]?.changes;
}
