import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import { proxyDelete, proxyGet, proxySet } from "./proxy-traps";

function createDeepFrostProxy<T extends object>(obj: T): T 
{
	const proxy = new Proxy<T>(obj, {
		get(target, prop) 
		{
			const value = Reflect.get(target, prop);
			if (typeof value === "object" && value !== null && !value[CONSTANTS.VERIFICATION.BASIS_SYMBOL]) 
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
	});

	proxy[CONSTANTS.VERIFICATION.BASIS_SYMBOL] = uuidv4();

	return proxy as Readonly<T>;
}

export function frost<T extends object>(originalObject: T): Readonly<T> 
{
	if (originalObject[CONSTANTS.VERIFICATION.BASIS_SYMBOL]) 
	{
		throw new Error("Cannot frost an object that is already a frost proxy.");
	}

	return createDeepFrostProxy(originalObject);
}
