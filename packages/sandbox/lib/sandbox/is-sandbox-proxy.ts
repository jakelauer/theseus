import { CONSTANTS } from "../constants";
import type { SandboxProxy } from "./types";


function hasSandboxProxyPrefix(o: any): boolean 
{
	return o && typeof o === "object" && !!o[CONSTANTS.SANDBOX_SYMBOL];
}

function objectPropertiesAreSandboxProxy(o: any)
{
	if (!o || typeof o !== "object")
	{
		return false;
	
	}

	let propertiesAreSandboxProxy = true;

	// Recursively check all properties
	for (const key in o) 
	{
		if (Object.prototype.hasOwnProperty.call(o, key) && typeof o[key] === "object") 
		{
			propertiesAreSandboxProxy = propertiesAreSandboxProxy && objectPropertiesAreSandboxProxy(o[key]);
		}
	}

	return propertiesAreSandboxProxy;
}

/**
 * || * Determines if the given object is a sandbox proxy.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 * @returns {obj is SandboxProxy<T>} - True if the object is a sandbox proxy, false otherwise.
 */
export function isSandboxProxy<T extends object>(obj: T): obj is SandboxProxy<T> 
{

	const rootIsSandboxProxy = hasSandboxProxyPrefix(obj);
	const propertiesAreSandboxProxy = objectPropertiesAreSandboxProxy(obj);

	if (rootIsSandboxProxy && !propertiesAreSandboxProxy)
	{
		console.warn("Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.");
	}

	return rootIsSandboxProxy && propertiesAreSandboxProxy;
}
