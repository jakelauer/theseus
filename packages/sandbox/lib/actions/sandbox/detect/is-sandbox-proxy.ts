import { proxyStatus } from "../../../proxy-handler/proxy-status";
import type { Sandbox } from "../types";
import { objectRootIsSandbox } from "./root-is-sandbox";

/**
 * Determines if the given object is a sandbox proxy (deep check, checks the root object and all inner objects).
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 * @returns {obj is Sandbox<T>} - True if the object is a sandbox proxy, false otherwise.
 */
export const isDeepSandbox = <T extends object>(obj: T, mode: "some" | "every" = "every"): obj is Sandbox<T> => 
{
	const status = proxyStatus(obj, {
		objectChecker: objectRootIsSandbox,
	}, true);

	return mode === "some" 
		? Boolean(status.root || status.properties.some) 
		: Boolean(status.root && status.properties.every);
};

/**
 * Determines if the given object is a sandbox proxy (shallow check, only checks the root object).
 */
export const isShallowSandbox = <T extends object>(obj?: T): obj is Sandbox<T> => 
{
	return objectRootIsSandbox(obj);
};

/**
 * Determines if the given object is a sandbox proxy (deep check).
 */
export const isSandbox = isDeepSandbox;

/**
 * Determines if the given object contains a sandbox proxy at any level.
 */
export const containsSandbox = <T extends object>(obj: T): boolean => 
{
	return isDeepSandbox(obj, "some");
};
