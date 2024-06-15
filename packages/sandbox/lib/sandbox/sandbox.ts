import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";
import type { SandboxParams } from "./types";
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

	function createDeepProxy<T extends object>(obj: T): T 
	{
		const metadata = {
			id: uuidv4(),
			changes: {},
			original: obj,
			params,
		};

		const proxy = new Proxy<T>(obj, {
			get(target, prop, receiver) 
			{
				if (prop in metadata.changes) 
				{
					return metadata.changes[prop];
				}

				if (prop === CONSTANTS.SANDBOX_SYMBOL)
				{
					return metadata;
				}

				const value = Reflect.get(target, prop, receiver);
				if (typeof value === "object" && value !== null && !isSandboxProxy(value)) 
				{
					return createDeepProxy(value);
				}
				return value;
			},
			set(_target, prop, value) 
			{
				metadata.changes[prop] = value;
				return true;
			},
			deleteProperty(_target, prop) 
			{
				metadata.changes[prop] = undefined;
				return true;
			},
		});

		return proxy;
	}

	return createDeepProxy(originalObject);
}
