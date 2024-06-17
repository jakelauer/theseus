import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import { proxyDelete, proxyGet, proxySet } from "./proxy-traps";
import type { FrostProxy } from "./types";
import type { SandboxProxy } from "../sandbox";

function createDeepFrostProxy<T extends object>(obj: T): T 
{
	const proxy = new Proxy<T>(obj, {
		get(target, prop) 
		{
			const value = Reflect.get(target, prop);
			if (typeof value === "object" && value !== null && !isFrostProxy(value)) 
			{
				return createDeepFrostProxy(value);
			}
			return proxyGet(target, prop);
		},
		set(target, prop, value) 
		{
			return proxySet(target, prop, value);
		},
		deleteProperty(target, prop) 
		{
			return proxyDelete(target, prop);
		},
	}) as SandboxProxy<T>;

	proxy[CONSTANTS.VERIFICATION.BASIS_SYMBOL] = uuidv4();

	return proxy as Readonly<T>;
}

function isFrostProxy<T extends object>(obj: T): obj is FrostProxy<T> 
{
	return (obj as any)[CONSTANTS.VERIFICATION.BASIS_SYMBOL] !== undefined;
}

export function frost<T extends object>(originalObject: T): Readonly<T> 
{
	if (isFrostProxy(originalObject)) 
	{
		throw new Error("Cannot frost an object that is already a frost proxy.");
	}

	return createDeepFrostProxy(originalObject);
}
