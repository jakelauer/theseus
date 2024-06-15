import { CONSTANTS } from "../constants";
import { isSandboxProxy } from "./is-sandbox-proxy";

/**
 * Returns the changes made to the object if it is a sandbox proxy.
 */
export function getSandboxChanges<T extends object>(potentialSandboxProxy: T)
{
	if (isSandboxProxy(potentialSandboxProxy))
	{
		return potentialSandboxProxy[CONSTANTS.SANDBOX_SYMBOL].changes as any;
	}
	else 
	{
		throw new Error("The provided object is not a sandbox.");
	}
}
