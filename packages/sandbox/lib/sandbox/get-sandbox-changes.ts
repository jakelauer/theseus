import { CONSTANTS } from "../constants";
import { isSandboxProxy } from "./is-sandbox-proxy";

/**
 * Returns the changes made to the object if it is a sandbox proxy.
 *
 * @template T - The type of the object.
 * @param {T} potentialSandboxProxy - The object to get changes from.
 * @returns {object} - An object containing the recursive changes.
 */
export function getSandboxChanges<T extends object>(potentialSandboxProxy: T): Partial<T> 
{
	if (!isSandboxProxy(potentialSandboxProxy)) 
	{
		throw new Error("The provided object is not a sandbox.");
	}

	return getRecursiveChanges(potentialSandboxProxy);
}

/**
 * Recursively gets changes from the object.
 *
 * @param {object} changes - The changes object to process.
 * @returns {object} - The processed changes with nested changes included.
 */
function getRecursiveChanges<T extends object>(potentialSandboxProxy: T): Partial<T>
{
	const result = getChangesForObj(potentialSandboxProxy);

	const innerResult = Object.keys(potentialSandboxProxy).reduce((acc, key) => 
	{
		const value = potentialSandboxProxy[key];
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
	return  obj[CONSTANTS.SANDBOX_SYMBOL]?.changes;
}
