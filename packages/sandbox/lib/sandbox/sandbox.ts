import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import type { Metadata, SandboxParams } from "./types";
import { isSandboxProxy } from "./is-sandbox-proxy";

/**
 * Creates a sandbox proxy for the given object, allowing changes to be tracked
 * without modifying the original object.
 *
 * @template T - The type of the original object.
 * @param {T} originalObject - The object to create a sandbox proxy for.
 * @returns {T} - The sandbox proxy object.
 */
export function sandbox<T extends object>(originalObject: T, _params?: Partial<SandboxParams>): T 
{
	if (isSandboxProxy(originalObject)) 
	{
		return originalObject;
	}

	const params: SandboxParams = {
		mode: "modify",
		..._params,
	};

	return createDeepProxy(originalObject, params);
}

function addToProxyMap<T extends object>(proxyMap: WeakMap<object, object>, obj: object, metadata: Metadata<T>)
{
	const proxy = createProxy(obj, proxyMap, metadata.params);
	proxyMap.set(obj, proxy);
}

function createDeepProxy<T extends object>(obj: T, params: SandboxParams): T 
{
	const proxyMap = new WeakMap<object, object>();
	return createProxy(obj, proxyMap, params);
}

function createProxy<T extends object>(obj: T, proxyMap: WeakMap<object, object>, params: SandboxParams): T 
{
	const metadata = createMetadata(obj, params);

	const proxy = new Proxy<T>(obj, {
		get(target, prop, receiver) 
		{
			return handleGet(target, prop, receiver, metadata, proxyMap);
		},
		set(_target, prop, value) 
		{
			return handleSet(prop, value, metadata, proxyMap);
		},
		deleteProperty(_target, prop) 
		{
			return handleDelete(prop, metadata);
		},
	});

	proxyMap.set(obj, proxy);

	for (const [key, value] of Object.entries(obj)) 
	{
		if (isValidObject(value)) 
		{
			proxy[key as keyof T] = createProxy(value, proxyMap, params);
		}
	}

	return proxy;
}

function isValidObject(obj: any)
{
	const type = typeof obj;
	return type === "function" || type === "object" && !!obj;
}

function createMetadata<T extends object>(obj: T, params: SandboxParams): Metadata<T>
{
	return {
		id: uuidv4(),
		changes: {},
		original: obj,
		params,
	};
}

function handleGet<T extends object>(target: T, prop: string | symbol, receiver: any, metadata: Metadata<T>, proxyMap: WeakMap<object, object>) 
{
	if (prop in metadata.changes) 
	{
		return metadata.changes[prop as string];
	}

	if (prop === CONSTANTS.SANDBOX_SYMBOL) 
	{
		return metadata;
	}

	const value = Reflect.get(target, prop, receiver);
	if (typeof value === "object" && value !== null && !isSandboxProxy(value)) 
	{
		if (!proxyMap.has(value)) 
		{
			addToProxyMap<T>(proxyMap, value, metadata);
		}
		return proxyMap.get(value);
	}

	return value;
}

function handleSet(prop: string | symbol, value: any, metadata: any, proxyMap: WeakMap<object, object>) 
{
	if (typeof value === "object" && value !== null && !isSandboxProxy(value)) 
	{
		value = createProxy(value, proxyMap, metadata.params);
	}

	const symbolsSkipSet = {
		[CONSTANTS.SANDBOX_SYMBOL]: true,
		[CONSTANTS.VERIFICATION.BASIS_SYMBOL]: true,
		[CONSTANTS.SETTER_SYMBOL]: true,
	};

	const isSpecialSymbol = typeof prop === "symbol" && Object.getOwnPropertySymbols(symbolsSkipSet).includes(prop);

	// make sure prop isn't one of the special symbols
	if (!isSpecialSymbol)
	{
		metadata.changes[prop] = value;
	}

	return true;
}

function handleDelete(prop: string | symbol, metadata: any) 
{
	metadata.changes[prop] = CONSTANTS.DELETION_SYMBOL;
	return true;
}

export const __test__ = {
	addToProxyMap,
};
