import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import {
	proxyDelete, proxyGet, proxySet, 
} from "./proxy-traps";
import type { FrostProxy } from "./types";
import type { SandboxProxy } from "../sandbox";
import structuredClone from "@ungap/structured-clone";

function createDeepFrostProxy<T extends object>(obj: T): T 
{
	const guid = uuidv4();

	const proxy = new Proxy<T>(obj, {
		get(target, prop) 
		{
			return proxyGet(target, prop, { 
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

export function frostClone<T extends object>(originalObject: T): Readonly<T> 
{
	const clone = structuredClone(originalObject, {
		lossy: false, 
	});
	delete (clone as any)[CONSTANTS.FROST.BASIS_SYMBOL];

	return frost(clone);
}
