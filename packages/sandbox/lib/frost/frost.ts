import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import {
	proxyDelete, proxyGet, proxySet, 
} from "./proxy-traps";
import type { FrostProxy } from "./types";
import type { SandboxProxy } from "../sandbox";
import structuredClone from "@ungap/structured-clone";
import isElligibleForSandbox from "../validity/is-elligible-for-sandbox";

function createDeepFrostProxy<T extends object>(obj: T): T 
{
	const guid = uuidv4();

	const proxy = new Proxy<T>(obj, {
		get(target, prop) 
		{
			return proxyGet(obj, target, prop, { 
				guid, 
				recursor: (value: any) => createDeepFrostProxy(value), 
			});
		},
		set(target, prop, value) 
		{
			return proxySet(target, prop, value, {
				proxy,
			});
		},
		deleteProperty(target, prop) 
		{
			return proxyDelete(target, prop, {
				proxy,
			});
		},
	}) as SandboxProxy<T>;

	return proxy as Readonly<T>;
}

export function isFrostProxy<T extends object>(obj: T): obj is FrostProxy<T> 
{
	return (obj as any)[CONSTANTS.FROST.BASIS_SYMBOL] !== undefined;
}

export function frost<T extends object>(originalObject: T): Readonly<T> 
{
	if (isFrostProxy(originalObject)) 
	{
		return originalObject;
	}

	return createDeepFrostProxy(originalObject);
}

function defrostLayer<T extends object>(obj: T): T 
{
	if (isFrostProxy(obj))
	{
		return obj[CONSTANTS.FROST.ORIGINAL_GETTER_SYMBOL];
	}

	console.warn("defrost called on non-frost object");

	return obj;
}

export function defrost<T extends object>(obj: T): T 
{
	// Recursively defrost the object
	// if (isFrostProxy(obj))
	// {
	// 	for (const key in obj)
	// 	{
	// 		obj[key] = defrost(obj[key]);
	// 	}
	// }

	const root = defrostLayer(obj);
	
	for (const key in root)
	{
		const innerValue = root[key];
		if (isElligibleForSandbox<object>(innerValue))
		{
			root[key] = defrost(innerValue);
		}
	}

	return root;
}

export function frostClone<T extends object>(originalObject: T): Readonly<T> 
{
	const clone = structuredClone(originalObject, {
		lossy: false, 
	});
	delete (clone as any)[CONSTANTS.FROST.BASIS_SYMBOL];

	return frost(clone);
}
