import { CONSTANTS } from "../constants";
import isElligibleForSandbox from "../validity/is-elligible-for-sandbox";
import type { SandboxProxy } from "./types";

export function objectRootIsSandboxProxy(o?: any): boolean 
{
	return isElligibleForSandbox(o) && !!o[CONSTANTS.SANDBOX_SYMBOL];
}

// function objectPropertiesAreSandboxProxy(o?: any): SandboxProxyStatus<true>["properties"] 
// {
// 	const elligibleWithKeys = (obj: any) => isElligibleForSandbox(obj);

// 	const rootElligibleWithKeys = elligibleWithKeys(o);

// 	let allropertiesAreSandboxProxy = rootElligibleWithKeys;
// 	let anyPropertiesAreSandboxProxy = false;

// 	if (rootElligibleWithKeys) 
// 	{
// 		// Recursively check all properties
// 		for (const key in o) 
// 		{
// 			if (Object.prototype.hasOwnProperty.call(o, key) && isElligibleForSandbox(o[key])) 
// 			{
// 				const root = objectRootIsSandboxProxy(o);
// 				const properties = objectPropertiesAreSandboxProxy(o[key]);
// 				allropertiesAreSandboxProxy =
//                     allropertiesAreSandboxProxy && root && (properties.all || !properties.elligible);
// 				anyPropertiesAreSandboxProxy =
//                     anyPropertiesAreSandboxProxy || root || properties.any || !properties.elligible;
// 			}
// 		}
// 	}

// 	return {
// 		all: allropertiesAreSandboxProxy,
// 		any: anyPropertiesAreSandboxProxy,
// 		elligible: rootElligibleWithKeys,
// 	};
// }

function objectPropertiesAreSandboxProxy(obj: any): SandboxProxyStatus<true>["properties"] 
{
	let some = false;
	let every = true;

	function recursiveCheck(o: any) 
	{
		if (isElligibleForSandbox(o)) 
		{
			if (objectRootIsSandboxProxy(o)) 
			{
				some = true;
			}
			else 
			{
				every = false;
			}
			
			for (const key in o) 
			{
				if (Object.prototype.hasOwnProperty.call(o, key)) 
				{
					recursiveCheck(o[key]);
				}
			}
		}
		else if (Array.isArray(o)) 
		{
			for (let i = 0; i < o.length; i++) 
			{
				recursiveCheck(o[i]);
			}
		}
	}

	recursiveCheck(obj);

	return {
		every: every,
		some: some,
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

	return Boolean(status.root && status.properties.every);
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

	return Boolean(status.root || status.properties.some);
};

interface SandboxProxyStatusAll {
    root: boolean;
    properties: {
        every: boolean;
        some: boolean;
    };
}

type SandboxProxyStatus<TRecursive> =
    TRecursive extends true ? SandboxProxyStatusAll : Omit<SandboxProxyStatusAll, "properties">;

export const sandboxProxyStatus = <T extends object, TRecursive extends boolean>(
	obj?: T,
	recursive: TRecursive = true as TRecursive,
): SandboxProxyStatus<TRecursive> => 
{
	const rootIsSandboxProxy = objectRootIsSandboxProxy(obj);

	if (!recursive) 
	{
		return {
			root: rootIsSandboxProxy,
		} as SandboxProxyStatus<TRecursive>;
	}

	let propertiesAreSandboxProxy: SandboxProxyStatus<true>["properties"] | undefined;

	if (recursive) 
	{
		propertiesAreSandboxProxy = objectPropertiesAreSandboxProxy(obj);
		if (rootIsSandboxProxy && !propertiesAreSandboxProxy.every) 
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
	console.warn(
		"Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.",
	);
};
