import { v4 as uuidv4 } from "uuid";
import {
	proxyDelete, proxyGet, proxySet, 
} from "./proxy-traps/index.js";
import type { Sandbox } from "../sandbox/index.js";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy.js";
import { isFrost } from "./detect/is-frost.js";

/**
 * Any attempt to set a value on the original object is blocked, unless it is set using frost's required setter symbol.
 * This is to prevent the original object from being modified in any way by normal means, while still allowing sandbox
 * to modify it via cementing.
 *
 * The pattern is as such:
 *
 * == Normal development (blocked) ==
 *
 * const original = { a: 1 };
 * const frosty = frost(original);
 * frosty.a = 2; // Error
 *
 * == Sandbox/cement development (allowed) ==
 *
 * const original = { a: 1 };
 * const frosty = frost(original);
 * const sandbox = createSandbox(frosty);
 *
 * console.log(original.a, frosty.a, sandbox.a); // 1, 1, 1
 *
 * // Allowed, but only affects the sandboxed object
 * sandbox.a = 2;
 * console.log(original.a, frosty.a, sandbox.a); // 1, 1, 2
 *
 * // Allowed, but only affects the sandboxed object
 * cement(sandbox);
 * console.log(original.a, frosty.a, sandbox.a); // 2, 2, 2
 *
 */
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
