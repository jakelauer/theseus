import { CONSTANTS } from "../constants";
import isElligibleForSandbox from "../validity/is-elligible-for-sandbox";
import type { SandboxProxy } from "./types";

export function objectRootIsSandboxProxy(o?: any): boolean 
{
	return o && typeof o === "object" && !!o[CONSTANTS.SANDBOX_SYMBOL];
}

function objectPropertiesAreSandboxProxy(o?: any): boolean
{
	if (!o || typeof o !== "object")
	{
		return false;
	
	}

	let propertiesAreSandboxProxy = isElligibleForSandbox<object>(o);

	// Recursively check all properties
	for (const key in o) 
	{
		if (Object.prototype.hasOwnProperty.call(o, key) && isElligibleForSandbox(o[key]))
		{
			propertiesAreSandboxProxy = propertiesAreSandboxProxy && objectRootIsSandboxProxy(o) && objectPropertiesAreSandboxProxy(o[key]);
		}
	}

	return propertiesAreSandboxProxy;
}

/**
 * Determines if the given object is a sandbox proxy (deep check, checks the root object and all inner objects).
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 * @returns {obj is SandboxProxy<T>} - True if the object is a sandbox proxy, false otherwise.
 */
export const isDeepSandboxProxy = <T extends object>(obj?: T): obj is SandboxProxy<T> =>
{
	const status = sandboxProxyStatus(obj, true);

	return Boolean(status.root && status.properties);
};

/**
 * Determines if the given object is a sandbox proxy (shallow check, only checks the root object).
 */
export const isShallowSandboxProxy = <T extends object>(obj?: T): obj is SandboxProxy<T> =>
{
	return objectRootIsSandboxProxy(obj);
};

/**
 * Determines if the given object is a sandbox proxy (deep check).
 */
export const isSandboxProxy = isDeepSandboxProxy;

/**
 * Determines if the given object contains a sandbox proxy at any level.
 */
export const containsSandboxProxy = <T extends object>(obj?: T): boolean => 
{
	const status = sandboxProxyStatus(obj, true);

	return Boolean(status.root || status.properties);
};

interface SandboxProxyStatus{
	root: boolean;
	properties: boolean;
}

export const sandboxProxyStatus = <T extends object>(obj?: T, recursive = true):SandboxProxyStatus  =>
{
	const rootIsSandboxProxy = objectRootIsSandboxProxy(obj);
	let propertiesAreSandboxProxy = true;
	
	if (recursive) 
	{
		propertiesAreSandboxProxy = objectPropertiesAreSandboxProxy(obj);
		if (rootIsSandboxProxy && !propertiesAreSandboxProxy)
		{
			warnIfPartialSandbox();
		}
	}
	
	return {
		root: !!rootIsSandboxProxy,
		properties: !!propertiesAreSandboxProxy,
	};
};

export const warnIfPartialSandbox = () => 
{
	console.warn("Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.");
};
