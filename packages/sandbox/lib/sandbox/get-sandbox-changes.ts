import { CONSTANTS } from "../constants";
import { isSandboxProxy } from "./is-sandbox-proxy";

/**
 * Returns the changes made to the object if it is a sandbox proxy.
 */
export function getSandboxChanges<T extends object>(potentialSandboxProxy: T)
{
	if (isSandboxProxy(potentialSandboxProxy))
	{
		const {
			__sandbox__,
			...changes
		} = potentialSandboxProxy[CONSTANTS.PROP_PREFIX].changes as any;

		return changes;
	}
	else 
	{
		throw new Error("The provided object is not a sandbox.");
	}
}
