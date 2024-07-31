import { proxyStatus } from "../../../proxy-handler/proxy-status.js";
import type { FrostProxy } from "../types.js";
import { objectRootIsFrost } from "./root-is-frost.js";

/**
 * Determines if the given object is a sandbox proxy (deep check, checks the root object and all inner objects).
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 */
const isDeepFrost = <T extends object>(obj: T, mode: "some" | "every" = "every"): obj is FrostProxy<T> => 
{
	const status = proxyStatus(
		obj,
		{
			objectChecker: objectRootIsFrost,
		},
		true,
	);

	return mode === "some" ?
		Boolean(status.root || status.properties.some)
		:   Boolean(status.root && status.properties.every);
};

/**
 * Determines if the given object is a sandbox proxy (deep check).
 */
export const isFrost = isDeepFrost;
