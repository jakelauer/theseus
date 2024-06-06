import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import { proxyDelete, proxyGet, proxySet } from "./proxy-traps";

export function frost<T extends object>(originalObject: T)
{
	if (originalObject[CONSTANTS.VERIFICATION.BASIS_SYMBOL])
	{
		throw new Error("Cannot frost an object that is already a frost proxy.");
	}

	const proxy = new Proxy<T>(originalObject, {
		get: proxyGet,
		set: proxySet,
		deleteProperty: proxyDelete,
	});

	proxy[CONSTANTS.VERIFICATION.BASIS_SYMBOL] = uuidv4();

	return proxy as Readonly<T>;
}
