import { v4 as uuidv4 } from "uuid";
import {
	proxyDelete, proxyGet, proxySet, 
} from "./proxy-traps";
import type { Sandbox } from "../sandbox";
import structuredClone from "@ungap/structured-clone";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy";
import { isFrost } from "./detect/is-frost-proxy";
import { objectRootIsFrost } from "./detect/root-is-frost";
import { CONSTANTS } from "../../constants";

function createDeepFrostProxy<T extends object>(obj: T): T 
{
	const guid = uuidv4();

	const proxy = new Proxy<T>(obj, {
		get(target, prop) 
		{
			return proxyGet(obj, target, prop, { 
				guid, 
				recursor: (value: any) => frost(value), 
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
	}) as Sandbox<T>;

	return proxy as Readonly<T>;
}


export function frost<T extends object>(originalObject: T): Readonly<T>
{
	if (isFrost(originalObject, "every") || !isElligibleForProxy(originalObject))
	{
		return originalObject;
	}

	return createDeepFrostProxy(originalObject);
}

function defrostLayer<T extends object>(obj: T): T 
{
	if (objectRootIsFrost(obj))
	{
		return obj[CONSTANTS.FROST.ORIGINAL_GETTER_SYMBOL];
	}

	console.warn("defrost called on non-frost object");

	return obj;
}

export function defrost<T extends object>(obj: T): T 
{
	const root = defrostLayer(obj);
	
	for (const key in root)
	{
		const innerValue = root[key];
		if (isElligibleForProxy(innerValue))
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
	
	// This is just a getter in the original object, which means it appears in the clone
	// as a normal property. We need to remove it.
	delete (clone as any)[CONSTANTS.FROST.BASIS_SYMBOL];

	return frost(clone);
}
