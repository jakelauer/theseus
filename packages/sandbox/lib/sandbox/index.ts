import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import type { SandboxParams, SandboxProxy } from "./types";

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

	const changes: Record<string | symbol, any> = {};

	const params: SandboxParams = {
		mode: "modify",
		..._params,
	};
	
	const proxy = new Proxy<T>(originalObject, {
		get(target, prop) 
		{
			if (prop in changes) 
			{
				return changes[prop];
			}
			return target[prop];
		},
		set(_target, prop, value) 
		{
			changes[prop] = value;
			return true;
		},
		deleteProperty(_target, prop) 
		{
			changes[prop] = undefined;
			return true;
		},
	});

	const asSandboxProxy = proxy as SandboxProxy<T>;

	asSandboxProxy[CONSTANTS.PROP_PREFIX] = {
		id: uuidv4(),
		changes: changes,
		original: originalObject,
		params,
	};

	return proxy as T;
}

/**
 * Determines if the given object is a sandbox proxy.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 * @returns {obj is SandboxProxy<T>} - True if the object is a sandbox proxy, false otherwise.
 */
export function isSandboxProxy<T extends object>(obj: T): obj is SandboxProxy<T> 
{
	return !!(obj as any)[CONSTANTS.PROP_PREFIX];
}
