import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import { proxyDelete, proxyGet, proxySet } from "./proxy-traps";

export function frost<T extends object>(originalObject: T)
{
	const proxy = new Proxy<T>(originalObject, {
		get: proxyGet,
		set: proxySet,
		deleteProperty: proxyDelete,
	});

	proxy[CONSTANTS.VERIFICATION.BASIS_SYMBOL] = uuidv4();

	return proxy;
}
