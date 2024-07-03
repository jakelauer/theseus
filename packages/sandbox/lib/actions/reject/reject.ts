import { CONSTANTS } from "../../constants";
import { isSandbox } from "../sandbox/detect/is-sandbox-proxy";

/**
 * Reverts the object to its original state if it is a sandbox proxy.
 * If the provided object is not a sandbox proxy, it returns the object as-is.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to revert.
 * @returns {T} - The original object if it's a sandbox proxy, or the object itself if it's not.
 */
export function reject<T extends object>(obj: T): T 
{
	if (isSandbox(obj)) 
	{
		const original = obj[CONSTANTS.SANDBOX_SYMBOL].original as T;
		return original;
	}

	return obj;
}
