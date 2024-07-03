import { proxyStatus } from "../../../proxy-handler/proxy-status";
import type { FrostProxy } from "../types";
import { objectRootIsFrost } from "./root-is-frost";

/**
 * Determines if the given object is a sandbox proxy (deep check, checks the root object and all inner objects).
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 */
export const isDeepFrost = <T extends object>(obj: T, mode: "some" | "every" = "every"): obj is FrostProxy<T> => 
{
	const status = proxyStatus(obj, {
		objectChecker: objectRootIsFrost,
	}, true);

	return mode === "some" 
		? Boolean(status.root || status.properties.some) 
		: Boolean(status.root && status.properties.every);
};

/**
 * Determines if the given object is a sandbox proxy (shallow check, only checks the root object).
 */
export const isShallowFrost = <T extends object>(obj?: T): obj is FrostProxy<T> => 
{
	return objectRootIsFrost(obj);
};

/**
 * Determines if the given object is a sandbox proxy (deep check).
 */
export const isFrost = isDeepFrost;

/**
 * Determines if the given object contains a sandbox proxy at any level.
 */
export const containsFrost = <T extends object>(obj: T): boolean => 
{
	return isDeepFrost(obj, "some");
};
