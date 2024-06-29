import { CONSTANTS } from "../constants";
import isElligibleForSandbox from "../validity/is-elligible-for-sandbox";
import type { SandboxProxy } from "./types";

export function objectRootIsSandboxProxy(o?: any): boolean 
{
	return isElligibleForSandbox(o) && !!o[CONSTANTS.SANDBOX_SYMBOL];
}

function objectPropertiesAreSandboxProxy(o?: any): SandboxProxyStatus<true>["properties"]
{
	const elligibleWithKeys = (obj: any) => isElligibleForSandbox<object>(obj) && Object.keys(obj).length > 0;

	const rootElligibleWithKeys = elligibleWithKeys(o);

	let allropertiesAreSandboxProxy = rootElligibleWithKeys;
	let anyPropertiesAreSandboxProxy = rootElligibleWithKeys;

	if (rootElligibleWithKeys)
	{
		// Recursively check all properties
		for (const key in o) 
		{
			if (Object.prototype.hasOwnProperty.call(o, key) && elligibleWithKeys(o[key]))
			{
				const root = objectRootIsSandboxProxy(o);
				const properties = objectPropertiesAreSandboxProxy(o[key]);
				allropertiesAreSandboxProxy = allropertiesAreSandboxProxy && root && (properties.all || !properties.elligible);
				anyPropertiesAreSandboxProxy = anyPropertiesAreSandboxProxy || root || (properties.any || !properties.elligible);
			}
		}
	}

	return {
		all: allropertiesAreSandboxProxy,
		any: anyPropertiesAreSandboxProxy,
		elligible: rootElligibleWithKeys,
	};
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

	return Boolean(status.root && status.properties.all);
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

	return Boolean(status.root || status.properties.any);
};

interface SandboxProxyStatusAll{
	root: boolean;
	properties: {
		all: boolean;
		any: boolean;
		elligible: boolean;
	};
}

type SandboxProxyStatus<TRecursive> = TRecursive extends true ? SandboxProxyStatusAll : Omit<SandboxProxyStatusAll, "properties">;

export const sandboxProxyStatus = <T extends object, TRecursive extends boolean>(
	obj?: T, 
	recursive: TRecursive = true as TRecursive,
): SandboxProxyStatus<TRecursive>  =>
{
	const rootIsSandboxProxy = objectRootIsSandboxProxy(obj);

	if (!recursive)
	{
		return {
			root: rootIsSandboxProxy,
		} as SandboxProxyStatus<TRecursive>;
	}

	const isElligible = isElligibleForSandbox(obj);

	let propertiesAreSandboxProxy = {
		all: isElligible,
		any: isElligible,
		elligible: isElligibleForSandbox(obj),
	};
	
	if (recursive) 
	{
		propertiesAreSandboxProxy = objectPropertiesAreSandboxProxy(obj);
		if (rootIsSandboxProxy && !propertiesAreSandboxProxy.all && propertiesAreSandboxProxy.elligible)
		{
			warnIfPartialSandbox();
		}
	}
	
	return {
		root: rootIsSandboxProxy,
		properties: propertiesAreSandboxProxy,
	} as SandboxProxyStatus<TRecursive>;
};

export const warnIfPartialSandbox = () => 
{
	console.warn("Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.");
};
